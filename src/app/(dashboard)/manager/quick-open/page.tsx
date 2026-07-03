import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { latestSnapshot } from "@/lib/db-helpers";

export default async function QuickOpen() {
  const session = await requireRole("manager");
  if (!session) redirect("/login");

  const channels = await prisma.channel.findMany({ include: { user: true } });
  const enriched: any[] = [];
  for (const ch of channels) {
    const snap = await latestSnapshot(ch.id);
    enriched.push({
      id: ch.id, name: ch.channelName || ch.channelId, url: ch.channelUrl,
      category: ch.category, thumbnail: snap?.thumbnail || "",
      subscribers: snap?.subscribers || 0, addedBy: ch.user?.fullName || "",
    });
  }
  enriched.sort((a, b) => b.subscribers - a.subscribers);

  return (
    <>
      <div className="page-header"><h2>Quick Open</h2></div>
      <div className="channel-grid">
        {enriched.map(ch => (
          <a key={ch.id} href={ch.url} target="_blank" className="channel-card hover:border-red-500/40 transition-colors">
            {ch.thumbnail ? (
              <img src={ch.thumbnail} className="ch-thumb" alt="" />
            ) : (
              <div className="ch-thumb-placeholder">▶</div>
            )}
            <div className="ch-info">
              <div className="ch-name">{ch.name}</div>
              <div className="ch-meta">
                {ch.category && <span className="tag">{ch.category}</span>}
              </div>
              <div className="ch-stats">
                <span>👥 {ch.subscribers.toLocaleString()}</span>
                <span className="text-[var(--muted)]">by {ch.addedBy}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
