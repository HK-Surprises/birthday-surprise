import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req) {
  const formData = await req.formData();

  const qrId = formData.get("qrId");
  const name = formData.get("name");
  const age = formData.get("age");
  const files = formData.getAll("photos");

  // Validate QR
  const [qr] = await db.query(
    "SELECT * FROM qr_master WHERE qr_id = ? AND is_used = FALSE",
    [qrId]
  );

  if (qr.length === 0) {
    return NextResponse.json({ error: "Invalid QR" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public/uploads");
  const photoPaths = [];

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);
    photoPaths.push(`/uploads/${filename}`);
  }

  // Save to DB
  await db.query(
    "INSERT INTO qr_data (qr_id, name, age, photos) VALUES (?, ?, ?, ?)",
    [qrId, name, age, JSON.stringify(photoPaths)]
  );

  await db.query(
    "UPDATE qr_master SET is_used = TRUE WHERE qr_id = ?",
    [qrId]
  );

  return NextResponse.json({ success: true });
}
