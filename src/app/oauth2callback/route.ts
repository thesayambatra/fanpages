import { NextRequest, NextResponse } from "next/server";
import { getOAuthClient } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(new URL("/?error=oauth_failed", req.url));
  }

  try {
    const { channelDbId } = JSON.parse(state);
    const client = getOAuthClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    const tokenJson = JSON.stringify(tokens);

    // Get all YouTube channels accessible by this Google account
    const yt = google.youtube({ version: "v3", auth: client });
    const channelRes = await yt.channels.list({
      part: ["id", "snippet"],
      mine: true,
      maxResults: 50,
    });

    const ytChannelIds = (channelRes.data.items || []).map(item => item.id!);

    // Also check for managed channels (Brand Accounts)
    // The "mine: true" already returns all channels the user manages

    // Link token to ALL matching channels in our database
    let linkedCount = 0;
    for (const ytChId of ytChannelIds) {
      // Find all DB channels matching this YouTube channel ID
      const dbChannels = await prisma.channel.findMany({
        where: { channelId: ytChId },
      });
      for (const dbCh of dbChannels) {
        const existing = await prisma.oAuthToken.findUnique({ where: { channelId: dbCh.id } });
        if (existing) {
          await prisma.oAuthToken.update({ where: { channelId: dbCh.id }, data: { tokenJson } });
        } else {
          await prisma.oAuthToken.create({ data: { channelId: dbCh.id, tokenJson } });
        }
        linkedCount++;
      }
    }

    // Also link to the specific channel that initiated the OAuth (even if channel ID didn't match via "mine")
    const initiatingChannel = await prisma.channel.findUnique({ where: { id: Number(channelDbId) } });
    if (initiatingChannel) {
      const existing = await prisma.oAuthToken.findUnique({ where: { channelId: initiatingChannel.id } });
      if (existing) {
        await prisma.oAuthToken.update({ where: { channelId: initiatingChannel.id }, data: { tokenJson } });
      } else {
        await prisma.oAuthToken.create({ data: { channelId: initiatingChannel.id, tokenJson } });
      }
      if (!ytChannelIds.includes(initiatingChannel.channelId)) linkedCount++;
    }

    console.log(`OAuth: linked token to ${linkedCount} channels. YT channels found: ${ytChannelIds.join(", ")}`);

    return NextResponse.redirect(new URL(`/intern/studio?channelId=${channelDbId}&linked=${linkedCount}`, req.url));
  } catch (e: any) {
    console.error("OAuth callback error:", e.message);
    return NextResponse.redirect(new URL("/?error=oauth_failed&msg=" + encodeURIComponent(e.message), req.url));
  }
}
