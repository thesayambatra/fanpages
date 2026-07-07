"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function BulkAddChannels() {
  const [open, setOpen] = useState(false);
  const [urls, setUrls] = useState("");
  const [category, setCategory] = useState("JEE");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ url: string; status: string }[]>([]);
  const router = useRouter();

  const handleBulkAdd = async () => {
    const lines = urls.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    setLoading(true);
    setResults([]);
    const newResults: { url: string; status: string }[] = [];

    for (const url of lines) {
      try {
        const res = await fetch("/api/channels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, category, notes: "" }),
        });
        const data = await res.json();
        if (res.ok) {
          newResults.push({ url, status: "✅ Added" });
        } else {
          newResults.push({ url, status: `❌ ${data.error}` });
        }
      } catch {
        newResults.push({ url, status: "❌ Failed" });
      }
      setResults([...newResults]);
    }

    setLoading(false);
    router.refresh();
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-outline btn-sm">
        📋 Bulk Add
      </button>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>📋 Bulk Add Channels</h3>
        <button onClick={() => setOpen(false)} className="btn-outline btn-sm">✕ Close</button>
      </div>
      <div className="space-y-3">
        <textarea
          value={urls}
          onChange={e => setUrls(e.target.value)}
          placeholder="Paste YouTube URLs (one per line)&#10;https://www.youtube.com/@channel1&#10;https://www.youtube.com/@channel2&#10;..."
          className="form-input w-full"
          rows={8}
          style={{ resize: "vertical" }}
        />
        <div className="flex items-center gap-3">
          <select value={category} onChange={e => setCategory(e.target.value)} className="form-input">
            <option value="JEE">JEE</option>
            <option value="K12">K12</option>
            <option value="UPSC">UPSC</option>
            <option value="NEET">NEET</option>
          </select>
          <button onClick={handleBulkAdd} disabled={loading} className="btn-primary">
            {loading ? `Adding... (${results.length}/${urls.split("\n").filter(l => l.trim()).length})` : "Add All Channels"}
          </button>
          <span className="text-xs text-[var(--muted)]">{urls.split("\n").filter(l => l.trim()).length} URLs</span>
        </div>

        {results.length > 0 && (
          <div className="mt-3 max-h-48 overflow-y-auto space-y-1">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs p-1 rounded" style={{ background: "rgba(255,255,255,0.02)" }}>
                <span>{r.status}</span>
                <span className="text-[var(--muted)] truncate">{r.url}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
