import { db } from "@/lib/db";
import SetupForm from "@/components/SetupForm";
import LoaderScreen from "@/components/screens/LoaderScreen"; 
import OriginalTheme from "@/components/OriginalTheme";
// 👆 ye tumhari REAL theme ka wrapper hoga

export default async function QRPage({ params }) {
  const { qr_id } = await params;

  // 1️⃣ Check QR exists
  const [master] = await db.query(
    "SELECT is_used FROM qr_master WHERE qr_id = ?",
    [qr_id]
  );

  if (master.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <h2>❌ Invalid QR Code</h2>
        <p>Please scan the QR provided with your gift.</p>
      </div>
    );
  }

  // 2️⃣ Check QR data
  const [data] = await db.query(
    "SELECT name, age, photos FROM qr_data WHERE qr_id = ?",
    [qr_id]
  );


  // 3️⃣ Already activated → SHOW ORIGINAL THEME
  if (data.length > 0) {
    return (
    <OriginalTheme
      name={data[0].name}
      age={data[0].age}
      photos={JSON.parse(data[0].photos || "[]")}
    />
  );
  }

  // 4️⃣ Valid but not activated → show form
  return <SetupForm qrId={qr_id} />;
}
