"use client";
import { useState, useEffect } from "react";

export function MonthlyViewsCard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/monthly-views")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="stat-card">
      <div className="stat-icon">📅</div>
      <div className="stat-val" style={{ color: "#08bd80" }}>
        {loading ? "..." : data?.totalViews ? `+${data.totalViews.toLocaleString()}` : "+0"}
      </div>
      <div className="stat-label">Views This Month</div>
      {!loading && data && (
        <div className="text-[9px] text-[var(--muted)] mt-1">{data.success}/{data.total} studio channels</div>
      )}
    </div>
  );
}
