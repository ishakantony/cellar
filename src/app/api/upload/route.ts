import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { extname } from "path";

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

  const userDir = join(process.cwd(), uploadDir, session.user.id);

  const ext = extname(file.name);
  const storedName = `${randomUUID()}${ext}`;
  const storedPath = join(userDir, storedName);

  try {
    await mkdir(userDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
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
