import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { latestSnapshot } from "@/lib/db-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const channels = await prisma.channel.findMany({ include: { user: true } });
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthName = monthStart.toLocaleString("default", { month: "long", year: "numeric" });

  // Group by category
  const categories = ["JEE", "NEET", "UPSC", "K12"];
  const grouped: Record<string, any[]> = {};
  for (const cat of categories) grouped[cat] = [];
  grouped["Other"] = [];

  for (const ch of channels) {
    const snap = await latestSnapshot(ch.id);
    if (!snap) continue;

    // Monthly views from snapshots
    const earliest = await prisma.snapshot.findFirst({
      where: { channelId: ch.id, fetchedAt: { gte: monthStart } },
      orderBy: { fetchedAt: "asc" },
    });
    const monthlyViews = earliest && snap.id !== earliest.id
      ? Math.max(0, snap.totalViews - earliest.totalViews)
      : 0;

    // Top video from stored data
    let topVideoViews = 0;
    let topVideoLink = "";
    try {
      const videos = JSON.parse(snap.topVideos || "[]");
      if (videos.length > 0) {
        const sorted = videos.sort((a: any, b: any) => (b.views || 0) - (a.views || 0));
        topVideoViews = sorted[0].views || 0;
        topVideoLink = sorted[0].url || "";
      }
    } catch {}

    const row = {
      channelName: ch.channelName || ch.channelId,
      channelLink: ch.channelUrl?.startsWith("http") ? ch.channelUrl : `https://www.youtube.com/channel/${ch.channelUrl || ch.channelId}`,
      totalViews: snap.totalViews,
      monthlyViews,
      subscribers: snap.subscribers,
      videoCount: snap.videoCount,
      topVideoViews,
      topVideoLink,
      managedBy: ch.user?.fullName || "",
      category: ch.category || "Other",
    };

    if (grouped[ch.category]) {
      grouped[ch.category].push(row);
    } else {
      grouped["Other"].push(row);
    }
  }

  // Build CSV
  let csv = "";
  
  for (const cat of [...categories, "Other"]) {
    const rows = grouped[cat];
    if (rows.length === 0) continue;

    // Category header
    csv += `\n${cat}\n`;
    csv += `${monthName} Report\n`;
    csv += `Channel Name,Channel Link,Total Views (YTD),Views This Month,Subscribers,Videos,Most Viewed Video Views,Most Viewed Video Link,Managed By\n`;

    // Sort by total views desc
    rows.sort((a, b) => b.totalViews - a.totalViews);

    for (const row of rows) {
      csv += `"${row.channelName}","${row.channelLink}",${row.totalViews},${row.monthlyViews},${row.subscribers},${row.videoCount},${row.topVideoViews},"${row.topVideoLink}","${row.managedBy}"\n`;
    }

    // Category totals
    const totalViews = rows.reduce((s, r) => s + r.totalViews, 0);
    const totalMonthly = rows.reduce((s, r) => s + r.monthlyViews, 0);
    const totalSubs = rows.reduce((s, r) => s + r.subscribers, 0);
    csv += `"TOTAL (${cat})",,${totalViews},${totalMonthly},${totalSubs},,,\n`;
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="fanpages_report_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
