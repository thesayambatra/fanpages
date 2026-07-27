import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: Number((session.user as any).id) }, select: { id: true, fullName: true, username: true, role: true, avatarColor: true, profileImage: true, bio: true } });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number((session.user as any).id);
  const { profileImage, fullName, bio } = await req.json();
  
  const data: any = {};
  if (profileImage !== undefined) data.profileImage = profileImage;
  if (fullName !== undefined) data.fullName = fullName;
  if (bio !== undefined) data.bio = bio;

  await prisma.user.update({ where: { id: userId }, data });
  return NextResponse.json({ ok: true });
}
