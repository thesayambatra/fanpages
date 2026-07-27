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

  const channels = await prisma.channel.findMany();
  let success = 0, failed = 0;

  for (const ch of channels) {
    try {
      await refreshChannel(ch.id);
      success++;
    } catch {
      failed++;
    }
    // Small delay to avoid YouTube API rate limits
    await new Promise(r => setTimeout(r, 500));
  }

  return NextResponse.json({ 
    ok: true, 
    refreshed: success, 
    failed, 
    total: channels.length,
    timestamp: new Date().toISOString() 
  });
}
