"use client";
import { useState } from "react";

interface VideoData {
  videoId: string;
  title: string;
  channelName: string;
  thumbnail?: string;
  url: string;
  views?: number;
  likes?: number;
  comments?: number;
  published?: string;
}

export function SaveVideoButton({ video }: { video: VideoData }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    const res = await fetch("/api/saved-reels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(video),
    });
    const data = await res.json();
    setLoading(false);
    if (data.status === "saved" || data.status === "already_saved") {
      setSaved(true);
    }
  };

  if (saved) {
    return <span className="text-xs text-green-400" title="Saved">✅</span>;
  }

  return (
    <button
      onClick={save}
      disabled={loading}
      className="btn-icon"
      title="Save Video"
      style={{ width: 24, height: 24, fontSize: 11 }}
    >
      {loading ? "⏳" : "💾"}
    </button>
  );
}
