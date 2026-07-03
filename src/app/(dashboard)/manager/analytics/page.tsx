import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { latestSnapshot } from "@/lib/db-helpers";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";

export default async function ManagerAnalytics({ searchParams }: { searchParams: { [key: string]: string } }) {
  const session = await requireRole("manager");
  if (!session) redirect("/login");

  const allChannels = await prisma.channel.findMany({ include: { user: true } });

  // Build chart data
  const chartLabels: string[] = [];
  const chartSubs: number[] = [];
  const chartViews: number[] = [];
  const chartEng: number[] = [];

  for (const ch of allChannels) {
    const snap = await latestSnapshot(ch.id);
    if (snap) {
      chartLabels.push((ch.channelName || ch.channelId).slice(0, 20));
      chartSubs.push(snap.subscribers);
      chartViews.push(snap.totalViews);
      chartEng.push(snap.engagementRate);
    }
  }

  // Category breakdown
  const catMap: Record<string, { count: number; subs: number; views: number; eng: number[] }> = {};
  for (const ch of allChannels) {
    const snap = await latestSnapshot(ch.id);
    const cat = ch.category || "Uncategorized";
    if (!catMap[cat]) catMap[cat] = { count: 0, subs: 0, views: 0, eng: [] };
    catMap[cat].count++;
    if (snap) {
      catMap[cat].subs += snap.subscribers;
      catMap[cat].views += snap.totalViews;
      catMap[cat].eng.push(snap.engagementRate);
    }
  }
  const catData = Object.entries(catMap).map(([cat, d]) => ({
    category: cat, count: d.count, subscribers: d.subs, views: d.views,
    avgEngagement: d.eng.length ? +(d.eng.reduce((a, b) => a + b, 0) / d.eng.length).toFixed(2) : 0,
  })).sort((a, b) => b.subscribers - a.subscribers);

  const totalSubs = chartSubs.reduce((a, b) => a + b, 0);
  const totalViews = chartViews.reduce((a, b) => a + b, 0);
  const avgEng = chartEng.length ? +(chartEng.reduce((a, b) => a + b, 0) / chartEng.length).toFixed(2) : 0;

  return (
    <>
      <div className="page-header"><h2>📊 Analytics Dashboard</h2></div>

      <div className="stat-grid">
        <div className="stat-card red">
          <div className="stat-icon">📺</div>
          <div className="stat-val">{chartLabels.length}</div>
          <div className="stat-label">Channels</div>
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
          <div className="stat-val">{avgEng}%</div>
          <div className="stat-label">Avg Engagement</div>
        </div>
      </div>

      <AnalyticsCharts
        chartData={{ labels: chartLabels, subscribers: chartSubs, views: chartViews, engagement: chartEng }}
        catData={catData}
      />
    </>
  );
}
