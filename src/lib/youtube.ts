import { google } from "googleapis";

const API_KEY = process.env.YOUTUBE_API_KEY!;

function getYT() {
  return google.youtube({ version: "v3", auth: API_KEY });
}

export async function extractChannelId(input: string): Promise<string | null> {
  input = input.trim();
  // Direct channel ID
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(input)) return input;

  const yt = getYT();

  // Handle / @handle URL
  const handleMatch = input.match(/@([a-zA-Z0-9_.-]+)/);
  if (handleMatch) {
    try {
      const res = await yt.search.list({
        part: ["snippet"],
        q: "@" + handleMatch[1],
        type: ["channel"],
        maxResults: 1,
      });
      const item = res.data.items?.[0];
      if (item?.snippet?.channelId) return item.snippet.channelId;
    } catch { return null; }
  }

  // /channel/UCxxx
  const chanMatch = input.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/);
  if (chanMatch) return chanMatch[1];

  // /c/username or /user/username
  const userMatch = input.match(/(?:\/c\/|\/user\/)([a-zA-Z0-9_.-]+)/);
  if (userMatch) {
    try {
      const res = await yt.channels.list({ part: ["id"], forUsername: userMatch[1] });
      if (res.data.items?.[0]?.id) return res.data.items[0].id!;
    } catch { return null; }
  }

  return null;
}

export async function fetchChannelStats(channelId: string) {
  try {
    const yt = getYT();
    const res = await yt.channels.list({
      part: ["snippet", "statistics", "contentDetails", "brandingSettings"],
      id: [channelId],
    });
    if (!res.data.items?.length) return null;
    const item = res.data.items[0];
    const stats = item.statistics!;
    const snippet = item.snippet!;

    const subscribers = parseInt(stats.subscriberCount || "0");
    const totalViews  = parseInt(stats.viewCount || "0");
    const videoCount  = parseInt(stats.videoCount || "0");
    const avgViews    = videoCount > 0 ? Math.round(totalViews / videoCount) : 0;
    const engagementRate = subscribers > 0 ? parseFloat(((avgViews / subscribers) * 100).toFixed(2)) : 0;
    const thumbnail   = snippet.thumbnails?.high?.url || "";

    const topVideos = await fetchTopVideos(channelId, yt);

    return {
      channelId,
      channelName: snippet.title || "N/A",
      description: (snippet.description || "").slice(0, 300),
      country: snippet.country || "N/A",
      thumbnail,
      subscribers,
      totalViews,
      videoCount,
      avgViews,
      engagementRate,
      topVideos,
    };
  } catch (e: any) {
    return { error: e.message, channelId };
  }
}

async function fetchTopVideos(channelId: string, yt: any) {
  try {
    const searchRes = await yt.search.list({
      part: ["snippet"],
      channelId,
      order: "viewCount",
      type: ["video"],
      maxResults: 5,
    });
    const videos = [];
    for (const item of searchRes.data.items || []) {
      const vidId = item.id?.videoId;
      if (!vidId) continue;
      const vidRes = await yt.videos.list({ part: ["statistics", "snippet"], id: [vidId] });
      const v = vidRes.data.items?.[0];
      if (!v) continue;
      videos.push({
        videoId: vidId,
        title: v.snippet?.title || "",
        thumbnail: v.snippet?.thumbnails?.medium?.url || "",
        views: parseInt(v.statistics?.viewCount || "0"),
        likes: parseInt(v.statistics?.likeCount || "0"),
        comments: parseInt(v.statistics?.commentCount || "0"),
        published: v.snippet?.publishedAt?.slice(0, 10) || "",
        url: `https://www.youtube.com/watch?v=${vidId}`,
      });
    }
    return videos;
  } catch {
    return [];
  }
}
