import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join } from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path } = await params;
  const filePath = path.join("/");

  // Security: verify the file belongs to the requesting user
  if (!filePath.startsWith(session.user.id + "/")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  const uploadsRoot = join(process.cwd(), uploadDir);
  const fullPath = join(uploadsRoot, filePath);

  // Prevent path traversal
  if (!fullPath.startsWith(uploadsRoot + "/") && fullPath !== uploadsRoot) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const fileStat = await stat(fullPath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const buffer = await readFile(fullPath);

    // Determine content type from extension
    const ext = fullPath.split(".").pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
      pdf: "application/pdf",
      json: "application/json",
      txt: "text/plain",
    };
    const contentType = contentTypes[ext ?? ""] || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileStat.size.toString(),
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
