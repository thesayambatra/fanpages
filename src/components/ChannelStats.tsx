"use client";
import { useState } from "react";

function fmt(n: number) { return (n || 0).toLocaleString(); }

export function ChannelStats({ channelDbId, channelName }: { channelDbId: number; channelName: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState(28);

  const fetchData = async (days?: number) => {
    const d = days || period;
    setLoading(true); setError("");
    const res = await fetch(`/api/channel-stats?channelId=${channelDbId}&period=${d}`);
    const json = await res.json();
    setLoading(false);
    if (json.error) { setError(json.error); return; }
    setData(json);
  };

  return (
    <>
      {/* Period selector */}
      <div className="card filter-bar">
        <div className="filter-form">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase">Period</span>
          <button onClick={() => { setPeriod(7); fetchData(7); }} className={`btn-outline btn-sm ${period === 7 ? "!border-red-500 !text-red-500" : ""}`}>7 Days</button>
          <button onClick={() => { setPeriod(28); fetchData(28); }} className={`btn-outline btn-sm ${period === 28 ? "!border-red-500 !text-red-500" : ""}`}>28 Days</button>
          <button onClick={() => { setPeriod(90); fetchData(90); }} className={`btn-outline btn-sm ${period === 90 ? "!border-red-500 !text-red-500" : ""}`}>90 Days</button>
          <button onClick={() => fetchData()} disabled={loading} className="btn-primary btn-sm">
            {loading ? "Loading..." : "Fetch Stats"}
          </button>
        </div>
      </div>

      {error && <div className="card text-red-400 text-sm">Error: {error}</div>}

      {!data && !error && !loading && (
        <div className="card text-center py-10 text-[var(--muted)]">
          Click "Fetch Stats" to load real-time data for {channelName}. No OAuth needed!
        </div>
      )}

      {data && (
        <>
          {/* Channel overview */}
          <div className="studio-primary-grid">
            <div className="studio-metric-card views">
              <div className="smc-label">Total Subscribers</div>
              <div className="smc-val">{fmt(data.channel.subscribers)}</div>
              <div className="smc-sub">All time</div>
            </div>
            <div className="studio-metric-card watchtime">
              <div className="smc-label">Total Views</div>
              <div className="smc-val">{fmt(data.channel.totalViews)}</div>
              <div className="smc-sub">All time</div>
            </div>
            <div className="studio-metric-card">
              <div className="smc-label">Videos Posted</div>
              <div className="smc-val">{data.period.videosPosted}</div>
              <div className="smc-sub">Last {data.period.days} days ({data.period.shorts} shorts, {data.period.longs} longs)</div>
            </div>
            <div className="studio-metric-card ctr">
              <div className="smc-label">Recent Views</div>
              <div className="smc-val">{fmt(data.recentStats.views)}</div>
              <div className="smc-sub">From videos posted last {data.period.days} days</div>
            </div>
            <div className="studio-metric-card stayed">
              <div className="smc-label">Engagement Rate</div>
              <div className="smc-val">{data.recentStats.engagementRate}%</div>
              <div className="smc-sub">(Likes + Comments) / Views</div>
            </div>
          </div>

          {/* Recent engagement */}
          <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
            <div className="stat-card"><div className="stat-icon">👁</div><div className="stat-val">{fmt(data.recentStats.views)}</div><div className="stat-label">Views (Recent)</div></div>
            <div className="stat-card"><div className="stat-icon">👍</div><div className="stat-val">{fmt(data.recentStats.likes)}</div><div className="stat-label">Likes</div></div>
            <div className="stat-card"><div className="stat-icon">💬</div><div className="stat-val">{fmt(data.recentStats.comments)}</div><div className="stat-label">Comments</div></div>
            <div className="stat-card"><div className="stat-icon">🩳</div><div className="stat-val">{fmt(data.shortsStats.count)}</div><div className="stat-label">Shorts Posted</div></div>
            <div className="stat-card"><div className="stat-icon">👁</div><div className="stat-val">{fmt(data.shortsStats.views)}</div><div className="stat-label">Shorts Views</div></div>
            <div className="stat-card"><div className="stat-icon">📺</div><div className="stat-val">{data.channel.videoCount}</div><div className="stat-label">Total Videos</div></div>
          </div>

          {/* Recent Videos */}
          {data.recentVideos?.length > 0 && (
            <div className="card">
              <div className="card-header"><h3>Recent Videos (Last {data.period.days} Days)</h3></div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>#</th><th>Video</th><th>Published</th><th>Views</th><th>Likes</th><th>Comments</th><th>Type</th></tr></thead>
                  <tbody>
                    {data.recentVideos.map((v: any, i: number) => (
                      <tr key={v.videoId}>
                        <td>{i + 1}</td>
                        <td><a href={v.url} target="_blank" className="hover:text-red-500 text-sm">{v.title.slice(0, 50)}{v.title.length > 50 ? "..." : ""}</a></td>
                        <td className="text-xs text-[var(--muted)]">{v.publishedAt}</td>
                        <td>{fmt(v.views)}</td>
                        <td>{fmt(v.likes)}</td>
                        <td>{fmt(v.comments)}</td>
                        <td><span className={`tag ${v.isShort ? "!border-red-500/30 !text-red-400" : ""}`}>{v.isShort ? "Short" : "Video"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Videos All Time */}
          {data.topVideos?.length > 0 && (
            <div className="card">
              <div className="card-header"><h3>Top Videos (All Time)</h3></div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>#</th><th>Video</th><th>Published</th><th>Views</th><th>Likes</th><th>Comments</th></tr></thead>
                  <tbody>
                    {data.topVideos.map((v: any, i: number) => (
                      <tr key={v.videoId}>
                        <td>{i + 1}</td>
                        <td><a href={v.url} target="_blank" className="hover:text-red-500 text-sm">{v.title.slice(0, 50)}{v.title.length > 50 ? "..." : ""}</a></td>
                        <td className="text-xs text-[var(--muted)]">{v.publishedAt}</td>
                        <td>{fmt(v.views)}</td>
                        <td>{fmt(v.likes)}</td>
                        <td>{fmt(v.comments)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
