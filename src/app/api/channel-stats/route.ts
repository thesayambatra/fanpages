import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";

const API_KEY = process.env.YOUTUBE_API_KEY!;

// GET /api/channel-stats?channelId=1&period=28
// Returns detailed video-level stats for a channel using just the Data API (no OAuth needed)
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const channelDbId = Number(searchParams.get("channelId"));
  const period = Number(searchParams.get("period") || "28");

  const ch = await prisma.channel.findUnique({ where: { id: channelDbId } });
  if (!ch) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const yt = google.youtube({ version: "v3", auth: API_KEY });

  try {
    // Get channel info
    const channelRes = await yt.channels.list({
      part: ["snippet", "statistics", "brandingSettings"],
      id: [ch.channelId],
    });
    const channelData = channelRes.data.items?.[0];
    if (!channelData) return NextResponse.json({ error: "Channel not found on YouTube" }, { status: 404 });

    const stats = channelData.statistics!;
    const subscribers = parseInt(stats.subscriberCount || "0");
    const totalViews = parseInt(stats.viewCount || "0");
    const videoCount = parseInt(stats.videoCount || "0");

    // Get recent videos (last N days worth)
    const since = new Date(Date.now() - period * 86400000).toISOString();
    const searchRes = await yt.search.list({
      part: ["snippet"],
      channelId: ch.channelId,
      order: "date",
      type: ["video"],
      maxResults: 50,
      publishedAfter: since,
    });

    const videoIds = (searchRes.data.items || []).map(i => i.id?.videoId).filter(Boolean) as string[];

    // Get detailed stats for each video
    let videos: any[] = [];
    if (videoIds.length > 0) {
      const vidRes = await yt.videos.list({
        part: ["snippet", "statistics", "contentDetails"],
        id: videoIds,
      });
      videos = (vidRes.data.items || []).map(v => {
        const vStats = v.statistics!;
        const duration = v.contentDetails?.duration || "";
        // Parse ISO 8601 duration
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const seconds = match ? (parseInt(match[1] || "0") * 3600 + parseInt(match[2] || "0") * 60 + parseInt(match[3] || "0")) : 0;
        const isShort = seconds <= 60;

        return {
          videoId: v.id,
          title: v.snippet?.title || "",
          thumbnail: v.snippet?.thumbnails?.medium?.url || "",
          publishedAt: v.snippet?.publishedAt?.slice(0, 10) || "",
          views: parseInt(vStats.viewCount || "0"),
          likes: parseInt(vStats.likeCount || "0"),
          comments: parseInt(vStats.commentCount || "0"),
          duration: seconds,
          isShort,
          url: `https://youtube.com/watch?v=${v.id}`,
        };
      });
    }

    // Also get top performing videos (all time)
    const topSearchRes = await yt.search.list({
      part: ["snippet"],
      channelId: ch.channelId,
      order: "viewCount",
      type: ["video"],
      maxResults: 10,
    });
    const topVideoIds = (topSearchRes.data.items || []).map(i => i.id?.videoId).filter(Boolean) as string[];
    let topVideos: any[] = [];
    if (topVideoIds.length > 0) {
      const topVidRes = await yt.videos.list({ part: ["snippet", "statistics", "contentDetails"], id: topVideoIds });
      topVideos = (topVidRes.data.items || []).map(v => {
        const vStats = v.statistics!;
        const duration = v.contentDetails?.duration || "";
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const seconds = match ? (parseInt(match[1] || "0") * 3600 + parseInt(match[2] || "0") * 60 + parseInt(match[3] || "0")) : 0;
        return {
          videoId: v.id,
          title: v.snippet?.title || "",
          thumbnail: v.snippet?.thumbnails?.medium?.url || "",
          publishedAt: v.snippet?.publishedAt?.slice(0, 10) || "",
          views: parseInt(vStats.viewCount || "0"),
          likes: parseInt(vStats.likeCount || "0"),
          comments: parseInt(vStats.commentCount || "0"),
          duration: seconds,
          isShort: seconds <= 60,
          url: `https://youtube.com/watch?v=${v.id}`,
        };
      });
    }

    // Calculate engagement metrics
    const recentViews = videos.reduce((sum, v) => sum + v.views, 0);
    const recentLikes = videos.reduce((sum, v) => sum + v.likes, 0);
    const recentComments = videos.reduce((sum, v) => sum + v.comments, 0);
    const shorts = videos.filter(v => v.isShort);
    const longs = videos.filter(v => !v.isShort);

    return NextResponse.json({
      channel: {
        name: channelData.snippet?.title,
        thumbnail: channelData.snippet?.thumbnails?.high?.url,
        subscribers,
        totalViews,
        videoCount,
        country: channelData.snippet?.country || "N/A",
      },
      period: { days: period, videosPosted: videos.length, shorts: shorts.length, longs: longs.length },
      recentStats: { views: recentViews, likes: recentLikes, comments: recentComments, engagementRate: recentViews > 0 ? +((recentLikes + recentComments) / recentViews * 100).toFixed(2) : 0 },
      recentVideos: videos.sort((a, b) => b.views - a.views),
      topVideos,
      shortsStats: {
        count: shorts.length,
        views: shorts.reduce((s, v) => s + v.views, 0),
        likes: shorts.reduce((s, v) => s + v.likes, 0),
        comments: shorts.reduce((s, v) => s + v.comments, 0),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
