import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/top-shorts — returns top 5 videos from stored snapshots (instant, no YouTube API calls)
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "all";

  // Get channels filtered by category
  const where: any = {};
  if (category !== "all") where.category = category;
  const channels = await prisma.channel.findMany({ where, include: { user: true } });

  // Get top videos from stored snapshots
  const allVideos: any[] = [];
  for (const ch of channels) {
    const snap = await prisma.snapshot.findFirst({
      where: { channelId: ch.id },
      orderBy: { fetchedAt: "desc" },
    });
    if (snap && snap.topVideos) {
      try {
        const videos = JSON.parse(snap.topVideos || "[]");
        for (const v of videos) {
          allVideos.push({
            ...v,
            channelName: ch.channelName,
            category: ch.category,
            managedBy: ch.user?.fullName || "",
          });
        }
      } catch {}
    }
  }

  // Sort by views and take top 5
  allVideos.sort((a, b) => (b.views || 0) - (a.views || 0));

  return NextResponse.json({
    shorts: allVideos.slice(0, 5),
    total: allVideos.length,
  });
}
