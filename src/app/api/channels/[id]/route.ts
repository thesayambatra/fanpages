import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { refreshChannel } from "@/lib/db-helpers";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  const ch = await prisma.channel.findUnique({ where: { id: Number(params.id) } });
  if (!ch) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Manager can delete any channel
  if (user.role === "manager") {
    await prisma.channel.delete({ where: { id: ch.id } });
    return NextResponse.json({ ok: true });
  }
  // Owner can delete their own channel
  if (ch.userId === Number(user.id)) {
    await prisma.channel.delete({ where: { id: ch.id } });
    return NextResponse.json({ ok: true });
  }
  // Employee can delete channels of their interns
  if (user.role === "employee") {
    const chOwner = await prisma.user.findUnique({ where: { id: ch.userId } });
    if (chOwner?.createdById === Number(user.id)) {
      await prisma.channel.delete({ where: { id: ch.id } });
      return NextResponse.json({ ok: true });
    }
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  const ch = await prisma.channel.findUnique({ where: { id: Number(params.id) } });
  if (!ch) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ch.userId !== Number(user.id) && !["manager", "employee"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  if (body.refresh) {
    await refreshChannel(ch.id);
    return NextResponse.json({ ok: true });
  }
  await prisma.channel.update({
    where: { id: ch.id },
    data: { category: body.category ?? ch.category, notes: body.notes ?? ch.notes },
  });
  return NextResponse.json({ ok: true });
}
