import { prisma } from "./prisma";
import { fetchChannelStats } from "./youtube";

export async function refreshChannel(channelDbId: number) {
  const ch = await prisma.channel.findUnique({ where: { id: channelDbId } });
  if (!ch) return;
  const stats = await fetchChannelStats(ch.channelId);
  if (!stats || "error" in stats) return;
  await prisma.channel.update({
    where: { id: channelDbId },
    data: { channelName: stats.channelName, country: stats.country },
  });
  await prisma.snapshot.create({
    data: {
      channelId: channelDbId,
      subscribers: stats.subscribers,
      totalViews: stats.totalViews,
      videoCount: stats.videoCount,
      avgViews: stats.avgViews,
      engagementRate: stats.engagementRate,
      description: stats.description,
      thumbnail: stats.thumbnail,
      topVideos: JSON.stringify(stats.topVideos),
    },
  });
}

export async function latestSnapshot(channelDbId: number) {
  return prisma.snapshot.findFirst({
    where: { channelId: channelDbId },
    orderBy: { fetchedAt: "desc" },
  });
}

export async function channelsVisibleTo(userId: number, role: string) {
  if (role === "manager") return prisma.channel.findMany({ include: { user: true } });
  if (role === "employee") {
    const interns = await prisma.user.findMany({ where: { createdById: userId } });
    const internIds = interns.map((i) => i.id);
    return prisma.channel.findMany({
      where: { userId: { in: [userId, ...internIds] } },
      include: { user: true },
    });
  }
  return prisma.channel.findMany({ where: { userId }, include: { user: true } });
}

export async function enrichChannel(ch: any) {
  const snap = await latestSnapshot(ch.id);
  if (!snap) return null;
  return {
    id: ch.id,
    channelId: ch.channelId,
    channelName: ch.channelName,
    url: ch.channelUrl,
    country: ch.country,
    category: ch.category,
    notes: ch.notes,
    thumbnail: snap.thumbnail,
    subscribers: snap.subscribers,
    totalViews: snap.totalViews,
    videoCount: snap.videoCount,
    avgViews: snap.avgViews,
    engagementRate: snap.engagementRate,
    description: snap.description,
    fetchedAt: snap.fetchedAt.toISOString(),
    addedBy: ch.user?.fullName || "",
  };
}
