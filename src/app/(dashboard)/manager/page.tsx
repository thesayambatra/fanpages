import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { channelsVisibleTo, latestSnapshot } from "@/lib/db-helpers";
import Link from "next/link";
import { TrendingChannels } from "@/components/TrendingChannels";
import { RecentPosts } from "@/components/RecentPosts";

export default async function ManagerDashboard() {
  const session = await requireRole("manager");
  if (!session) redirect("/login");

  const employees = await prisma.user.findMany({ where: { role: "employee" } });
  const interns = await prisma.user.findMany({ where: { role: "intern" } });
  const allChannels = await prisma.channel.findMany({ include: { user: true } });

  // Global stats
  let totalSubs = 0, totalViews = 0, totalEng = 0, snapCount = 0;
  const topChannels: { ch: any; subs: number }[] = [];
  for (const ch of allChannels) {
    const snap = await latestSnapshot(ch.id);
    if (snap) {
      totalSubs += snap.subscribers;
      totalViews += snap.totalViews;
      totalEng += snap.engagementRate;
      snapCount++;
      topChannels.push({ ch, subs: snap.subscribers });
    }
  }
  topChannels.sort((a, b) => b.subs - a.subs);

  // Employee leaderboard
  const leaderboard: any[] = [];
  for (const emp of employees) {
    const channels = await channelsVisibleTo(emp.id, "employee");
    const empInterns = await prisma.user.count({ where: { createdById: emp.id } });
    let subs = 0, views = 0, eng = 0, count = 0;
    for (const ch of channels) {
      const snap = await latestSnapshot(ch.id);
      if (snap) { subs += snap.subscribers; views += snap.totalViews; eng += snap.engagementRate; count++; }
    }
    leaderboard.push({
      id: emp.id, name: emp.fullName, color: emp.avatarColor,
      interns: empInterns, channels: channels.length,
      subscribers: subs, views, avgEng: count ? +(eng / count).toFixed(2) : 0,
      score: Math.round(subs * 0.4 + views * 0.3 + (count ? eng / count : 0) * 10000),
    });
  }
  leaderboard.sort((a, b) => b.score - a.score);

  return (
    <>
      <div className="page-header">
        <h2>Manager Dashboard</h2>
        <Link href="/api/export" className="btn-green">⬇ Export Excel</Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card red">
          <div className="stat-icon">📺</div>
          <div className="stat-val">{allChannels.length}</div>
          <div className="stat-label">Total Channels</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-val">{employees.length}</div>
          <div className="stat-label">Employees</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-val">{interns.length}</div>
          <div className="stat-label">Interns</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-val">{totalSubs.toLocaleString()}</div>
          <div className="stat-label">Total Subscribers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👁</div>
          <div className="stat-val">{totalViews.toLocaleString()}</div>
          <div className="stat-label">Total Views</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-val">{snapCount ? (totalEng / snapCount).toFixed(2) : 0}%</div>
          <div className="stat-label">Avg Engagement</div>
        </div>
      </div>

      {/* Employee Leaderboard */}
      <div className="card">
        <div className="card-header"><h3>🏆 Employee Leaderboard</h3></div>
        <div className="leaderboard">
          {leaderboard.map((row, i) => (
            <div key={row.id} className={`lb-row ${i === 0 ? "lb-gold" : i === 1 ? "lb-silver" : i === 2 ? "lb-bronze" : ""}`}>
              <div className="lb-rank">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</div>
              <div className="avatar" style={{ background: row.color }}>{row.name[0]}</div>
              <div className="lb-info">
                <div className="lb-name">{row.name}</div>
                <div className="lb-meta">{row.channels} channels · {row.interns} interns</div>
              </div>
              <div className="lb-stats">
                <span>👥 {row.subscribers.toLocaleString()}</span>
                <span>👁 {row.views.toLocaleString()}</span>
                <span className={`eng-badge ${row.avgEng >= 10 ? "green" : row.avgEng >= 3 ? "orange" : "red"}`}>
                  {row.avgEng}%
                </span>
              </div>
              <div className="lb-score">
                <div className="score-val">{row.score.toLocaleString()}</div>
                <div className="score-label">score</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Channels */}
      <div className="card">
        <div className="card-header"><h3>Top Channels by Subscribers</h3></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Channel</th><th>Added By</th><th>Subscribers</th></tr>
            </thead>
            <tbody>
              {topChannels.slice(0, 10).map((item, i) => (
                <tr key={item.ch.id}>
                  <td>{i + 1}</td>
                  <td>
                    <a href={item.ch.channelUrl} target="_blank" className="hover:text-red-500">
                      {item.ch.channelName || item.ch.channelId}
                    </a>
                  </td>
                  <td>{item.ch.user?.fullName}</td>
                  <td>{item.subs.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trending Channels */}
      <TrendingChannels />

      {/* Recent Posts */}
      <RecentPosts />
    </>
  );
}
