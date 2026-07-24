import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";

const API_KEY = process.env.YOUTUBE_API_KEY!;

export const dynamic = "force-dynamic";

// GET /api/top-shorts?period=week&category=all
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "week";
  const category = searchParams.get("category") || "all";

  let days = 7;
  if (period === "day") days = 1;
  else if (period === "month") days = 30;
  else if (period === "overall") days = 365;

  const since = new Date(Date.now() - days * 86400000).toISOString();

  // Get channels filtered by category
  const where: any = {};
  if (category !== "all") where.category = category;
  const channels = await prisma.channel.findMany({ where, include: { user: true }, take: 20 });

  const yt = google.youtube({ version: "v3", auth: API_KEY });
  const allShorts: any[] = [];

  for (const ch of channels) {
    try {
      const searchRes = await yt.search.list({
        part: ["snippet"],
        channelId: ch.channelId,
        order: "viewCount",
        type: ["video"],
        maxResults: 5,
        ...(period !== "overall" && { publishedAfter: since }),
      });

      const videoIds = (searchRes.data.items || []).map(i => i.id?.videoId).filter(Boolean) as string[];
      if (videoIds.length === 0) continue;

      const vidRes = await yt.videos.list({
        part: ["snippet", "statistics", "contentDetails"],
        id: videoIds,
      });

      for (const v of vidRes.data.items || []) {
        const duration = v.contentDetails?.duration || "";
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const seconds = match ? (parseInt(match[1] || "0") * 3600 + parseInt(match[2] || "0") * 60 + parseInt(match[3] || "0")) : 0;
        if (seconds > 60) continue; // Only shorts (<=60s)

        allShorts.push({
          videoId: v.id,
          title: v.snippet?.title || "",
          thumbnail: v.snippet?.thumbnails?.medium?.url || "",
          publishedAt: v.snippet?.publishedAt || "",
          views: parseInt(v.statistics?.viewCount || "0"),
          likes: parseInt(v.statistics?.likeCount || "0"),
          comments: parseInt(v.statistics?.commentCount || "0"),
          duration: seconds,
          channelName: ch.channelName,
          category: ch.category,
          managedBy: ch.user?.fullName || "",
          url: `https://youtube.com/shorts/${v.id}`,
        });
      }
    } catch { /* skip */ }
  }

  allShorts.sort((a, b) => b.views - a.views);

  return NextResponse.json({
    shorts: allShorts.slice(0, 50),
    total: allShorts.length,
    period,
    category,
  });
}
