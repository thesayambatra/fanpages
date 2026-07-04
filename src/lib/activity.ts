import { prisma } from "@/lib/prisma";

export async function logActivity(userId: number, action: string, details: string = "") {
  return prisma.activityLog.create({
    data: { userId, action, details },
  });
}

export async function getRecentActivities(limit: number = 50) {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
