import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check cache first
  const cached = await prisma.cacheEntry.findUnique({ where: { key: "analytics_monthly" } });
  if (cached) {
    const age = Date.now() - cached.updatedAt.getTime();
    if (age < 1 * 60 * 60 * 1000) { // 1 hour cache
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

  // Chart data - use snapshot comparison for each month (reliable, no API calls)
  const chartLabels: string[] = [];
  const chartJee: number[] = [];
  const chartNeet: number[] = [];
  const chartUpsc: number[] = [];
  const chartK12: number[] = [];

  for (let i = 4; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    chartLabels.push(m.toLocaleString("default", { month: "short" }));
  }

  // For current month (i=0), use the category data we already calculated
  // For past months, we don't have snapshot data yet so show 0
  for (let i = 0; i < 5; i++) {
    if (i === 4) { // Current month (last position)
      chartJee.push(categories.JEE.viewsThisMonth);
      chartNeet.push(categories.NEET.viewsThisMonth);
      chartUpsc.push(categories.UPSC.viewsThisMonth);
      chartK12.push(categories.K12.viewsThisMonth);
    } else {
      // No historical snapshot data for past months - show 0
      chartJee.push(0);
      chartNeet.push(0);
      chartUpsc.push(0);
      chartK12.push(0);
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
