import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  // Get all channels with at least 2 snapshots to calculate growth
  const channels = await prisma.channel.findMany({
    include: {
      user: true,
      snapshots: {
        orderBy: { fetchedAt: "desc" },
        take: 2,
      },
    },
  });

  const trending: {
    id: number;
    channelName: string;
    channelId: string;
    thumbnail: string;
    subscriberGrowth: number;
    viewGrowth: number;
    currentSubs: number;
    currentViews: number;
    engagementRate: number;
    addedBy: string;
  }[] = [];

  for (const ch of channels) {
    if (ch.snapshots.length < 2) continue;

    const latest = ch.snapshots[0];
    const previous = ch.snapshots[1];

    const subGrowth = previous.subscribers > 0
      ? ((latest.subscribers - previous.subscribers) / previous.subscribers) * 100
      : 0;

    const viewGrowth = previous.totalViews > 0
      ? ((latest.totalViews - previous.totalViews) / previous.totalViews) * 100
      : 0;

    if (subGrowth > 0 || viewGrowth > 0) {
      trending.push({
        id: ch.id,
        channelName: ch.channelName,
        channelId: ch.channelId,
        thumbnail: latest.thumbnail,
        subscriberGrowth: +subGrowth.toFixed(2),
        viewGrowth: +viewGrowth.toFixed(2),
        currentSubs: latest.subscribers,
        currentViews: latest.totalViews,
        engagementRate: latest.engagementRate,
        addedBy: ch.user?.fullName || "",
      });
    }
  }

  // Sort by subscriber growth percentage descending
  trending.sort((a, b) => b.subscriberGrowth - a.subscriberGrowth);

  return NextResponse.json({ trending: trending.slice(0, 10) });
}
