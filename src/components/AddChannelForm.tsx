"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["JEE", "K12", "UPSC", "NEET"];

export function AddChannelForm() {
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, category, notes }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setUrl(""); setCategory(""); setNotes("");
      setMsg("Channel added!");
      router.refresh();
    } else {
      setMsg(data.error || "Error adding channel");
    }
  };

  return (
    <div className="card">
      <h3 className="text-sm font-semibold mb-3 text-[var(--muted)] uppercase tracking-wide">Add New Channel</h3>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap">
        <input
          type="text" placeholder="YouTube URL or @handle or Channel ID"
          value={url} onChange={e => setUrl(e.target.value)}
          required className="form-input flex-[2] min-w-[200px]"
        />
        <select value={category} onChange={e => setCategory(e.target.value)} className="form-input">
          <option value="">Category</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="text" placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} className="form-input" />
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Adding..." : "Add Channel"}
        </button>
      </form>
      {msg && <p className="mt-2 text-sm text-[var(--muted)]">{msg}</p>}
    </div>
  );
}
