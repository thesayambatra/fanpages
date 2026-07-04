import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { enrichChannel } from "@/lib/db-helpers";
import { CompareView } from "@/components/CompareView";

export default async function ComparePage() {
  const session = await requireRole("manager");
  if (!session) redirect("/login");

  const allChannels = await prisma.channel.findMany({ include: { user: true } });
  const enriched = (await Promise.all(allChannels.map(enrichChannel))).filter(Boolean) as any[];

  // Get top videos for each channel
  for (const ch of enriched) {
    const snap = await prisma.snapshot.findFirst({
      where: { channelId: ch.id },
      orderBy: { fetchedAt: "desc" },
    });
    if (snap) {
      try {
        ch.topVideos = JSON.parse(snap.topVideos || "[]");
      } catch {
        ch.topVideos = [];
      }
    } else {
      ch.topVideos = [];
    }
  }

  return (
    <>
      <div className="page-header">
        <h2>Channel Comparison</h2>
      </div>
      <CompareView channels={enriched} />
    </>
  );
}
