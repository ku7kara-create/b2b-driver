import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const uploaded: string[] = [];

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${file.name}`;
      await writeFile(join(uploadDir, filename), buffer);
      uploaded.push(filename);
    }

    return NextResponse.json({ files: uploaded });
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json({ error: "فشل رفع الملفات" }, { status: 500 });
  }
}
