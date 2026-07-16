import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { fetchStudioAnalytics } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const { searchParams } = new URL(req.url);
  const channelDbId = Number(searchParams.get("channelId"));
  const startDate   = searchParams.get("from") || new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10);
  const endDate     = searchParams.get("to")   || new Date().toISOString().slice(0, 10);

  const ch = await prisma.channel.findUnique({ where: { id: channelDbId } });
  if (!ch) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Allow: any employee, manager, or cbo can access any channel's studio
  const allowedRoles = ["manager", "employee", "cbo"];
  if (!allowedRoles.includes(user.role)) {
    // Interns can only see their own
    if (ch.userId !== Number(user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const token = await prisma.oAuthToken.findUnique({ where: { channelId: channelDbId } });
  if (!token) return NextResponse.json({ error: "No OAuth token" }, { status: 404 });

  const data = await fetchStudioAnalytics(token.tokenJson, ch.channelId, startDate, endDate);
  if (data.error) {
    return NextResponse.json({ error: data.error }, { status: 400 });
  }
  return NextResponse.json(data);
}
