import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  const formData = await req.formData();

  const qrId = formData.get("qrId");
  const name = formData.get("name");
  const age = formData.get("age");
  const photos = formData.getAll("photos");

  const photoUrls = [];

  for (const file of photos) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `qr/${qrId}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    photoUrls.push(uploadResult.secure_url);
  }

  // Save to DB
  await db.query(
    "INSERT INTO qr_data (qr_id, name, age, photos) VALUES (?, ?, ?, ?)",
    [qrId, name, age, JSON.stringify(photoUrls)]
  );

  await db.query(
    "UPDATE qr_master SET is_used = TRUE WHERE qr_id = ?",
    [qrId]
  );

  return NextResponse.json({ success: true });
}
