"use client";
import { useState } from "react";

function getDateStr(d: Date) { return d.toISOString().slice(0, 10); }

function thisMonth() {
  const now = new Date();
  return { from: getDateStr(new Date(now.getFullYear(), now.getMonth(), 1)), to: getDateStr(now) };
}
function lastMonth() {
  const now = new Date();
  return { from: getDateStr(new Date(now.getFullYear(), now.getMonth() - 1, 1)), to: getDateStr(new Date(now.getFullYear(), now.getMonth(), 0)) };
}
function last7() {
  const now = new Date();
  return { from: getDateStr(new Date(now.getTime() - 7 * 86400000)), to: getDateStr(now) };
}
function last30() {
  const now = new Date();
  return { from: getDateStr(new Date(now.getTime() - 30 * 86400000)), to: getDateStr(now) };
}

export function GrowthView() {
  const [from, setFrom] = useState(thisMonth().from);
  const [to, setTo] = useState(thisMonth().to);
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async (f?: string, t?: string) => {
    setLoading(true);
    const res = await fetch(`/api/growth?from=${f || from}&to=${t || to}`);
    const json = await res.json();
    setData(Array.isArray(json) ? json : []);
    setLoading(false);
  };

  const quickSelect = (range: { from: string; to: string }) => {
    setFrom(range.from);
    setTo(range.to);
    fetchData(range.from, range.to);
  };

  const totalViewsGrowth = data?.reduce((acc, r) => acc + r.viewsGrowth, 0) || 0;
  const totalSubsGrowth = data?.reduce((acc, r) => acc + r.subsGrowth, 0) || 0;

  return (
    <>
      {/* Filter bar */}
      <div className="card filter-bar">
        <div className="filter-form">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase">From</span>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="form-input" />
          <span className="text-xs font-semibold text-[var(--muted)] uppercase">To</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="form-input" />
          <button onClick={() => fetchData()} disabled={loading} className="btn-primary btn-sm">
            {loading ? "Loading..." : "Apply"}
          </button>
          <button onClick={() => quickSelect(last7())} className="btn-outline btn-sm">7 Days</button>
          <button onClick={() => quickSelect(last30())} className="btn-outline btn-sm">30 Days</button>
          <button onClick={() => quickSelect(thisMonth())} className="btn-outline btn-sm">This Month</button>
          <button onClick={() => quickSelect(lastMonth())} className="btn-outline btn-sm">Last Month</button>
        </div>
      </div>

      {/* Results */}
      {data === null ? (
        <div className="card text-center py-10 text-[var(--muted)]">
          Select a date range and click Apply to see view growth across channels.
        </div>
      ) : data.length === 0 ? (
        <div className="card text-center py-10 text-[var(--muted)]">
          No snapshot data found in this date range. Make sure channels have been refreshed at least twice.
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="stat-grid">
            <div className="stat-card red">
              <div className="stat-icon">📺</div>
              <div className="stat-val">{data.length}</div>
              <div className="stat-label">Channels</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👁</div>
              <div className="stat-val">{totalViewsGrowth >= 0 ? "+" : ""}{totalViewsGrowth.toLocaleString()}</div>
              <div className="stat-label">Views Growth</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-val">{totalSubsGrowth >= 0 ? "+" : ""}{totalSubsGrowth.toLocaleString()}</div>
              <div className="stat-label">Subs Growth</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-val text-sm">{from} → {to}</div>
              <div className="stat-label">Period</div>
            </div>
          </div>

          {/* Table */}
          <div className="card">
            <div className="card-header"><h3>Channel Growth ({from} to {to})</h3></div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th><th>Channel</th><th>Category</th>
                    <th>Views (Start)</th><th>Views (End)</th><th>Views Growth</th>
                    <th>Subs (Start)</th><th>Subs (End)</th><th>Subs Growth</th>
                    <th>Added By</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={row.id}>
                      <td>{i + 1}</td>
                      <td>
                        <a href={row.channelUrl} target="_blank" className="hover:text-red-500">
                          {row.channelName}
                        </a>
                      </td>
                      <td>{row.category ? <span className="tag">{row.category}</span> : "—"}</td>
                      <td>{row.startViews.toLocaleString()}</td>
                      <td>{row.endViews.toLocaleString()}</td>
                      <td>
                        <span className={row.viewsGrowth > 0 ? "text-green-400 font-bold" : row.viewsGrowth < 0 ? "text-red-400 font-bold" : "text-[var(--muted)]"}>
                          {row.viewsGrowth > 0 ? "+" : ""}{row.viewsGrowth.toLocaleString()}
                        </span>
                      </td>
                      <td>{row.startSubs.toLocaleString()}</td>
                      <td>{row.endSubs.toLocaleString()}</td>
                      <td>
                        <span className={row.subsGrowth > 0 ? "text-green-400 font-bold" : row.subsGrowth < 0 ? "text-red-400 font-bold" : "text-[var(--muted)]"}>
                          {row.subsGrowth > 0 ? "+" : ""}{row.subsGrowth.toLocaleString()}
                        </span>
                      </td>
                      <td className="text-xs text-[var(--muted)]">{row.addedBy}</td>
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
