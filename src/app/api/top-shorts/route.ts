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
  const period = searchParams.get("period") || "all";

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

  // Filter by published date if period specified
  let filtered = allVideos;
  if (period !== "all") {
    const now = Date.now();
    let since = 0;
    if (period === "day") since = now - 1 * 86400000;
    else if (period === "week") since = now - 7 * 86400000;
    else if (period === "month") since = now - 30 * 86400000;

    filtered = allVideos.filter(v => {
      if (!v.published) return false;
      return new Date(v.published).getTime() >= since;
    });
  }

  // Sort by views and take top 5
  filtered.sort((a, b) => (b.views || 0) - (a.views || 0));

  return NextResponse.json({
    shorts: filtered.slice(0, 5),
    total: filtered.length,
  });
}
