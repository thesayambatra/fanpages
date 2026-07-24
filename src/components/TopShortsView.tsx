"use client";
import { useState, useEffect } from "react";

function fmt(n: number) { return (n || 0).toLocaleString(); }

export function TopShortsView() {
  const [shorts, setShorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async (cat?: string) => {
    setLoading(true);
    const c = cat || category;
    const res = await fetch(`/api/top-shorts?category=${c}`);
    const data = await res.json();
    setShorts(data.shorts || []);
    setLoading(false);
  };

  const changeCategory = (c: string) => { setCategory(c); fetchData(c); };

  return (
    <>
      <div className="page-header"><h2>🩳 Top 5 Videos</h2></div>

      {/* Category filter */}
      <div className="card" style={{ padding: "0.75rem 1rem", marginBottom: "1rem" }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--muted)] uppercase">Category:</span>
          {["all", "JEE", "NEET", "UPSC", "K12"].map(c => (
            <button
              key={c}
              onClick={() => changeCategory(c)}
              className={`btn-sm rounded-full font-semibold ${category === c ? "btn-primary" : "btn-outline"}`}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-10 text-[var(--muted)]">Loading...</div>
      ) : shorts.length === 0 ? (
        <div className="card text-center py-10 text-[var(--muted)]">No videos found. Refresh channels to get data.</div>
      ) : (
        <div className="card">
          <div className="card-header"><h3>Top 5 Videos by Views</h3></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Video</th><th>Channel</th><th>Category</th><th>Views</th><th>Likes</th><th>Comments</th><th>Managed By</th></tr>
              </thead>
              <tbody>
                {shorts.map((v, i) => (
                  <tr key={v.videoId || i}>
                    <td className="font-bold text-lg">{i + 1}</td>
                    <td>
                      <a href={v.url} target="_blank" className="hover:text-[var(--red)] font-medium text-sm">
                        {(v.title || "Untitled").slice(0, 50)}{(v.title || "").length > 50 ? "..." : ""}
                      </a>
                    </td>
                    <td className="text-xs">{v.channelName}</td>
                    <td>{v.category && <span className="tag">{v.category}</span>}</td>
                    <td className="font-bold text-lg" style={{ color: "var(--red)" }}>{fmt(v.views)}</td>
                    <td>{fmt(v.likes)}</td>
                    <td>{fmt(v.comments)}</td>
                    <td className="text-xs">{v.managedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
