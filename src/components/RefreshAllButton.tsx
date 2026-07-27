"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function RefreshAllButton() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const router = useRouter();

  const refreshAll = async () => {
    setLoading(true);
    setProgress("Refreshing...");
    const res = await fetch("/api/channels");
    const channels = await res.json();
    let done = 0;
    for (const ch of channels) {
      try {
        await fetch(`/api/channels/${ch.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: true }),
        });
        done++;
        setProgress(`${done}/${channels.length}`);
      } catch {}
    }
    setLoading(false);
    setProgress("");
    router.refresh();
  };

  return (
    <button onClick={refreshAll} disabled={loading} className="btn-outline btn-sm">
      {loading ? `↻ ${progress}` : "↻ Refresh All"}
    </button>
  );
}
