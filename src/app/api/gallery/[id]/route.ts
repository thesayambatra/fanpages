import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const image = await prisma.galleryImage.findUnique({ where: { id: Number(params.id) } });
  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only uploader or manager can delete
  if (image.uploadedById !== Number(user.id) && user.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.galleryImage.delete({ where: { id: image.id } });
  return NextResponse.json({ ok: true });
}
