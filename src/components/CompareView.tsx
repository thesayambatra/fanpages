"use client";

import { useState } from "react";

interface ChannelData {
  id: number;
  channelName: string;
  thumbnail: string;
  subscribers: number;
  totalViews: number;
  videoCount: number;
  avgViews: number;
  engagementRate: number;
  category: string;
  country: string;
  addedBy: string;
  topVideos: { title?: string; views?: number; url?: string }[];
}

export function CompareView({ channels }: { channels: ChannelData[] }) {
  const [selected, setSelected] = useState<number[]>([]);

  const toggleChannel = (id: number) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const selectedChannels = channels.filter((ch) => selected.includes(ch.id));

  return (
    <div>
      {/* Channel Picker */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-header">
          <h3>Select 2–3 Channels to Compare</h3>
          <span className="text-sm text-[var(--muted)]">{selected.length}/3 selected</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", padding: "1rem" }}>
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => toggleChannel(ch.id)}
              className={selected.includes(ch.id) ? "btn-primary btn-sm" : "btn-outline btn-sm"}
            >
              {ch.channelName}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison View */}
      {selectedChannels.length >= 2 && (
        <div className="card">
          <div className="card-header">
            <h3>Comparison</h3>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  {selectedChannels.map((ch) => (
                    <th key={ch.id}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {ch.thumbnail && (
                          <img src={ch.thumbnail} alt="" style={{ width: 28, height: 28, borderRadius: "50%" }} />
                        )}
                        {ch.channelName}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Subscribers</strong></td>
                  {selectedChannels.map((ch) => (
                    <td key={ch.id}>{ch.subscribers.toLocaleString()}</td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Total Views</strong></td>
                  {selectedChannels.map((ch) => (
                    <td key={ch.id}>{ch.totalViews.toLocaleString()}</td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Videos</strong></td>
                  {selectedChannels.map((ch) => (
                    <td key={ch.id}>{ch.videoCount}</td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Avg Views</strong></td>
                  {selectedChannels.map((ch) => (
                    <td key={ch.id}>{ch.avgViews.toLocaleString()}</td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Engagement Rate</strong></td>
                  {selectedChannels.map((ch) => (
                    <td key={ch.id}>
                      <span className={`eng-badge ${ch.engagementRate >= 10 ? "green" : ch.engagementRate >= 3 ? "orange" : "red"}`}>
                        {ch.engagementRate}%
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Category</strong></td>
                  {selectedChannels.map((ch) => (
                    <td key={ch.id}>{ch.category || "—"}</td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Country</strong></td>
                  {selectedChannels.map((ch) => (
                    <td key={ch.id}>{ch.country || "—"}</td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Added By</strong></td>
                  {selectedChannels.map((ch) => (
                    <td key={ch.id}>{ch.addedBy}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Top Videos Section */}
          <div style={{ padding: "1rem" }}>
            <h4 style={{ marginBottom: "1rem" }}>Top Videos</h4>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${selectedChannels.length}, 1fr)`, gap: "1rem" }}>
              {selectedChannels.map((ch) => (
                <div key={ch.id}>
                  <h5 style={{ marginBottom: "0.5rem", color: "var(--muted)" }}>{ch.channelName}</h5>
                  {ch.topVideos.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {ch.topVideos.slice(0, 5).map((vid, i) => (
                        <li key={i} style={{ fontSize: "0.85rem", padding: "0.4rem 0.6rem", background: "var(--card-bg)", borderRadius: "6px" }}>
                          <div style={{ fontWeight: 500 }}>{vid.title || "Untitled"}</div>
                          {vid.views !== undefined && (
                            <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
                              {vid.views.toLocaleString()} views
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-[var(--muted)]">No videos data</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedChannels.length < 2 && (
        <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
          Select at least 2 channels above to see the comparison.
        </div>
      )}
    </div>
  );
}
