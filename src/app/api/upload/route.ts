import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { extname } from "path";

// Magic numbers for common image formats
export const MAGIC_NUMBERS: Record<string, Buffer | null> = {
  '.png': Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
  '.jpg': Buffer.from([0xFF, 0xD8, 0xFF]),
  '.jpeg': Buffer.from([0xFF, 0xD8, 0xFF]),
  '.gif': Buffer.from([0x47, 0x49, 0x46, 0x38]), // GIF87a or GIF89a
  '.webp': Buffer.from([0x52, 0x49, 0x46, 0x46]), // Starts with RIFF
  '.svg': null, // SVG is text-based, no magic number
};

export function validateFileContent(buffer: Buffer, ext: string): boolean {
  const magic = MAGIC_NUMBERS[ext];
  if (!magic) return true; // Skip validation for formats without magic numbers
  return buffer.slice(0, magic.length).equals(magic);
}

export function validateSvgContent(buffer: Buffer): { valid: boolean; error?: string } {
  const svgContent = buffer.toString('utf-8').toLowerCase();
  const dangerousTags = ['<script', 'onload=', 'onerror=', 'onclick='];
  for (const tag of dangerousTags) {
    if (svgContent.includes(tag)) {
      return { valid: false, error: "SVG contains potentially dangerous content" };
    }
  }
  return { valid: true };
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const maxFileSize = parseInt(
    process.env.MAX_FILE_SIZE || "10485760",
    10
  );
  const uploadDir = process.env.UPLOAD_DIR || "./uploads";

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > maxFileSize) {
    return NextResponse.json(
      { error: `File too large. Max size: ${maxFileSize / 1024 / 1024}MB` },
      { status: 413 }
    );
  }

  // Allowlist of permitted extensions and MIME types
  const ALLOWED_EXTENSIONS = new Set([
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg",
    ".pdf", ".txt", ".md", ".json", ".csv",
    ".js", ".ts", ".jsx", ".tsx", ".py", ".go", ".rs", ".rb", ".java", ".c", ".cpp", ".h",
    ".html", ".css", ".xml", ".yaml", ".yml", ".toml", ".sh",
    ".zip", ".tar", ".gz",
  ]);
  const ext = extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      { error: `File type not allowed: ${ext || "unknown"}` },
      { status: 415 }
    );
  }

  const userDir = join(process.cwd(), uploadDir, session.user.id);
  const storedName = `${randomUUID()}${ext}`;
  const storedPath = join(userDir, storedName);

  try {
    await mkdir(userDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate file content matches extension
    if (!validateFileContent(buffer, ext)) {
      return NextResponse.json(
        { error: "File content does not match extension" },
        { status: 415 }
      );
    }

    // For SVG files, check for script tags (basic XSS prevention)
    if (ext === '.svg') {
      const svgValidation = validateSvgContent(buffer);
      if (!svgValidation.valid) {
        return NextResponse.json(
          { error: svgValidation.error },
          { status: 415 }
        );
      }
    }

    await writeFile(storedPath, buffer);
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  // Return the relative path (userId/filename) — stored in Asset.filePath
  const relativePath = `${session.user.id}/${storedName}`;

  return NextResponse.json({
    filePath: relativePath,
    fileName: file.name,
    mimeType: file.type,
    fileSize: file.size,
  });
}
