import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check cache first — only refresh from Studio once per day
  const cached = await prisma.cacheEntry.findUnique({ where: { key: "analytics_monthly" } });
  if (cached) {
    const age = Date.now() - cached.updatedAt.getTime();
    if (age < 12 * 60 * 60 * 1000) { // 12 hours cache
      return NextResponse.json(JSON.parse(cached.value));
    }
  }

  const channels = await prisma.channel.findMany();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Per-category stats
  const categories: Record<string, { viewsThisMonth: number; viewsLastMonth: number; subsGrowth: number; shortsPosted: number; totalChannels: number }> = {
    JEE: { viewsThisMonth: 0, viewsLastMonth: 0, subsGrowth: 0, shortsPosted: 0, totalChannels: 0 },
    NEET: { viewsThisMonth: 0, viewsLastMonth: 0, subsGrowth: 0, shortsPosted: 0, totalChannels: 0 },
    UPSC: { viewsThisMonth: 0, viewsLastMonth: 0, subsGrowth: 0, shortsPosted: 0, totalChannels: 0 },
    K12: { viewsThisMonth: 0, viewsLastMonth: 0, subsGrowth: 0, shortsPosted: 0, totalChannels: 0 },
  };

  for (const ch of channels) {
    const cat = ch.category || "Other";
    if (!categories[cat]) continue;
    categories[cat].totalChannels++;

    // This month growth
    const earliestThisMonth = await prisma.snapshot.findFirst({
      where: { channelId: ch.id, fetchedAt: { gte: monthStart } },
      orderBy: { fetchedAt: "asc" },
    });
    const latest = await prisma.snapshot.findFirst({
      where: { channelId: ch.id },
      orderBy: { fetchedAt: "desc" },
    });
    if (earliestThisMonth && latest && earliestThisMonth.id !== latest.id) {
      categories[cat].viewsThisMonth += Math.max(0, latest.totalViews - earliestThisMonth.totalViews);
      categories[cat].subsGrowth += Math.max(0, latest.subscribers - earliestThisMonth.subscribers);
      categories[cat].shortsPosted += Math.max(0, latest.videoCount - earliestThisMonth.videoCount);
    }

    // Last month growth
    const earliestLastMonth = await prisma.snapshot.findFirst({
      where: { channelId: ch.id, fetchedAt: { gte: lastMonthStart, lte: lastMonthEnd } },
      orderBy: { fetchedAt: "asc" },
    });
    const latestLastMonth = await prisma.snapshot.findFirst({
      where: { channelId: ch.id, fetchedAt: { lte: lastMonthEnd } },
      orderBy: { fetchedAt: "desc" },
    });
    if (earliestLastMonth && latestLastMonth && earliestLastMonth.id !== latestLastMonth.id) {
      categories[cat].viewsLastMonth += Math.max(0, latestLastMonth.totalViews - earliestLastMonth.totalViews);
    }
  }

  // Summary (all categories combined)
  const summary = {
    viewsThisMonth: Object.values(categories).reduce((s, c) => s + c.viewsThisMonth, 0),
    viewsLastMonth: Object.values(categories).reduce((s, c) => s + c.viewsLastMonth, 0),
    subsGrowth: Object.values(categories).reduce((s, c) => s + c.subsGrowth, 0),
    shortsPosted: Object.values(categories).reduce((s, c) => s + c.shortsPosted, 0),
    totalChannels: channels.length,
  };

  // Chart data - fetch monthly views from Studio (one call per channel, monthly dimension)
  const chartLabels: string[] = [];
  const chartJee: number[] = [];
  const chartNeet: number[] = [];
  const chartUpsc: number[] = [];
  const chartK12: number[] = [];

  // Last 5 months labels
  for (let i = 4; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    chartLabels.push(m.toLocaleString("default", { month: "short" }));
  }
  
  // Initialize arrays
  for (let i = 0; i < 5; i++) { chartJee.push(0); chartNeet.push(0); chartUpsc.push(0); chartK12.push(0); }

  // Get Studio-connected channels and fetch monthly views in parallel
  const tokens = await prisma.oAuthToken.findMany({ include: { channel: true } });

  const { google } = await import("googleapis");
  const { getOAuthClient } = await import("@/lib/analytics");

  // For each month, fetch views from all channels in parallel
  for (let i = 4; i >= 0; i--) {
    const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1).toISOString().slice(0, 10);
    const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0).toISOString().slice(0, 10);

    const results = await Promise.allSettled(tokens.map(async (t) => {
      try {
        const client = getOAuthClient();
        const creds = JSON.parse(t.tokenJson);
        client.setCredentials(creds);
        const svc = google.youtubeAnalytics({ version: "v2", auth: client });
        const res = await svc.reports.query({
          ids: "channel==mine",
          startDate: mStart, endDate: mEnd,
          metrics: "views",
        });
        const views = res.data.rows?.[0]?.[0] || 0;
        return { category: t.channel.category, views: Number(views) };
      } catch { return { category: "", views: 0 }; }
    }));

    for (const r of results) {
      if (r.status !== "fulfilled" || !r.value.views) continue;
      const { category: cat, views } = r.value;
      if (cat === "JEE") chartJee[4 - i] += views;
      else if (cat === "NEET") chartNeet[4 - i] += views;
      else if (cat === "UPSC") chartUpsc[4 - i] += views;
      else if (cat === "K12") chartK12[4 - i] += views;
    }
  }

  const responseData = {
    summary,
    categories,
    chartData: { labels: chartLabels, jee: chartJee, neet: chartNeet, upsc: chartUpsc, k12: chartK12 },
  };

  // Save to cache
  await prisma.cacheEntry.upsert({
    where: { key: "analytics_monthly" },
    update: { value: JSON.stringify(responseData), updatedAt: new Date() },
    create: { key: "analytics_monthly", value: JSON.stringify(responseData) },
  });

  return NextResponse.json(responseData);
}
