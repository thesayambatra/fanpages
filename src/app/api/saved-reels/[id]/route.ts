import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const reel = await prisma.savedReel.findUnique({ where: { id: Number(params.id) } });
  if (!reel) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (reel.savedById !== Number(user.id) && user.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.savedReel.delete({ where: { id: reel.id } });
  return NextResponse.json({ ok: true });
}
