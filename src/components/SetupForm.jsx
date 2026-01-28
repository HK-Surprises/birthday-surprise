"use client";

import { useState } from "react";

export default function SetupForm({ qrId }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("qrId", qrId);
    formData.append("name", name);
    formData.append("age", age);

    for (let i = 0; i < photos.length; i++) {
      formData.append("photos", photos[i]);
    }

    await fetch("/api/activate-qr", {
      method: "POST",
      body: formData,
    });

    window.location.reload();
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Activate QR</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setPhotos(e.target.files)}
          required
        />
        <br /><br />

        <button disabled={loading}>
          {loading ? "Saving..." : "Activate QR"}
        </button>
      </form>
    </div>
  );
}
