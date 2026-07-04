"use client";

import { useEffect, useState } from "react";

interface TrendingChannel {
  id: number;
  channelName: string;
  thumbnail: string;
  subscriberGrowth: number;
  viewGrowth: number;
  currentSubs: number;
  currentViews: number;
  engagementRate: number;
  addedBy: string;
}

export function TrendingChannels() {
  const [trending, setTrending] = useState<TrendingChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trending")
      .then((res) => res.json())
      .then((data) => {
        setTrending(data.trending || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="card-header"><h3>🚀 Trending Channels</h3></div>
        <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)" }}>Loading...</div>
      </div>
    );
  }

  if (trending.length === 0) {
    return (
      <div className="card">
        <div className="card-header"><h3>🚀 Trending Channels</h3></div>
        <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)" }}>
          Not enough snapshot data to detect trends yet.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header"><h3>🚀 Trending Channels</h3></div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Channel</th>
              <th>Sub Growth</th>
              <th>View Growth</th>
              <th>Subscribers</th>
              <th>Engagement</th>
            </tr>
          </thead>
          <tbody>
            {trending.map((ch, i) => (
              <tr key={ch.id}>
                <td>{i + 1}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {ch.thumbnail && (
                      <img src={ch.thumbnail} alt="" style={{ width: 28, height: 28, borderRadius: "50%" }} />
                    )}
                    {ch.channelName}
                  </div>
                </td>
                <td style={{ color: "#22c55e", fontWeight: 600 }}>+{ch.subscriberGrowth}%</td>
                <td style={{ color: "#22c55e", fontWeight: 600 }}>+{ch.viewGrowth}%</td>
                <td>{ch.currentSubs.toLocaleString()}</td>
                <td>
                  <span className={`eng-badge ${ch.engagementRate >= 10 ? "green" : ch.engagementRate >= 3 ? "orange" : "red"}`}>
                    {ch.engagementRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
