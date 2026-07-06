import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET - list saved reels for current user
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const reels = await prisma.savedReel.findMany({
    where: { savedById: Number(user.id) },
    orderBy: { savedAt: "desc" },
  });
  return NextResponse.json(reels);
}

// POST - save a video
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const { videoId, title, channelName, thumbnail, url, views, likes, comments, published, tag, note } = await req.json();
  if (!videoId) return NextResponse.json({ error: "videoId required" }, { status: 400 });

  // Check if already saved
  const existing = await prisma.savedReel.findFirst({
    where: { savedById: Number(user.id), videoId },
  });
  if (existing) return NextResponse.json({ status: "already_saved" });

  await prisma.savedReel.create({
    data: {
      savedById: Number(user.id),
      videoId,
      title: title || "",
      channelName: channelName || "",
      thumbnail: thumbnail || "",
      url: url || "",
      views: views || 0,
      likes: likes || 0,
      comments: comments || 0,
      published: published || "",
      tag: tag || "",
      reviewerNote: note || "",
    },
  });
  return NextResponse.json({ status: "saved" });
}
