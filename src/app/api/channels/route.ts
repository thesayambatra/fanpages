import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { extractChannelId, fetchChannelStats } from "@/lib/youtube";
import { channelsVisibleTo, enrichChannel } from "@/lib/db-helpers";
import { logActivity } from "@/lib/activity";

// GET /api/channels — list channels visible to current user
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  const channels = await channelsVisibleTo(Number(user.id), user.role);
  const enriched = await Promise.all(channels.map(enrichChannel));
  return NextResponse.json(enriched.filter(Boolean));
}

// POST /api/channels — add a channel
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  if (!["manager", "employee", "intern"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { url, category, notes } = await req.json();
  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

  const channelId = await extractChannelId(url);
  if (!channelId) return NextResponse.json({ error: "Could not resolve channel ID" }, { status: 400 });

  const existing = await prisma.channel.findFirst({
    where: { channelId },
  });
  if (existing) return NextResponse.json({ error: "Channel already tracked (by " + (existing.userId === Number(user.id) ? "you" : "another user") + ")" }, { status: 409 });

  const ch = await prisma.channel.create({
    data: { userId: Number(user.id), channelId, channelUrl: url, category: category || "", notes: notes || "" },
  });

  // Fetch initial stats
  const stats = await fetchChannelStats(channelId);
  if (stats && !("error" in stats)) {
    await prisma.channel.update({ where: { id: ch.id }, data: { channelName: stats.channelName, country: stats.country } });
    await prisma.snapshot.create({
      data: {
        channelId: ch.id,
        subscribers: stats.subscribers,
        totalViews: stats.totalViews,
        videoCount: stats.videoCount,
        avgViews: stats.avgViews,
        engagementRate: stats.engagementRate,
        description: stats.description,
        thumbnail: stats.thumbnail,
        topVideos: JSON.stringify(stats.topVideos),
      },
    });
  }
  await logActivity(Number(user.id), "channel_added", `Added channel: ${channelId} (${category || "no category"})`);
  return NextResponse.json({ ok: true, id: ch.id });
}
