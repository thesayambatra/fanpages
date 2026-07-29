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

  // Monthly views for ALL channels
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let allMonthlyViews = 0;
  for (const ch of allChannels) {
    const earliest = await prisma.snapshot.findFirst({ where: { channelId: ch.id, fetchedAt: { gte: monthStart } }, orderBy: { fetchedAt: "asc" } });
    const latest = await prisma.snapshot.findFirst({ where: { channelId: ch.id }, orderBy: { fetchedAt: "desc" } });
    if (earliest && latest && earliest.id !== latest.id) {
      allMonthlyViews += Math.max(0, latest.totalViews - earliest.totalViews);
    }
  }

  // Intern leaderboard - monthly views from snapshot comparison
  const leaderboard: any[] = [];
  for (const intern of interns) {
    const channels = await prisma.channel.findMany({ where: { userId: intern.id } });
    let subs = 0, monthlyViews = 0, count = 0;
    for (const ch of channels) {
      const latest = await prisma.snapshot.findFirst({ where: { channelId: ch.id }, orderBy: { fetchedAt: "desc" } });
      const earliest = await prisma.snapshot.findFirst({ where: { channelId: ch.id, fetchedAt: { gte: monthStart } }, orderBy: { fetchedAt: "asc" } });
      if (latest) subs += latest.subscribers;
      if (latest && earliest && latest.id !== earliest.id) {
        monthlyViews += Math.max(0, latest.totalViews - earliest.totalViews);
      }
      if (latest) count++;
    }
    const manager = intern.createdById ? await prisma.user.findUnique({ where: { id: intern.createdById } }) : null;
    leaderboard.push({
      id: intern.id, name: intern.fullName, color: intern.avatarColor,
      channels: channels.length, subscribers: subs, monthlyViews,
      managedBy: manager?.fullName || "—",
    });
  }
  leaderboard.sort((a, b) => b.monthlyViews - a.monthlyViews);

  return (
    <>
      <div className="page-header">
        <h2>Manager Dashboard</h2>
        <Link href="/api/export" className="btn-green">⬇ Export Excel</Link>
      </div>

      {/* Quick Links */}
      <div className="card" style={{ padding: "0.75rem 1rem", marginBottom: "1.5rem" }}>
        <div className="flex gap-2 flex-wrap">
          <Link href="/manager/top-videos" className="btn-outline btn-sm">🎬 Top Videos</Link>
          <Link href="/manager/compare" className="btn-outline btn-sm">⚖️ Compare</Link>
        </div>
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
        <div className="stat-card" style={{ borderLeft: "3px solid #08bd80" }}>
          <div className="stat-icon">📅</div>
          <div className="stat-val" style={{ color: "#08bd80" }}>+{allMonthlyViews.toLocaleString()}</div>
          <div className="stat-label">Views This Month</div>
        </div>
      </div>

      {/* Intern Leaderboard */}
      <div className="card">
        <div className="card-header"><h3>🏆 Intern Leaderboard</h3></div>
        <div className="leaderboard">
          {leaderboard.map((row, i) => (
            <div key={row.id} className={`lb-row ${i === 0 ? "lb-gold" : i === 1 ? "lb-silver" : i === 2 ? "lb-bronze" : ""}`}>
              <div className="lb-rank">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</div>
              <div className="avatar" style={{ background: row.color }}>{row.name[0]}</div>
              <div className="lb-info">
                <div className="lb-name">{row.name}</div>
                <div className="lb-meta">{row.channels} channels · under {row.managedBy}</div>
              </div>
              <div className="lb-stats">
                <span>👥 {row.subscribers.toLocaleString()}</span>
                <span style={{ color: "var(--red)", fontWeight: "bold" }}>👁 +{Math.max(0, row.monthlyViews).toLocaleString()} this month</span>
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
