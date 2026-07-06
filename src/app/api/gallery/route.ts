import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET /api/gallery — list all images
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const images = await prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: { select: { fullName: true, avatarColor: true } } },
  });
  return NextResponse.json(images);
}

// POST /api/gallery — add image (base64 data URL)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const { imageUrl, caption } = await req.json();
  if (!imageUrl) return NextResponse.json({ error: "Image required" }, { status: 400 });

  const image = await prisma.galleryImage.create({
    data: {
      uploadedById: Number(user.id),
      imageUrl,
      caption: caption || "",
    },
  });
  return NextResponse.json({ ok: true, id: image.id });
}
