import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  const intern = await prisma.user.findUnique({ where: { id: Number(params.id) } });
  if (!intern || intern.role !== "intern") return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (intern.createdById !== Number(user.id) && user.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.channel.deleteMany({ where: { userId: intern.id } });
  await prisma.user.delete({ where: { id: intern.id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  const intern = await prisma.user.findUnique({ where: { id: Number(params.id) } });
  if (!intern || intern.role !== "intern") return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (intern.createdById !== Number(user.id) && user.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { newPassword } = await req.json();
  if (!newPassword) return NextResponse.json({ error: "Password required" }, { status: 400 });
  await prisma.user.update({ where: { id: intern.id }, data: { password: await bcrypt.hash(newPassword, 10) } });
  return NextResponse.json({ ok: true });
}
