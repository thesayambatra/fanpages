import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { channelsVisibleTo } from "@/lib/db-helpers";

// GET /api/channels/growth?from=2025-06-01&to=2025-06-30
// Returns view/subscriber growth between two dates based on snapshots
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const { searchParams } = new URL(req.url);
  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");

  if (!fromDate || !toDate) {
    return NextResponse.json({ error: "from and to params required" }, { status: 400 });
  }

  const from = new Date(fromDate);
  const to = new Date(toDate + "T23:59:59");

  const channels = await channelsVisibleTo(Number(user.id), user.role);
  const results: any[] = [];

  for (const ch of channels) {
    // Get the earliest snapshot in range (or closest before range start)
    const startSnap = await prisma.snapshot.findFirst({
      where: { channelId: ch.id, fetchedAt: { lte: from } },
      orderBy: { fetchedAt: "desc" },
    }) || await prisma.snapshot.findFirst({
      where: { channelId: ch.id, fetchedAt: { gte: from, lte: to } },
      orderBy: { fetchedAt: "asc" },
    });

    // Get the latest snapshot in range (or closest to range end)
    const endSnap = await prisma.snapshot.findFirst({
      where: { channelId: ch.id, fetchedAt: { lte: to } },
      orderBy: { fetchedAt: "desc" },
    });

    if (!startSnap || !endSnap) continue;

    const viewsGrowth = endSnap.totalViews - startSnap.totalViews;
    const subsGrowth = endSnap.subscribers - startSnap.subscribers;

    results.push({
      id: ch.id,
      channelId: ch.channelId,
      channelName: ch.channelName || ch.channelId,
      channelUrl: ch.channelUrl,
      category: ch.category,
      addedBy: (ch as any).user?.fullName || "",
      startDate: startSnap.fetchedAt.toISOString().slice(0, 10),
      endDate: endSnap.fetchedAt.toISOString().slice(0, 10),
      startViews: startSnap.totalViews,
      endViews: endSnap.totalViews,
      viewsGrowth,
      startSubs: startSnap.subscribers,
      endSubs: endSnap.subscribers,
      subsGrowth,
      currentViews: endSnap.totalViews,
      currentSubs: endSnap.subscribers,
      engagementRate: endSnap.engagementRate,
    });
  }

  results.sort((a, b) => b.viewsGrowth - a.viewsGrowth);
  return NextResponse.json(results);
}
