import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Returns monthly views per category for the last 6 months
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const channels = await prisma.channel.findMany({ include: { user: true } });
  const categories = ["JEE", "NEET", "UPSC", "K12"];
  const now = new Date();

  // Get monthly data for last 6 months
  const months: { label: string; start: Date; end: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const label = start.toLocaleString("default", { month: "short", year: "numeric" });
    months.push({ label, start, end });
  }

  // For each category, calculate monthly views
  const categoryData: Record<string, { totalPosts: number; viewsThisMonth: number; viewsLastMonth: number; monthlyViews: number[] }> = {};

  for (const cat of categories) {
    const catChannels = channels.filter(c => c.category === cat);
    const monthlyViews: number[] = [];

    for (const month of months) {
      let monthViews = 0;
      for (const ch of catChannels) {
        const earliest = await prisma.snapshot.findFirst({
          where: { channelId: ch.id, fetchedAt: { gte: month.start, lte: month.end } },
          orderBy: { fetchedAt: "asc" },
        });
        const latest = await prisma.snapshot.findFirst({
          where: { channelId: ch.id, fetchedAt: { gte: month.start, lte: month.end } },
          orderBy: { fetchedAt: "desc" },
        });
        if (earliest && latest && earliest.id !== latest.id) {
          monthViews += Math.max(0, latest.totalViews - earliest.totalViews);
        }
      }
      monthlyViews.push(monthViews);
    }

    // This month stats
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    let viewsThisMonth = 0;
    let viewsLastMonth = 0;
    let totalPosts = 0;

    for (const ch of catChannels) {
      // This month views
      const eThis = await prisma.snapshot.findFirst({ where: { channelId: ch.id, fetchedAt: { gte: thisMonthStart } }, orderBy: { fetchedAt: "asc" } });
      const lThis = await prisma.snapshot.findFirst({ where: { channelId: ch.id }, orderBy: { fetchedAt: "desc" } });
      if (eThis && lThis && eThis.id !== lThis.id) viewsThisMonth += Math.max(0, lThis.totalViews - eThis.totalViews);

      // Last month views
      const eLast = await prisma.snapshot.findFirst({ where: { channelId: ch.id, fetchedAt: { gte: lastMonthStart, lte: lastMonthEnd } }, orderBy: { fetchedAt: "asc" } });
      const lLast = await prisma.snapshot.findFirst({ where: { channelId: ch.id, fetchedAt: { gte: lastMonthStart, lte: lastMonthEnd } }, orderBy: { fetchedAt: "desc" } });
      if (eLast && lLast && eLast.id !== lLast.id) viewsLastMonth += Math.max(0, lLast.totalViews - eLast.totalViews);

      // Posts this month
      if (eThis && lThis && eThis.id !== lThis.id) totalPosts += Math.max(0, lThis.videoCount - eThis.videoCount);
    }

    categoryData[cat] = { totalPosts, viewsThisMonth, viewsLastMonth, monthlyViews };
  }

  return NextResponse.json({
    categories: categoryData,
    months: months.map(m => m.label),
    totalChannels: channels.length,
  });
}
