import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Returns monthly view totals from snapshots grouped by month
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get all snapshots grouped by month
  const snapshots = await prisma.snapshot.findMany({
    orderBy: { fetchedAt: "asc" },
    select: { channelId: true, totalViews: true, subscribers: true, fetchedAt: true },
  });

  // Group by month - for each channel, get first and last snapshot per month
  const monthlyData: Record<string, { views: number; subs: number; channels: Set<number> }> = {};

  // Get per-channel monthly growth
  const channelMonthly: Record<number, Record<string, { first: number; last: number; firstSubs: number; lastSubs: number }>> = {};

  for (const snap of snapshots) {
    const monthKey = `${snap.fetchedAt.getFullYear()}-${String(snap.fetchedAt.getMonth() + 1).padStart(2, "0")}`;
    
    if (!channelMonthly[snap.channelId]) channelMonthly[snap.channelId] = {};
    if (!channelMonthly[snap.channelId][monthKey]) {
      channelMonthly[snap.channelId][monthKey] = { first: snap.totalViews, last: snap.totalViews, firstSubs: snap.subscribers, lastSubs: snap.subscribers };
    } else {
      channelMonthly[snap.channelId][monthKey].last = snap.totalViews;
      channelMonthly[snap.channelId][monthKey].lastSubs = snap.subscribers;
    }
  }

  // Aggregate monthly views across all channels
  for (const [chId, months] of Object.entries(channelMonthly)) {
    for (const [month, data] of Object.entries(months)) {
      if (!monthlyData[month]) monthlyData[month] = { views: 0, subs: 0, channels: new Set() };
      const growth = Math.max(0, data.last - data.first);
      const subGrowth = Math.max(0, data.lastSubs - data.firstSubs);
      monthlyData[month].views += growth;
      monthlyData[month].subs += subGrowth;
      monthlyData[month].channels.add(Number(chId));
    }
  }

  // Convert to sorted array
  const result = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      label: new Date(month + "-01").toLocaleString("default", { month: "short", year: "numeric" }),
      views: data.views,
      subs: data.subs,
      channels: data.channels.size,
    }));

  return NextResponse.json(result);
}
