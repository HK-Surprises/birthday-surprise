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
  const age = Number(formData.get("age"));
  const photos = formData.getAll("photos");
  const song = formData.get("song");


  // safety check
  const qrCheck = await db.query(
    "SELECT is_used FROM qr_master WHERE qr_id = $1 AND is_used = false",
    [qrId]
  );

  if (qrCheck.rows.length === 0) {
    return NextResponse.json(
      { error: "Invalid or already used QR" },
      { status: 400 }
    );
  }

  const photoUrls = [];

  for (const file of photos) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const upload = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: `qr/${qrId}` },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      ).end(buffer);
    });

    photoUrls.push(upload.secure_url);
  }

  await db.query(
    "INSERT INTO qr_data (qr_id, name, age, photos, song) VALUES ($1, $2, $3, $4::jsonb, $5)",
    [qrId, name, age, JSON.stringify(photoUrls), song]
  );



  await db.query(
    "UPDATE qr_master SET is_used = true WHERE qr_id = $1",
    [qrId]
  );

  return NextResponse.json({ success: true });
}
