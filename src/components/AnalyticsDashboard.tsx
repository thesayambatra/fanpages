"use client";
import { useState, useEffect, useRef } from "react";
import Script from "next/script";

declare global { interface Window { Chart: any } }

export function AnalyticsDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const subsChartRef = useRef<HTMLCanvasElement>(null);
  const chartInst = useRef<any>(null);
  const subsChartInst = useRef<any>(null);

  useEffect(() => {
    fetch("/api/analytics-monthly")
      .then(r => r.json())
      .then(d => { setData(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data.length) return;
    const init = () => {
      if (!window.Chart) return setTimeout(init, 300);
      
      // Views chart
      if (chartRef.current) {
        if (chartInst.current) chartInst.current.destroy();
        chartInst.current = new window.Chart(chartRef.current, {
          type: "bar",
          data: {
            labels: data.map(d => d.label),
            datasets: [{
              label: "Monthly Views",
              data: data.map(d => d.views),
              backgroundColor: "rgba(8, 189, 128, 0.6)",
              borderColor: "#08bd80",
              borderWidth: 2,
              borderRadius: 8,
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { labels: { color: "#718096" } } },
            scales: {
              x: { ticks: { color: "#718096" }, grid: { display: false } },
              y: { ticks: { color: "#718096", callback: (v: number) => v >= 1000000 ? (v/1000000).toFixed(1) + "M" : v >= 1000 ? (v/1000).toFixed(0) + "K" : v }, grid: { color: "rgba(0,0,0,0.05)" } }
            }
          }
        });
      }

      // Subscribers chart
      if (subsChartRef.current) {
        if (subsChartInst.current) subsChartInst.current.destroy();
        subsChartInst.current = new window.Chart(subsChartRef.current, {
          type: "line",
          data: {
            labels: data.map(d => d.label),
            datasets: [{
              label: "Subscribers Growth",
              data: data.map(d => d.subs),
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              tension: 0.4,
              fill: true,
              pointRadius: 5,
              pointBackgroundColor: "#3b82f6",
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { labels: { color: "#718096" } } },
            scales: {
              x: { ticks: { color: "#718096" }, grid: { display: false } },
              y: { ticks: { color: "#718096" }, grid: { color: "rgba(0,0,0,0.05)" } }
            }
          }
        });
      }
    };
    init();
  }, [data]);

  const totalViews = data.reduce((s, d) => s + d.views, 0);
  const totalSubs = data.reduce((s, d) => s + d.subs, 0);

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="afterInteractive" />
      <div className="page-header"><h2>📊 Monthly Analytics</h2></div>

      {loading ? (
        <div className="card text-center py-10 text-[var(--muted)]">Loading analytics...</div>
      ) : data.length === 0 ? (
        <div className="card text-center py-10 text-[var(--muted)]">
          No monthly data yet. Data accumulates as channels are refreshed daily.
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-val" style={{ color: "#08bd80" }}>+{totalViews.toLocaleString()}</div>
              <div className="stat-label">Total View Growth</div>
            </div>
            <div className="stat-card">
              <div className="stat-val" style={{ color: "#3b82f6" }}>+{totalSubs.toLocaleString()}</div>
              <div className="stat-label">Total Sub Growth</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">{data.length}</div>
              <div className="stat-label">Months Tracked</div>
            </div>
          </div>

          {/* Monthly Views Chart */}
          <div className="card">
            <div className="card-header"><h3>Monthly Views Growth</h3></div>
            <canvas ref={chartRef} height={80} />
          </div>

          {/* Subscribers Chart */}
          <div className="card">
            <div className="card-header"><h3>Monthly Subscriber Growth</h3></div>
            <canvas ref={subsChartRef} height={80} />
          </div>

          {/* Monthly Table */}
          <div className="card">
            <div className="card-header"><h3>Month-by-Month Breakdown</h3></div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Month</th><th>Views Growth</th><th>Sub Growth</th><th>Channels</th></tr>
                </thead>
                <tbody>
                  {[...data].reverse().map(d => (
                    <tr key={d.month}>
                      <td className="font-semibold">{d.label}</td>
                      <td className="font-bold" style={{ color: "#08bd80" }}>+{d.views.toLocaleString()}</td>
                      <td style={{ color: "#3b82f6" }}>+{d.subs.toLocaleString()}</td>
                      <td>{d.channels}</td>
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
