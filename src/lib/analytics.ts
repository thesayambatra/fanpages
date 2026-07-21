import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/yt-analytics.readonly",
  "https://www.googleapis.com/auth/youtube.readonly",
];

export function getOAuthClient() {
  const redirectUri = process.env.VERCEL_URL 
    ? `https://fanpages-five.vercel.app/oauth2callback`
    : (process.env.NEXTAUTH_URL || "http://localhost:3000") + "/oauth2callback";
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
}

export function getAuthUrl(channelDbId: number, state: string) {
  const client = getOAuthClient();
  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    state: JSON.stringify({ channelDbId, state }),
  });
  return url;
}

export async function fetchStudioAnalytics(
  tokenJson: string,
  channelId: string,
  startDate: string,
  endDate: string
) {
  try {
    const client = getOAuthClient();
    const creds = JSON.parse(tokenJson);
    client.setCredentials(creds);
    // Refresh if expired
    if (creds.expiry_date && Date.now() > creds.expiry_date) {
      const { credentials } = await client.refreshAccessToken();
      client.setCredentials(credentials);
    }

    const svc = google.youtubeAnalytics({ version: "v2", auth: client });

    // List all channels accessible to this token
    const yt = google.youtube({ version: "v3", auth: client });
    
    // Get all channels this account has access to
    let allAccessibleChannelIds: string[] = [];
    try {
      // Try mine first
      const mineRes = await yt.channels.list({ part: ["id", "snippet"], mine: true, maxResults: 50 });
      allAccessibleChannelIds = (mineRes.data.items || []).map(item => item.id!);
    } catch {}

    // Also try to list channels by the specific ID to see if we have access
    try {
      const specificRes = await yt.channels.list({ part: ["id", "snippet"], id: [channelId] });
      if (specificRes.data.items?.length) {
        allAccessibleChannelIds.push(channelId);
      }
    } catch {}

    const accessibleChannels = allAccessibleChannelIds.map(id => ({ id, name: "" }));

    // Strategy: Try querying with the specific channel ID first
    // If that fails, check if this channel is in our accessible list
    // If still fails, use channel==mine as last resort
    let channelParam = `channel==${channelId}`;
    let usedFallback = false;
    
    try {
      await svc.reports.query({ ids: channelParam, startDate, endDate, metrics: "views" });
    } catch (e: any) {
      // Try with contentOwner if available
      try {
        // Some accounts need this format
        const testRes = await svc.reports.query({ 
          ids: `channel==${channelId}`,
          startDate, endDate, metrics: "views,estimatedMinutesWatched"
        });
      } catch {
        // Final fallback to channel==mine
        channelParam = "channel==mine";
        usedFallback = true;
      }
    }

    const q = (metrics: string, dims?: string, filters?: string, sort?: string, maxResults?: number) =>
      svc.reports.query({
        ids: channelParam,
        startDate,
        endDate,
        metrics,
        ...(dims && { dimensions: dims }),
        ...(filters && { filters }),
        ...(sort && { sort }),
        ...(maxResults && { maxResults }),
      });

    const [overview, daily, traffic, topVids, geo, ageGender, device] = await Promise.all([
      q("views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,likes,comments,shares,subscribersGained,subscribersLost"),
      q("views,estimatedMinutesWatched,likes,subscribersGained", "day", undefined, "day"),
      q("views,estimatedMinutesWatched", "insightTrafficSourceType", undefined, "-views", 10),
      q("views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,likes,comments,shares", "video", undefined, "-views", 15),
      q("views,estimatedMinutesWatched", "country", undefined, "-views", 10),
      q("viewerPercentage", "ageGroup,gender"),
      q("views,estimatedMinutesWatched", "deviceType", undefined, "-views"),
    ]);

    // Impressions are queried separately — try specific channel ID even if main query uses mine
    let impressionsData: any = {};
    try {
      const impRes = await svc.reports.query({
        ids: `channel==${channelId}`,
        startDate, endDate,
        metrics: "impressions,impressionClickThroughRate"
      });
      impressionsData = parseOverview(impRes.data);
    } catch {
      try {
        const impRes = await q("impressions,impressionClickThroughRate");
        impressionsData = parseOverview(impRes.data);
      } catch (e: any) {
        console.log("Impressions not available:", e.message?.slice(0, 100));
      }
    }

    let shortsOverview = null, shortsDaily = null;
    try {
      [shortsOverview, shortsDaily] = await Promise.all([
        q("views,estimatedMinutesWatched,likes,comments,shares,subscribersGained", undefined, "isShortsEligible==1"),
        q("views,estimatedMinutesWatched,likes", "day", "isShortsEligible==1", "day"),
      ]);
    } catch { /* shorts may not be available */ }

    return {
      overview: { ...parseOverview(overview.data), ...impressionsData },
      daily: parseRows(daily.data),
      traffic: parseRows(traffic.data),
      topVideos: parseRows(topVids.data),
      geo: parseRows(geo.data),
      ageGender: parseRows(ageGender.data),
      device: parseRows(device.data),
      shortsOverview: shortsOverview ? parseOverview(shortsOverview.data) : null,
      shortsDaily: shortsDaily ? parseRows(shortsDaily.data) : [],
      accessibleChannels,
      queriedAs: channelParam,
      usedFallback,
    };
  } catch (e: any) {
    const errMsg = e.response?.data?.error?.message || e.message || "Unknown error";
    console.error("Studio Analytics Error:", errMsg, e.response?.data?.error);
    return { error: errMsg };
  }
}

function parseOverview(data: any): Record<string, number> {
  if (!data?.rows?.length) return {};
  const headers = data.columnHeaders.map((h: any) => h.name);
  return Object.fromEntries(headers.map((h: string, i: number) => [h, data.rows[0][i]]));
}

function parseRows(data: any): Record<string, any>[] {
  if (!data?.rows?.length) return [];
  const headers = data.columnHeaders.map((h: any) => h.name);
  return data.rows.map((row: any[]) => Object.fromEntries(headers.map((h: string, i: number) => [h, row[i]])));
}
