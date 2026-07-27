"use client";
import { useState, useEffect, useRef } from "react";
import Script from "next/script";

declare global { interface Window { Chart: any } }

function fmt(n: number) { return (n || 0).toLocaleString(); }

export function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState("all");
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    fetch("/api/analytics-data")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data || !window.Chart || !chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const colors: Record<string, string> = { JEE: "#3b82f6", NEET: "#08bd80", UPSC: "#8b5cf6", K12: "#f59e0b" };
    const datasets = selectedCat === "all"
      ? Object.entries(data.categories).map(([cat, d]: [string, any]) => ({
          label: cat,
          data: d.monthlyViews,
          borderColor: colors[cat] || "#999",
          backgroundColor: (colors[cat] || "#999") + "20",
          tension: 0.4,
          fill: true,
        }))
      : [{
          label: selectedCat,
          data: data.categories[selectedCat]?.monthlyViews || [],
          borderColor: colors[selectedCat] || "#3b82f6",
          backgroundColor: (colors[selectedCat] || "#3b82f6") + "20",
          tension: 0.4,
          fill: true,
        }];

    chartInstance.current = new window.Chart(chartRef.current, {
      type: "line",
      data: { labels: data.months, datasets },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: "var(--muted)", font: { size: 11 } } } },
        scales: {
          x: { ticks: { color: "#888" }, grid: { color: "rgba(0,0,0,0.05)" } },
          y: { ticks: { color: "#888" }, grid: { color: "rgba(0,0,0,0.05)" } },
        },
      },
    });
  }, [data, selectedCat]);

  if (loading) return <div className="card text-center py-10 text-[var(--muted)]">Loading analytics...</div>;
  if (!data) return <div className="card text-center py-10 text-[var(--muted)]">No data available</div>;

  const categories = ["JEE", "NEET", "UPSC", "K12"];
  const allViewsThisMonth = categories.reduce((s, c) => s + (data.categories[c]?.viewsThisMonth || 0), 0);
  const allViewsLastMonth = categories.reduce((s, c) => s + (data.categories[c]?.viewsLastMonth || 0), 0);
  const allPosts = categories.reduce((s, c) => s + (data.categories[c]?.totalPosts || 0), 0);

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="afterInteractive" />
      <div className="page-header"><h2>📊 Analytics</h2></div>

      {/* Category Filter */}
      <div className="card" style={{ padding: "0.75rem 1rem", marginBottom: "1rem" }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--muted)] uppercase">Category:</span>
          {["all", ...categories].map(c => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={`btn-sm rounded-full font-semibold ${selectedCat === c ? "btn-primary" : "btn-outline"}`}
            >
              {c === "all" ? "All Categories" : c}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-val" style={{ color: "#08bd80" }}>+{fmt(allViewsThisMonth)}</div>
          <div className="stat-label">Views This Month</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">+{fmt(allViewsLastMonth)}</div>
          <div className="stat-label">Views Last Month</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{allPosts}</div>
          <div className="stat-label">Posts This Month</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{data.totalChannels}</div>
          <div className="stat-label">Total Channels</div>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {categories.map(cat => {
          const d = data.categories[cat];
          if (!d) return null;
          const growth = d.viewsLastMonth > 0 ? (((d.viewsThisMonth - d.viewsLastMonth) / d.viewsLastMonth) * 100).toFixed(1) : "0";
          return (
            <div key={cat} className="card" style={{ padding: "1rem", marginBottom: 0 }}>
              <div className="flex items-center justify-between mb-2">
                <span className="tag">{cat}</span>
                <span className={`text-xs font-bold ${Number(growth) >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {Number(growth) >= 0 ? "↑" : "↓"} {growth}%
                </span>
              </div>
              <div className="text-lg font-black" style={{ color: "#08bd80" }}>+{fmt(d.viewsThisMonth)}</div>
              <div className="text-[10px] text-[var(--muted)]">This Month</div>
              <div className="flex justify-between mt-2 text-xs text-[var(--muted)]">
                <span>Last Month: +{fmt(d.viewsLastMonth)}</span>
                <span>{d.totalPosts} posts</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Views Chart */}
      <div className="card">
        <div className="card-header"><h3>Monthly Views Trend (Last 6 Months)</h3></div>
        <canvas ref={chartRef} height={100} />
      </div>
    </>
  );
}
