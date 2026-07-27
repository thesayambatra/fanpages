"use client";
import { useState, useEffect, useRef } from "react";
import Script from "next/script";

declare global { interface Window { Chart: any } }

export function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInst = useRef<any>(null);

  useEffect(() => {
    fetch("/api/analytics-monthly")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data?.chartData) return;
    const init = () => {
      if (!window.Chart) return setTimeout(init, 300);
      if (chartRef.current) {
        if (chartInst.current) chartInst.current.destroy();
        const cd = data.chartData;
        chartInst.current = new window.Chart(chartRef.current, {
          type: "line",
          data: {
            labels: cd.labels,
            datasets: [
              { label: "JEE", data: cd.jee, borderColor: "#3b82f6", backgroundColor: "rgba(59,130,246,0.1)", tension: 0.4, fill: true },
              { label: "NEET", data: cd.neet, borderColor: "#08bd80", backgroundColor: "rgba(8,189,128,0.1)", tension: 0.4, fill: true },
              { label: "UPSC", data: cd.upsc, borderColor: "#8b5cf6", backgroundColor: "rgba(139,92,246,0.1)", tension: 0.4, fill: true },
              { label: "K12", data: cd.k12, borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.1)", tension: 0.4, fill: true },
            ],
          },
          options: {
            responsive: true,
            plugins: { legend: { labels: { color: "#718096", usePointStyle: true } } },
            scales: {
              x: { ticks: { color: "#718096" }, grid: { display: false } },
              y: { ticks: { color: "#718096", callback: (v: number) => v >= 1000000 ? (v/1000000).toFixed(1)+"M" : v >= 1000 ? (v/1000).toFixed(0)+"K" : v }, grid: { color: "rgba(0,0,0,0.05)" } }
            }
          }
        });
      }
    };
    init();
  }, [data]);

  if (loading) return <div className="card text-center py-10 text-[var(--muted)]">Loading analytics...</div>;
  if (!data) return <div className="card text-center py-10 text-[var(--muted)]">No data available.</div>;

  const cats = data.categories || {};
  const summary = data.summary || {};
  const filtered = category === "all" ? summary : (cats[category] || {});

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="afterInteractive" />
      <div className="page-header"><h2>📊 Analytics</h2></div>

      {/* Category Filter */}
      <div className="card" style={{ padding: "0.75rem 1rem", marginBottom: "1rem" }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--muted)] uppercase">Category:</span>
          {["all", "JEE", "NEET", "UPSC", "K12"].map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`btn-sm rounded-full font-semibold ${category === c ? "btn-primary" : "btn-outline"}`}
            >
              {c === "all" ? "All Categories" : c}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stat-grid">
        <div className="stat-card" style={{ borderLeft: "3px solid #08bd80" }}>
          <div className="stat-val" style={{ color: "#08bd80" }}>+{(filtered.viewsThisMonth || 0).toLocaleString()}</div>
          <div className="stat-label">Views This Month</div>
        </div>
        <div className="stat-card" style={{ borderLeft: "3px solid #3b82f6" }}>
          <div className="stat-val" style={{ color: "#3b82f6" }}>+{(filtered.subsGrowth || 0).toLocaleString()}</div>
          <div className="stat-label">Subs Growth</div>
        </div>
        <div className="stat-card" style={{ borderLeft: "3px solid #f59e0b" }}>
          <div className="stat-val">{filtered.shortsPosted || 0}</div>
          <div className="stat-label">Shorts Posted This Month</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{filtered.totalChannels || 0}</div>
          <div className="stat-label">Total Channels</div>
        </div>
      </div>

      {/* Per Category Cards */}
      <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {["JEE", "NEET", "UPSC", "K12"].map(cat => {
          const catData = cats[cat] || {};
          const colors: Record<string, string> = { JEE: "#3b82f6", NEET: "#08bd80", UPSC: "#8b5cf6", K12: "#f59e0b" };
          return (
            <div key={cat} className="card" style={{ borderTop: `3px solid ${colors[cat]}`, padding: "1rem" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">{cat}</span>
                <span className="text-xs text-[var(--muted)]">{catData.totalChannels || 0} ch</span>
              </div>
              <div className="text-xl font-black" style={{ color: colors[cat] }}>
                +{(catData.viewsThisMonth || 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-[var(--muted)]">This Month</div>
              <div className="flex justify-between mt-2 text-[10px] text-[var(--muted)]">
                <span>Last Month: +{(catData.viewsLastMonth || 0).toLocaleString()}</span>
                <span>{catData.shortsPosted || 0} posts</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Trend Chart */}
      <div className="card">
        <div className="card-header"><h3>Monthly Views Trend (Last 6 Months)</h3></div>
        <canvas ref={chartRef} height={80} />
      </div>
    </>
  );
}
