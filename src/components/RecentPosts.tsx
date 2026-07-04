"use client";
import { useState, useEffect } from "react";

function fmt(n: number) { return (n || 0).toLocaleString(); }
function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function RecentPosts() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState(1);
  const [fetched, setFetched] = useState(false);

  const fetchData = async (days?: number) => {
    const d = days ?? period;
    setLoading(true);
    const res = await fetch(`/api/recent-posts?days=${d}`);
    const json = await res.json();
    setVideos(json.videos || []);
    setLoading(false);
    setFetched(true);
  };

  const selectPeriod = (d: number) => {
    setPeriod(d);
    fetchData(d);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>🆕 Recent Posts</h3>
        <div className="flex gap-2">
          <button onClick={() => selectPeriod(1)} className={`btn-outline btn-sm ${period === 1 ? "!border-[var(--red)] !text-[var(--red)]" : ""}`}>Today</button>
          <button onClick={() => selectPeriod(3)} className={`btn-outline btn-sm ${period === 3 ? "!border-[var(--red)] !text-[var(--red)]" : ""}`}>3 Days</button>
          <button onClick={() => selectPeriod(7)} className={`btn-outline btn-sm ${period === 7 ? "!border-[var(--red)] !text-[var(--red)]" : ""}`}>7 Days</button>
          {!fetched && <button onClick={() => fetchData()} className="btn-primary btn-sm">Load</button>}
        </div>
      </div>

      {loading && (
        <div className="text-center py-6 text-[var(--muted)]">
          <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
          <p>Fetching videos from all channels...</p>
        </div>
      )}

      {fetched && !loading && videos.length === 0 && (
        <div className="text-center py-6 text-[var(--muted)]">
          No videos posted {period === 1 ? "today" : `in the last ${period} days`}.
        </div>
      )}

      {!loading && videos.length > 0 && (
        <>
          <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", marginBottom: "1rem" }}>
            <div className="stat-card">
              <div className="stat-icon">🎬</div>
              <div className="stat-val">{videos.length}</div>
              <div className="stat-label">Videos Posted</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🩳</div>
              <div className="stat-val">{videos.filter(v => v.isShort).length}</div>
              <div className="stat-label">Shorts</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👁</div>
              <div className="stat-val">{fmt(videos.reduce((s, v) => s + v.views, 0))}</div>
              <div className="stat-label">Total Views</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👍</div>
              <div className="stat-val">{fmt(videos.reduce((s, v) => s + v.likes, 0))}</div>
              <div className="stat-label">Total Likes</div>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Video</th>
                  <th>Channel</th>
                  <th>Posted</th>
                  <th>Views</th>
                  <th>Likes</th>
                  <th>Comments</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => (
                  <tr key={v.videoId}>
                    <td>
                      {v.thumbnail && (
                        <img src={v.thumbnail} alt="" className="rounded-lg" style={{ width: 64, height: 36, objectFit: "cover" }} />
                      )}
                    </td>
                    <td>
                      <a href={v.url} target="_blank" className="hover:text-[var(--red)] text-sm font-medium">
                        {v.title.length > 45 ? v.title.slice(0, 45) + "..." : v.title}
                      </a>
                    </td>
                    <td>
                      <span className="text-xs">{v.channelName}</span>
                      {v.category && <span className="tag ml-1">{v.category}</span>}
                    </td>
                    <td className="text-xs text-[var(--muted)]">{timeAgo(v.publishedAt)}</td>
                    <td className="font-semibold">{fmt(v.views)}</td>
                    <td>{fmt(v.likes)}</td>
                    <td>{fmt(v.comments)}</td>
                    <td>
                      <span className={`tag ${v.isShort ? "!border-[var(--red)]/30 !text-[var(--red)]" : ""}`}>
                        {v.isShort ? "🩳 Short" : "🎬 Video"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
