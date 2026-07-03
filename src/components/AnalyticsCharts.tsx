"use client";
import { useEffect, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window { Chart: any; }
}

interface Props {
  chartData: { labels: string[]; subscribers: number[]; views: number[]; engagement: number[] };
  catData: { category: string; count: number; subscribers: number; views: number; avgEngagement: number }[];
}

export function AnalyticsCharts({ chartData, catData }: Props) {
  const subsRef = useRef<HTMLCanvasElement>(null);
  const viewsRef = useRef<HTMLCanvasElement>(null);
  const engRef = useRef<HTMLCanvasElement>(null);
  const catRef = useRef<HTMLCanvasElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    const init = () => {
      if (!window.Chart) return setTimeout(init, 200);
      loaded.current = true;
      const OPTS = {
        plugins: { legend: { labels: { color: "#aaa" } } },
        scales: { x: { ticks: { color: "#666" }, grid: { color: "rgba(255,255,255,0.04)" } }, y: { ticks: { color: "#666" }, grid: { color: "rgba(255,255,255,0.04)" } } },
      };
      if (subsRef.current) new window.Chart(subsRef.current, { type: "bar", data: { labels: chartData.labels, datasets: [{ label: "Subscribers", data: chartData.subscribers, backgroundColor: "rgba(255,0,0,0.5)", borderColor: "#ff0000", borderWidth: 1, borderRadius: 5 }] }, options: OPTS });
      if (viewsRef.current) new window.Chart(viewsRef.current, { type: "bar", data: { labels: chartData.labels, datasets: [{ label: "Views", data: chartData.views, backgroundColor: "rgba(33,150,243,0.5)", borderColor: "#2196f3", borderWidth: 1, borderRadius: 5 }] }, options: OPTS });
      if (engRef.current) new window.Chart(engRef.current, { type: "line", data: { labels: chartData.labels, datasets: [{ label: "Engagement %", data: chartData.engagement, borderColor: "#4caf50", backgroundColor: "rgba(76,175,80,0.1)", tension: 0.4, fill: true, pointRadius: 4 }] }, options: OPTS });
      if (catRef.current) {
        const colors = ["#ff0000", "#e91e63", "#9c27b0", "#3f51b5", "#2196f3", "#009688", "#4caf50", "#ff9800"];
        new window.Chart(catRef.current, { type: "doughnut", data: { labels: catData.map(c => c.category), datasets: [{ data: catData.map(c => c.count), backgroundColor: colors.slice(0, catData.length).map(c => c + "bb"), borderColor: colors.slice(0, catData.length), borderWidth: 1 }] }, options: { plugins: { legend: { labels: { color: "#aaa" } } } } });
      }
    };
    init();
  }, [chartData, catData]);

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="afterInteractive" />
      <div className="two-col">
        <div className="card"><div className="card-header"><h3>Subscribers by Channel</h3></div><canvas ref={subsRef} height={220} /></div>
        <div className="card"><div className="card-header"><h3>Views by Channel</h3></div><canvas ref={viewsRef} height={220} /></div>
      </div>
      <div className="two-col">
        <div className="card"><div className="card-header"><h3>Engagement Rate</h3></div><canvas ref={engRef} height={220} /></div>
        <div className="card"><div className="card-header"><h3>Channels per Category</h3></div><canvas ref={catRef} height={220} /></div>
      </div>

      {/* Category table */}
      <div className="card">
        <div className="card-header"><h3>Category Breakdown</h3></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Category</th><th>Channels</th><th>Subscribers</th><th>Views</th><th>Avg Engagement</th></tr></thead>
            <tbody>
              {catData.map(row => (
                <tr key={row.category}>
                  <td><span className="tag">{row.category}</span></td>
                  <td>{row.count}</td>
                  <td>{row.subscribers.toLocaleString()}</td>
                  <td>{row.views.toLocaleString()}</td>
                  <td><span className={`eng-badge ${row.avgEngagement >= 10 ? "green" : row.avgEngagement >= 3 ? "orange" : "red"}`}>{row.avgEngagement}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
