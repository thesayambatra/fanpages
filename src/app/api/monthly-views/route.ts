import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Fast approach: compare snapshots for monthly views
// Works after channels have been refreshed at least twice this month
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const channels = await prisma.channel.findMany();
  
  let totalMonthlyViews = 0;
  let channelsWithData = 0;

  for (const ch of channels) {
    // Get earliest snapshot this month
    const earliest = await prisma.snapshot.findFirst({
      where: { channelId: ch.id, fetchedAt: { gte: monthStart } },
      orderBy: { fetchedAt: "asc" },
    });
    // Get latest snapshot
    const latest = await prisma.snapshot.findFirst({
      where: { channelId: ch.id },
      orderBy: { fetchedAt: "desc" },
    });
    
    if (earliest && latest && earliest.id !== latest.id) {
      const growth = latest.totalViews - earliest.totalViews;
      if (growth > 0) {
        totalMonthlyViews += growth;
        channelsWithData++;
      }
    }
  }

  return NextResponse.json({ 
    totalViews: totalMonthlyViews, 
    success: channelsWithData, 
    total: channels.length,
    failed: 0,
  });
}
