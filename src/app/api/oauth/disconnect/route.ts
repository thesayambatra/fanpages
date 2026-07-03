import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { channelId } = await req.json();
  await prisma.oAuthToken.deleteMany({ where: { channelId: Number(channelId) } });
  return NextResponse.json({ ok: true });
}
