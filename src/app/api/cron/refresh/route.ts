import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { refreshChannel } from "@/lib/db-helpers";

// This endpoint is called by Vercel Cron to auto-refresh all channels
// Add to vercel.json: "crons": [{ "path": "/api/cron/refresh", "schedule": "0 6 * * *" }]
export async function GET(req: NextRequest) {
  // Verify cron secret (optional security)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || "auto-refresh-2024"}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Refresh 15 channels per run (to stay within API quota)
  // Uses a rotating offset so all channels get refreshed over multiple days
  const allChannels = await prisma.channel.findMany({ orderBy: { id: "asc" } });
  
  // Get current offset from cache
  const offsetEntry = await prisma.cacheEntry.findUnique({ where: { key: "cron_offset" } });
  let offset = offsetEntry ? Number(offsetEntry.value) : 0;
  if (offset >= allChannels.length) offset = 0;

  const batch = allChannels.slice(offset, offset + 15);
  let success = 0, failed = 0;

  for (const ch of batch) {
    try {
      await refreshChannel(ch.id);
      success++;
    } catch {
      failed++;
    }
    // Delay to avoid YouTube API rate limits
    await new Promise(r => setTimeout(r, 1000));
  }

  // Save next offset
  const nextOffset = offset + 15;
  await prisma.cacheEntry.upsert({
    where: { key: "cron_offset" },
    update: { value: String(nextOffset), updatedAt: new Date() },
    create: { key: "cron_offset", value: String(nextOffset) },
  });

  return NextResponse.json({ 
    ok: true, 
    refreshed: success, 
    failed, 
    batch: `${offset + 1}-${offset + batch.length} of ${allChannels.length}`,
    timestamp: new Date().toISOString() 
  });
}
