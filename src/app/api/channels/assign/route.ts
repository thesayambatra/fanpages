import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// POST /api/channels/assign — assign a channel to an intern
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  if (!["manager", "employee", "cbo"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { channelId, internId } = await req.json();
  if (!channelId || !internId) return NextResponse.json({ error: "channelId and internId required" }, { status: 400 });

  const channel = await prisma.channel.findUnique({ where: { id: Number(channelId) } });
  if (!channel) return NextResponse.json({ error: "Channel not found" }, { status: 404 });

  const intern = await prisma.user.findUnique({ where: { id: Number(internId) } });
  if (!intern) return NextResponse.json({ error: "Intern not found" }, { status: 404 });

  // Employee can only assign to their own interns
  if (user.role === "employee" && intern.createdById !== Number(user.id)) {
    return NextResponse.json({ error: "Can only assign to your own interns" }, { status: 403 });
  }

  // Update channel owner
  await prisma.channel.update({
    where: { id: Number(channelId) },
    data: { userId: Number(internId) },
  });

  return NextResponse.json({ ok: true });
}
