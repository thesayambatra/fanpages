import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ChannelStats } from "@/components/ChannelStats";

export default async function StatsPage({ searchParams }: { searchParams: { channelId?: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const channelDbId = Number(searchParams.channelId);
  if (!channelDbId) redirect("/employee");

  const ch = await prisma.channel.findUnique({ where: { id: channelDbId } });
  if (!ch) redirect("/employee");

  return (
    <>
      <div className="page-header">
        <div>
          <h2>📊 Channel Stats (No OAuth needed)</h2>
          <p className="text-xs text-[var(--muted)] mt-1">{ch.channelName} — Real-time data via YouTube Data API</p>
        </div>
        <a href="javascript:history.back()" className="btn-outline">← Back</a>
      </div>
      <ChannelStats channelDbId={channelDbId} channelName={ch.channelName} />
    </>
  );
}
