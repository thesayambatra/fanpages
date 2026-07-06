"use client";
import { useState, useEffect } from "react";

function fmt(n: number) { return (n || 0).toLocaleString(); }

export function SavedReelsView() {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReels(); }, []);

  const fetchReels = async () => {
    const res = await fetch("/api/saved-reels");
    const data = await res.json();
    setReels(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const deleteReel = async (id: number) => {
    if (!confirm("Remove from saved?")) return;
    await fetch(`/api/saved-reels/${id}`, { method: "DELETE" });
    fetchReels();
  };

  return (
    <>
      <div className="page-header"><h2>💾 Saved Videos</h2></div>

      {loading ? (
        <div className="card text-center py-10 text-[var(--muted)]">Loading...</div>
      ) : reels.length === 0 ? (
        <div className="card text-center py-10 text-[var(--muted)]">
          <div className="text-4xl mb-3">💾</div>
          <p>No saved videos yet. Click the 💾 button on any video to save it here.</p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {reels.map((r) => (
            <div key={r.id} className="channel-card">
              {r.thumbnail && <img src={r.thumbnail} className="ch-thumb" alt="" />}
              <div className="ch-info">
                <a href={r.url} target="_blank" className="ch-name">{r.title || "Untitled"}</a>
                <div className="text-xs text-[var(--muted)] mt-1">{r.channelName}</div>
                <div className="ch-stats">
                  <span>👁 {fmt(r.views)}</span>
                  <span>👍 {fmt(r.likes)}</span>
                  <span>💬 {fmt(r.comments)}</span>
                </div>
                {r.published && <div className="ch-date">Published: {r.published}</div>}
                {r.tag && <span className="tag mt-2">{r.tag}</span>}
                {r.reviewerNote && <p className="text-xs mt-2 text-[var(--muted)] italic">📝 {r.reviewerNote}</p>}
              </div>
              <div className="ch-actions">
                <button onClick={() => deleteReel(r.id)} className="btn-icon danger" title="Remove">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
