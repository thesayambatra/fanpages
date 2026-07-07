"use client";
import { useState, useEffect, useRef } from "react";
import Script from "next/script";

declare global { interface Window { Chart: any } }

function d(n: number) { return n >= 0 ? "+" : ""; }
function fmt(n: number | undefined) { return (n || 0).toLocaleString(); }
function pct(n: number | undefined) { return ((n || 0)).toFixed(2); }
function mmss(sec: number) { return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`; }

function getDateStr(d: Date) { return d.toISOString().slice(0, 10); }
function range28() {
  const now = new Date();
  return { from: getDateStr(new Date(now.getTime() - 28 * 86400000)), to: getDateStr(now) };
}

export function StudioDashboard({ channelDbId, channelName }: { channelDbId: number; channelName: string }) {
  const [from, setFrom] = useState(range28().from);
  const [to, setTo] = useState(range28().to);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chartsInit = useRef(false);

  const fetchData = async (f?: string, t?: string) => {
    setLoading(true); setError("");
    const res = await fetch(`/api/studio?channelId=${channelDbId}&from=${f || from}&to=${t || to}`);
    const json = await res.json();
    setLoading(false);
    if (json.error) { setError(json.error); return; }
    setData(json);
    chartsInit.current = false;
  };

  useEffect(() => { fetchData(); }, []);

  // Initialize charts when data loads
  useEffect(() => {
    if (!data || chartsInit.current) return;
    const init = () => {
      if (!window.Chart) return setTimeout(init, 300);
      chartsInit.current = true;

      // Destroy existing charts before creating new ones
      const destroyChart = (id: string) => {
        const existing = window.Chart.getChart(id);
        if (existing) existing.destroy();
      };

      // Daily views chart
      const dailyEl = document.getElementById("dailyChart") as HTMLCanvasElement;
      if (dailyEl && data.daily?.length) {
        destroyChart("dailyChart");
        new window.Chart(dailyEl, {
          type: "line",
          data: {
            labels: data.daily.map((r: any) => r.day),
            datasets: [
              { label: "Views", data: data.daily.map((r: any) => r.views || 0), borderColor: "#ff0000", backgroundColor: "rgba(255,0,0,0.07)", tension: 0.4, fill: true, pointRadius: 2 },
              { label: "Watch Mins", data: data.daily.map((r: any) => r.estimatedMinutesWatched || 0), borderColor: "#2196f3", backgroundColor: "rgba(33,150,243,0.05)", tension: 0.4, fill: true, pointRadius: 2, hidden: true },
            ]
          },
          options: { plugins: { legend: { labels: { color: "#888" } } }, scales: { x: { ticks: { color: "#555", maxRotation: 40 }, grid: { color: "rgba(255,255,255,0.04)" } }, y: { ticks: { color: "#555" }, grid: { color: "rgba(255,255,255,0.04)" } } } }
        });
      }

      // Traffic sources doughnut
      const trafficEl = document.getElementById("trafficChart") as HTMLCanvasElement;
      if (trafficEl && data.traffic?.length) {
        destroyChart("trafficChart");
        const colors = ["#ff0000","#e91e63","#9c27b0","#3f51b5","#2196f3","#009688","#4caf50","#ff9800","#ff5722","#607d8b"];
        new window.Chart(trafficEl, {
          type: "doughnut",
          data: { labels: data.traffic.map((r: any) => r.insightTrafficSourceType), datasets: [{ data: data.traffic.map((r: any) => r.views), backgroundColor: colors.map(c => c + "bb"), borderColor: colors, borderWidth: 1 }] },
          options: { plugins: { legend: { position: "right", labels: { color: "#888", font: { size: 10 } } } } }
        });
      }

      // Device types bar
      const deviceEl = document.getElementById("deviceChart") as HTMLCanvasElement;
      if (deviceEl && data.device?.length) {
        destroyChart("deviceChart");
        new window.Chart(deviceEl, {
          type: "bar",
          data: { labels: data.device.map((r: any) => r.deviceType), datasets: [{ label: "Views", data: data.device.map((r: any) => r.views), backgroundColor: "rgba(255,0,0,0.5)", borderColor: "#ff0000", borderWidth: 1, borderRadius: 6 }] },
          options: { plugins: { legend: { labels: { color: "#888" } } }, scales: { x: { ticks: { color: "#555" }, grid: { color: "rgba(255,255,255,0.04)" } }, y: { ticks: { color: "#555" }, grid: { color: "rgba(255,255,255,0.04)" } } } }
        });
      }

      // Age/Gender
      const ageEl = document.getElementById("ageChart") as HTMLCanvasElement;
      if (ageEl && data.ageGender?.length) {
        destroyChart("ageChart");
        const ageGroups = [...new Set(data.ageGender.map((r: any) => r.ageGroup))] as string[];
        const male = ageGroups.map(a => { const r = data.ageGender.find((x: any) => x.ageGroup === a && x.gender === "MALE"); return r?.viewerPercentage || 0; });
        const female = ageGroups.map(a => { const r = data.ageGender.find((x: any) => x.ageGroup === a && x.gender === "FEMALE"); return r?.viewerPercentage || 0; });
        new window.Chart(ageEl, {
          type: "bar",
          data: { labels: ageGroups, datasets: [{ label: "Male %", data: male, backgroundColor: "rgba(33,150,243,0.6)", borderRadius: 4 }, { label: "Female %", data: female, backgroundColor: "rgba(233,30,99,0.6)", borderRadius: 4 }] },
          options: { plugins: { legend: { labels: { color: "#888" } } }, scales: { x: { ticks: { color: "#555" }, grid: { color: "rgba(255,255,255,0.04)" } }, y: { ticks: { color: "#555" }, grid: { color: "rgba(255,255,255,0.04)" } } } }
        });
      }
    };
    init();
  }, [data]);

  const ov = data?.overview || {};

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="afterInteractive" />

      {/* Date filter */}
      <div className="card filter-bar">
        <div className="filter-form">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase">From</span>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="form-input" />
          <span className="text-xs font-semibold text-[var(--muted)] uppercase">To</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="form-input" />
          <button onClick={() => fetchData()} disabled={loading} className="btn-primary btn-sm">{loading ? "Loading..." : "Apply"}</button>
          <button onClick={() => { const r = range28(); setFrom(r.from); setTo(r.to); fetchData(r.from, r.to); }} className="btn-outline btn-sm">28 Days</button>
          <button onClick={() => { const now = new Date(); const f = getDateStr(new Date(now.getTime() - 7*86400000)); setFrom(f); setTo(getDateStr(now)); fetchData(f, getDateStr(now)); }} className="btn-outline btn-sm">7 Days</button>
          <button onClick={() => { const now = new Date(); const f = getDateStr(new Date(now.getTime() - 90*86400000)); setFrom(f); setTo(getDateStr(now)); fetchData(f, getDateStr(now)); }} className="btn-outline btn-sm">90 Days</button>
          <button onClick={() => { const now = new Date(); const f = getDateStr(new Date(now.getFullYear(), now.getMonth(), 1)); setFrom(f); setTo(getDateStr(now)); fetchData(f, getDateStr(now)); }} className="btn-outline btn-sm">This Month</button>
          <button onClick={() => { const now = new Date(); const f = getDateStr(new Date(now.getFullYear(), now.getMonth()-1, 1)); const t = getDateStr(new Date(now.getFullYear(), now.getMonth(), 0)); setFrom(f); setTo(t); fetchData(f, t); }} className="btn-outline btn-sm">Last Month</button>
        </div>
      </div>

      {error && <div className="card text-red-400 text-sm">Error: {error}</div>}

      {data && !error && (
        <>
          {/* Primary metrics */}
          <div className="studio-primary-grid">
            <div className="studio-metric-card views">
              <div className="smc-label">Total Views</div>
              <div className="smc-val">{fmt(ov.views)}</div>
              <div className="smc-sub">{from} – {to}</div>
            </div>
            <div className="studio-metric-card ctr">
              <div className="smc-label">CTR</div>
              <div className="smc-val">{pct(ov.impressionClickThroughRate)}%</div>
              <div className="smc-sub">{fmt(ov.impressions)} impressions</div>
            </div>
            <div className="studio-metric-card stayed">
              <div className="smc-label">Stayed to Watch</div>
              <div className="smc-val">{pct(ov.averageViewPercentage)}%</div>
              <div className="smc-sub">Avg view percentage</div>
            </div>
            <div className="studio-metric-card watchtime">
              <div className="smc-label">Watch Time</div>
              <div className="smc-val">{fmt(ov.estimatedMinutesWatched)}</div>
              <div className="smc-sub">Minutes watched</div>
            </div>
            <div className="studio-metric-card duration">
              <div className="smc-label">Avg View Duration</div>
              <div className="smc-val">{mmss(Math.round(ov.averageViewDuration || 0))}</div>
              <div className="smc-sub">mm:ss per view</div>
            </div>
          </div>

          {/* Secondary metrics */}
          <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
            <div className="stat-card"><div className="stat-icon">👍</div><div className="stat-val">{fmt(ov.likes)}</div><div className="stat-label">Likes</div></div>
            <div className="stat-card"><div className="stat-icon">💬</div><div className="stat-val">{fmt(ov.comments)}</div><div className="stat-label">Comments</div></div>
            <div className="stat-card"><div className="stat-icon">↗</div><div className="stat-val">{fmt(ov.shares)}</div><div className="stat-label">Shares</div></div>
            <div className="stat-card"><div className="stat-icon">➕</div><div className="stat-val">+{fmt(ov.subscribersGained)}</div><div className="stat-label">Subs Gained</div></div>
            <div className="stat-card"><div className="stat-icon">➖</div><div className="stat-val">-{fmt(ov.subscribersLost)}</div><div className="stat-label">Subs Lost</div></div>
            <div className="stat-card"><div className="stat-icon">📡</div><div className="stat-val">{fmt(ov.impressions)}</div><div className="stat-label">Impressions</div></div>
          </div>

          {/* Daily chart */}
          {data.daily?.length > 0 && (
            <div className="card">
              <div className="card-header"><h3>Performance Over Time</h3></div>
              <canvas id="dailyChart" height={90} />
            </div>
          )}

          <div className="two-col">
            {/* Traffic Sources */}
            {data.traffic?.length > 0 && (
              <div className="card">
                <div className="card-header"><h3>Traffic Sources</h3></div>
                <canvas id="trafficChart" height={240} />
              </div>
            )}
            {/* Device Types */}
            {data.device?.length > 0 && (
              <div className="card">
                <div className="card-header"><h3>Device Types</h3></div>
                <canvas id="deviceChart" height={240} />
              </div>
            )}
          </div>

          <div className="two-col">
            {/* Geography */}
            {data.geo?.length > 0 && (
              <div className="card">
                <div className="card-header"><h3>Top Countries</h3></div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr><th>#</th><th>Country</th><th>Views</th><th>Watch Mins</th></tr></thead>
                    <tbody>
                      {data.geo.map((r: any, i: number) => (
                        <tr key={r.country}><td>{i + 1}</td><td>{r.country}</td><td>{fmt(r.views)}</td><td>{fmt(r.estimatedMinutesWatched)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* Age & Gender */}
            {data.ageGender?.length > 0 && (
              <div className="card">
                <div className="card-header"><h3>Audience: Age & Gender</h3></div>
                <canvas id="ageChart" height={240} />
              </div>
            )}
          </div>

          {/* Top Videos */}
          {data.topVideos?.length > 0 && (
            <div className="card">
              <div className="card-header"><h3>Top Videos — Full Breakdown</h3></div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>#</th><th>Video</th><th>Views</th><th>Watch Mins</th><th>Avg Duration</th><th>Stayed %</th><th>CTR</th><th>Likes</th><th>Comments</th><th>Shares</th></tr>
                  </thead>
                  <tbody>
                    {data.topVideos.map((r: any, i: number) => (
                      <tr key={r.video}>
                        <td>{i + 1}</td>
                        <td><a href={`https://youtube.com/watch?v=${r.video}`} target="_blank" className="hover:text-red-500 text-xs">{r.video}</a></td>
                        <td>{fmt(r.views)}</td>
                        <td>{fmt(r.estimatedMinutesWatched)}</td>
                        <td>{mmss(Math.round(r.averageViewDuration || 0))}</td>
                        <td><span className={`eng-badge ${(r.averageViewPercentage || 0) >= 50 ? "green" : (r.averageViewPercentage || 0) >= 30 ? "orange" : "red"}`}>{pct(r.averageViewPercentage)}%</span></td>
                        <td>{pct(r.impressionClickThroughRate)}%</td>
                        <td>{fmt(r.likes)}</td>
                        <td>{fmt(r.comments)}</td>
                        <td>{fmt(r.shares)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Shorts */}
          {data.shortsOverview && (
            <div className="card" style={{ borderColor: "rgba(255,0,0,0.2)" }}>
              <div className="card-header"><h3>🩳 Shorts Performance</h3></div>
              <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
                <div className="stat-card red"><div className="stat-icon">👁</div><div className="stat-val">{fmt(data.shortsOverview.views)}</div><div className="stat-label">Shorts Views</div></div>
                <div className="stat-card"><div className="stat-icon">⏱</div><div className="stat-val">{fmt(data.shortsOverview.estimatedMinutesWatched)}</div><div className="stat-label">Watch Mins</div></div>
                <div className="stat-card"><div className="stat-icon">👍</div><div className="stat-val">{fmt(data.shortsOverview.likes)}</div><div className="stat-label">Likes</div></div>
                <div className="stat-card"><div className="stat-icon">💬</div><div className="stat-val">{fmt(data.shortsOverview.comments)}</div><div className="stat-label">Comments</div></div>
                <div className="stat-card"><div className="stat-icon">↗</div><div className="stat-val">{fmt(data.shortsOverview.shares)}</div><div className="stat-label">Shares</div></div>
                <div className="stat-card"><div className="stat-icon">➕</div><div className="stat-val">+{fmt(data.shortsOverview.subscribersGained)}</div><div className="stat-label">Subs Gained</div></div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
