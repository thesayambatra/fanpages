import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { fetchStudioAnalytics } from "@/lib/analytics";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // Allow up to 30s on Vercel Pro (10s on free)

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const tokens = await prisma.oAuthToken.findMany({ include: { channel: true } });
  let totalViews = 0;
  let success = 0;
  let failed = 0;

  // Fetch in parallel batches of 5 to stay within timeout
  const batchSize = 5;
  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (t) => {
        const data = await fetchStudioAnalytics(t.tokenJson, t.channel.channelId, monthStart, today);
        if (data && !data.error && data.overview?.views) return data.overview.views;
        return 0;
      })
    );
    for (const r of results) {
      if (r.status === "fulfilled" && r.value > 0) { totalViews += r.value; success++; }
      else { failed++; }
    }
  }

  return NextResponse.json({ totalViews, success, failed, total: tokens.length });
}
