"use client";
import { useState } from "react";

function fmt(n: number) { return (n || 0).toLocaleString(); }
function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function TopShortsView() {
  const [shorts, setShorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("week");
  const [category, setCategory] = useState("all");
  const [fetched, setFetched] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchData = async (p?: string, c?: string) => {
    const per = p || period;
    const cat = c || category;
    setLoading(true);
    const res = await fetch(`/api/top-shorts?period=${per}&category=${cat}`);
    const data = await res.json();
    setShorts(data.shorts || []);
    setTotal(data.total || 0);
    setLoading(false);
    setFetched(true);
  };

  const changePeriod = (p: string) => { setPeriod(p); fetchData(p, category); };
  const changeCategory = (c: string) => { setCategory(c); fetchData(period, c); };

  const totalViews = shorts.reduce((s, v) => s + v.views, 0);
  const totalLikes = shorts.reduce((s, v) => s + v.likes, 0);

  return (
    <>
      <div className="page-header"><h2>🩳 Top Shorts</h2></div>

      {/* Filters */}
      <div className="card" style={{ padding: "0.75rem 1rem" }}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-[var(--muted)] uppercase">Period:</span>
          {[
            { id: "day", label: "Today" },
            { id: "week", label: "This Week" },
            { id: "month", label: "This Month" },
            { id: "overall", label: "Overall" },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => changePeriod(p.id)}
              className={`btn-sm rounded-full font-semibold ${period === p.id ? "btn-primary" : "btn-outline"}`}
            >
              {p.label}
            </button>
          ))}

          <span className="text-xs font-bold text-[var(--muted)] uppercase ml-4">Category:</span>
          {["all", "JEE", "NEET", "UPSC", "K12"].map(c => (
            <button
              key={c}
              onClick={() => changeCategory(c)}
              className={`btn-sm rounded-full font-semibold ${category === c ? "btn-primary" : "btn-outline"}`}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}

          {!fetched && <button onClick={() => fetchData()} className="btn-primary btn-sm ml-4">Load Shorts</button>}
        </div>
      </div>

      {loading && (
        <div className="card text-center py-10 text-[var(--muted)]">
          <div className="text-3xl mb-2 animate-bounce">🩳</div>
          Loading top shorts...
        </div>
      )}

      {fetched && !loading && shorts.length === 0 && (
        <div className="card text-center py-10 text-[var(--muted)]">
          No shorts found for this period.
        </div>
      )}

      {fetched && !loading && shorts.length > 0 && (
        <>
          {/* Stats */}
          <div className="stat-grid">
            <div className="stat-card red">
              <div className="stat-icon">🩳</div>
              <div className="stat-val">{shorts.length}</div>
              <div className="stat-label">Top Shorts</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👁</div>
              <div className="stat-val">{fmt(totalViews)}</div>
              <div className="stat-label">Total Views</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👍</div>
              <div className="stat-val">{fmt(totalLikes)}</div>
              <div className="stat-label">Total Likes</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-val">{shorts.length > 0 ? fmt(Math.round(totalViews / shorts.length)) : 0}</div>
              <div className="stat-label">Avg Views/Short</div>
            </div>
          </div>

          {/* Table */}
          <div className="card">
            <div className="card-header"><h3>Top Performing Shorts — {period === "day" ? "Today" : period === "week" ? "This Week" : period === "month" ? "This Month" : "All Time"}</h3></div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>#</th><th></th><th>Title</th><th>Channel</th><th>Category</th><th>Views</th><th>Likes</th><th>Comments</th><th>Posted</th><th>Managed By</th></tr>
                </thead>
                <tbody>
                  {shorts.map((v, i) => (
                    <tr key={v.videoId}>
                      <td className="font-bold">{i + 1}</td>
                      <td>
                        {v.thumbnail && <img src={v.thumbnail} alt="" className="rounded-lg" style={{ width: 56, height: 32, objectFit: "cover" }} />}
                      </td>
                      <td>
                        <a href={v.url} target="_blank" className="hover:text-[var(--red)] font-medium text-xs">
                          {v.title.length > 40 ? v.title.slice(0, 40) + "..." : v.title}
                        </a>
                      </td>
                      <td className="text-xs">{v.channelName}</td>
                      <td>{v.category && <span className="tag">{v.category}</span>}</td>
                      <td className="font-bold" style={{ color: "var(--red)" }}>{fmt(v.views)}</td>
                      <td>{fmt(v.likes)}</td>
                      <td>{fmt(v.comments)}</td>
                      <td className="text-xs text-[var(--muted)]">{timeAgo(v.publishedAt)}</td>
                      <td className="text-xs">{v.managedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
