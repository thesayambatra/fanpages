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
    
    // Try to list channels this account manages (including Brand Accounts)
    let channelListRes;
    try {
      channelListRes = await yt.channels.list({ 
        part: ["id", "snippet"], 
        managedByMe: true, 
        maxResults: 50 
      });
    } catch {
      channelListRes = await yt.channels.list({ part: ["id", "snippet"], mine: true, maxResults: 50 });
    }
    const accessibleChannels = (channelListRes.data.items || []).map(item => ({
      id: item.id!, name: item.snippet?.title || ""
    }));

    // For Brand Accounts, we need onBehalfOfContentOwner or direct channel query
    // Try specific channel first, then mine
    let channelParam = `channel==${channelId}`;
    let queryWorked = false;
    try {
      const testRes = await svc.reports.query({ ids: channelParam, startDate, endDate, metrics: "views" });
      if (testRes.data.rows && testRes.data.rows.length > 0) queryWorked = true;
      else queryWorked = true; // no rows but no error = access granted
    } catch (e: any) {
      // If forbidden, try channel==mine  
      channelParam = "channel==mine";
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

    // Impressions are queried separately (not all channels have access)
    let impressionsData: any = {};
    try {
      const impRes = await q("impressions,impressionClickThroughRate");
      impressionsData = parseOverview(impRes.data);
    } catch (e: any) {
      console.log("Impressions not available for this channel:", e.message?.slice(0, 100));
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
