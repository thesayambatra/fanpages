import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { latestSnapshot } from "@/lib/db-helpers";
import Link from "next/link";

export default async function InternDashboard() {
  const session = await requireRole("intern");
  if (!session) redirect("/login");
  const userId = Number((session.user as any).id);

  const channels = await prisma.channel.findMany({ where: { userId } });
  let totalSubs = 0, totalViews = 0, snapCount = 0;
  let monthlyViews = 0;
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const channelData: any[] = [];
  const categoryViews: Record<string, number> = {};

  for (const ch of channels) {
    const snap = await latestSnapshot(ch.id);
    if (snap) { 
      totalSubs += snap.subscribers; 
      totalViews += snap.totalViews; 
      snapCount++; 

      // Category total
      const cat = ch.category || "Other";

      // Monthly views
      const earliest = await prisma.snapshot.findFirst({
        where: { channelId: ch.id, fetchedAt: { gte: monthStart } },
        orderBy: { fetchedAt: "asc" },
      });
      if (earliest && snap.id !== earliest.id) {
        const growth = Math.max(0, snap.totalViews - earliest.totalViews);
        monthlyViews += growth;
        categoryViews[cat] = (categoryViews[cat] || 0) + growth;
      }
    }
    channelData.push({ ...ch, snap });
  }

  return (
    <>
      <div className="page-header">
        <h2>Welcome back, {(session.user as any).name} 👋</h2>
        <Link href="/intern/channels" className="btn-primary">+ Add Channel</Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">📺</div>
          <div className="stat-val">{channels.length}</div>
          <div className="stat-label">Channels Tracked</div>
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
          <div className="stat-val" style={{ color: "#08bd80" }}>+{monthlyViews.toLocaleString()}</div>
          <div className="stat-label">Your Views This Month</div>
        </div>
      </div>

      {/* Category breakdown - views this month */}
      {Object.keys(categoryViews).length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Your Views This Month by Category</h3></div>
          <div className="stat-grid">
            {Object.entries(categoryViews).sort((a, b) => b[1] - a[1]).map(([cat, views]) => (
              <div key={cat} className="stat-card">
                <div className="stat-val" style={{ color: "#08bd80" }}>+{views.toLocaleString()}</div>
                <div className="stat-label">{cat}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header"><h3>My Channels</h3></div>
        {channelData.length > 0 ? (
          <div className="channel-grid">
            {channelData.map(ch => (
              <div key={ch.id} className="channel-card">
                {ch.snap?.thumbnail ? (
                  <img src={ch.snap.thumbnail} className="ch-thumb" alt="" />
                ) : (
                  <div className="ch-thumb-placeholder">▶</div>
                )}
                <div className="ch-info">
                  <a href={ch.channelUrl} target="_blank" className="ch-name">{ch.channelName || ch.channelId}</a>
                  <div className="ch-meta">
                    {ch.category && <span className="tag">{ch.category}</span>}
                    {ch.country && <span className="tag">{ch.country}</span>}
                  </div>
                  {ch.snap && (
                    <>
                      <div className="ch-stats">
                        <span>👥 {ch.snap.subscribers.toLocaleString()}</span>
                        <span>👁 {ch.snap.totalViews.toLocaleString()}</span>
                        <span className={`eng-badge ${ch.snap.engagementRate >= 10 ? "green" : ch.snap.engagementRate >= 3 ? "orange" : "red"}`}>
                          {ch.snap.engagementRate}%
                        </span>
                      </div>
                      <div className="ch-date">Updated {ch.snap.fetchedAt.toLocaleDateString()}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--muted)]">
            📭 No channels yet. <Link href="/intern/channels" className="text-red-500">Add your first channel</Link>
          </div>
        )}
      </div>
    </>
  );
}
