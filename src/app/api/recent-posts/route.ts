import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";

const API_KEY = process.env.YOUTUBE_API_KEY!;

// GET /api/recent-posts?days=1 (default: today's posts)
// Fetches recent videos from ALL tracked channels
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") || "1");

  const channels = await prisma.channel.findMany({ include: { user: true }, take: 15 });
  const yt = google.youtube({ version: "v3", auth: API_KEY });

  const since = new Date(Date.now() - days * 86400000).toISOString();
  const allVideos: any[] = [];

  for (const ch of channels) {
    try {
      const searchRes = await yt.search.list({
        part: ["snippet"],
        channelId: ch.channelId,
        order: "date",
        type: ["video"],
        maxResults: 10,
        publishedAfter: since,
      });

      const videoIds = (searchRes.data.items || [])
        .map(i => i.id?.videoId)
        .filter(Boolean) as string[];

      if (videoIds.length === 0) continue;

      const vidRes = await yt.videos.list({
        part: ["snippet", "statistics", "contentDetails"],
        id: videoIds,
      });

      for (const v of vidRes.data.items || []) {
        const duration = v.contentDetails?.duration || "";
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const seconds = match
          ? (parseInt(match[1] || "0") * 3600 + parseInt(match[2] || "0") * 60 + parseInt(match[3] || "0"))
          : 0;

        allVideos.push({
          videoId: v.id,
          title: v.snippet?.title || "",
          thumbnail: v.snippet?.thumbnails?.medium?.url || "",
          publishedAt: v.snippet?.publishedAt || "",
          views: parseInt(v.statistics?.viewCount || "0"),
          likes: parseInt(v.statistics?.likeCount || "0"),
          comments: parseInt(v.statistics?.commentCount || "0"),
          duration: seconds,
          isShort: seconds <= 60,
          channelName: ch.channelName,
          channelId: ch.channelId,
          category: ch.category,
          addedBy: ch.user?.fullName || "",
          url: `https://youtube.com/watch?v=${v.id}`,
        });
      }
    } catch {
      // Skip channels that error
    }
  }

  // Sort by published date (newest first)
  allVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return NextResponse.json({
    videos: allVideos,
    totalChannels: channels.length,
    period: days === 1 ? "Today" : `Last ${days} days`,
  });
}
