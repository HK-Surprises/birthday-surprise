"use client";

import { useState, useRef } from "react";

const SONG_MAP = {
  birthday1: "/songs/birthday1.mp3",
  birthday2: "/songs/birthday2.mp3",
  birthday3: "/songs/birthday3.mp3",
  birthday4: "/songs/birthday4.mp4",
  birthday5: "/songs/birthday5.mp5",
};

export default function SetupForm({ qrId }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [photos, setPhotos] = useState([]);
  const [song, setSong] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef(null);

  // ▶ Play / ⏸ Pause preview
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    // stop preview music
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const formData = new FormData();
    formData.append("qrId", qrId);
    formData.append("name", name);
    formData.append("age", age);
    formData.append("song", song);

    for (let i = 0; i < photos.length; i++) {
      formData.append("photos", photos[i]);
    }

    await fetch("/api/activate-qr", {
      method: "POST",
      body: formData,
    });

    window.location.reload();
  }

  const songSrc = SONG_MAP[song];

  return (
    <div style={{ padding: 20 }}>
      <h2>Activate QR</h2>

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br /><br />

        {/* Age */}
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
        />
        <br /><br />

        {/* Photos */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setPhotos(e.target.files)}
          required
        />
        <br /><br />

        {/* Song Select */}
        <select
          value={song}
          onChange={(e) => {
            setSong(e.target.value);
            setIsPlaying(false);
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
          }}
          required
        >
          <option value="">Select Song</option>
          <option value="birthday1">Happy Birthday 1 🎂</option>
          <option value="birthday2">Happy Birthday 2 🎂</option>
          <option value="birthday3">Happy Birthday 3 🎂</option>
          <option value="birthday4">Happy Birthday 4 🎂</option>
          <option value="birthday5">Happy Birthday 5 🎂</option>
        </select>

        {/* ▶ Play / Pause Preview */}
        {songSrc && (
          <>
            <br /><br />
            <button
              type="button"
              onClick={togglePlay}
              style={{ marginRight: 10 }}
            >
              {isPlaying ? "⏸ Pause Song" : "▶ Play Song"}
            </button>

            <audio
              ref={audioRef}
              src={songSrc}
              onEnded={() => setIsPlaying(false)}
            />
          </>
        )}

        <br /><br />

        <button disabled={loading}>
          {loading ? "Saving..." : "Activate QR"}
        </button>
      </form>
    </div>
  );
}
