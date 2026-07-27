import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  // Chart data - only show months with actual data
  const chartLabels: string[] = [];
  const chartJee: number[] = [];
  const chartNeet: number[] = [];
  const chartUpsc: number[] = [];
  const chartK12: number[] = [];

  // Current month data
  const currentMonthLabel = now.toLocaleString("default", { month: "short", year: "numeric" });
  chartLabels.push(currentMonthLabel);
  chartJee.push(categories.JEE.viewsThisMonth);
  chartNeet.push(categories.NEET.viewsThisMonth);
  chartUpsc.push(categories.UPSC.viewsThisMonth);
  chartK12.push(categories.K12.viewsThisMonth);

  return NextResponse.json({
    summary,
    categories,
    chartData: { labels: chartLabels, jee: chartJee, neet: chartNeet, upsc: chartUpsc, k12: chartK12 },
  });
}
