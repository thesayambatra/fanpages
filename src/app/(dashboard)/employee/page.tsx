import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { latestSnapshot } from "@/lib/db-helpers";
import Link from "next/link";

export default async function EmployeeDashboard() {
  const session = await requireRole("employee");
  if (!session) redirect("/login");
  const userId = Number((session.user as any).id);

  const myInterns = await prisma.user.findMany({ where: { createdById: userId } });
  const internIds = myInterns.map(i => i.id);
  const allChannels = await prisma.channel.findMany({
    where: { userId: { in: [userId, ...internIds] } },
    include: { user: true },
  });

  let totalSubs = 0, totalViews = 0, totalEng = 0, snapCount = 0;
  for (const ch of allChannels) {
    const snap = await latestSnapshot(ch.id);
    if (snap) { totalSubs += snap.subscribers; totalViews += snap.totalViews; totalEng += snap.engagementRate; snapCount++; }
  }

  // Intern leaderboard
  const leaderboard: any[] = [];
  for (const intern of myInterns) {
    const channels = await prisma.channel.findMany({ where: { userId: intern.id } });
    let subs = 0, views = 0, eng = 0, count = 0;
    for (const ch of channels) {
      const snap = await latestSnapshot(ch.id);
      if (snap) { subs += snap.subscribers; views += snap.totalViews; eng += snap.engagementRate; count++; }
    }
    leaderboard.push({
      id: intern.id, name: intern.fullName, color: intern.avatarColor, username: intern.username,
      channels: channels.length, subscribers: subs, views, avgEng: count ? +(eng / count).toFixed(2) : 0,
    });
  }
  leaderboard.sort((a, b) => b.subscribers - a.subscribers);

  return (
    <>
      <div className="page-header">
        <h2>Employee Dashboard</h2>
        <div className="flex gap-2">
          <Link href="/employee/channels" className="btn-primary">+ Add Channel</Link>
          <Link href="/employee/interns" className="btn-outline">Manage Interns</Link>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card red">
          <div className="stat-icon">📺</div>
          <div className="stat-val">{allChannels.length}</div>
          <div className="stat-label">Total Channels</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-val">{myInterns.length}</div>
          <div className="stat-label">My Interns</div>
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

      {/* Intern Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>My Interns Performance</h3></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Intern</th><th>Channels</th><th>Subscribers</th><th>Views</th><th>Engagement</th></tr>
              </thead>
              <tbody>
                {leaderboard.map((row, i) => (
                  <tr key={row.id}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar" style={{ background: row.color, width: 28, height: 28, fontSize: 11 }}>{row.name[0]}</div>
                        <div>
                          <div className="font-medium text-sm">{row.name}</div>
                          <div className="text-xs text-[var(--muted)]">@{row.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>{row.channels}</td>
                    <td>{row.subscribers.toLocaleString()}</td>
                    <td>{row.views.toLocaleString()}</td>
                    <td>
                      <span className={`eng-badge ${row.avgEng >= 10 ? "green" : row.avgEng >= 3 ? "orange" : "red"}`}>
                        {row.avgEng}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {leaderboard.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-[var(--muted)]">No interns yet. <Link href="/employee/interns" className="text-red-500 hover:underline">Add your first intern</Link></p>
        </div>
      )}
    </>
  );
}
