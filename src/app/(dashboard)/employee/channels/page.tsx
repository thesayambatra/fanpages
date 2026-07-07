import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { latestSnapshot } from "@/lib/db-helpers";
import { AddChannelForm } from "@/components/AddChannelForm";
import { ChannelActions } from "@/components/ChannelActions";
import { StudioConnect } from "@/components/StudioConnect";
import { BulkAddChannels } from "@/components/BulkAddChannels";

export default async function EmployeeChannels() {
  const session = await requireRole("employee");
  if (!session) redirect("/login");
  const userId = Number((session.user as any).id);

  const channels = await prisma.channel.findMany({
    where: { userId },
    include: { user: true, oauthToken: true },
  });

  const enriched: any[] = [];
  for (const ch of channels) {
    const snap = await latestSnapshot(ch.id);
    enriched.push({ ...ch, snap, hasToken: !!ch.oauthToken });
  }

  return (
    <>
      <div className="page-header">
        <h2>My Channels</h2>
      </div>

      <AddChannelForm />
      <BulkAddChannels />

      <div className="card">
        <div className="card-header">
          <h3>Tracked Channels ({channels.length})</h3>
        </div>
        {enriched.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Channel</th><th>Category</th><th>Subscribers</th>
                  <th>Views</th><th>Videos</th><th>Engagement</th><th>Updated</th><th>Studio</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enriched.map((ch, i) => (
                  <tr key={ch.id}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="ch-cell">
                        {ch.snap?.thumbnail && <img src={ch.snap.thumbnail} className="mini-thumb" alt="" />}
                        <a href={ch.channelUrl} target="_blank" className="hover:text-red-500">
                          {ch.channelName || ch.channelId}
                        </a>
                      </div>
                    </td>
                    <td>{ch.category ? <span className="tag">{ch.category}</span> : "—"}</td>
                    {ch.snap ? (
                      <>
                        <td>{ch.snap.subscribers.toLocaleString()}</td>
                        <td>{ch.snap.totalViews.toLocaleString()}</td>
                        <td>{ch.snap.videoCount}</td>
                        <td>
                          <span className={`eng-badge ${ch.snap.engagementRate >= 10 ? "green" : ch.snap.engagementRate >= 3 ? "orange" : "red"}`}>
                            {ch.snap.engagementRate}%
                          </span>
                        </td>
                        <td className="text-xs text-[var(--muted)]">{ch.snap.fetchedAt.toLocaleDateString()}</td>
                      </>
                    ) : (
                      <td colSpan={5} className="text-[var(--muted)]">No data yet</td>
                    )}
                    <td><StudioConnect channelDbId={ch.id} hasToken={ch.hasToken} /></td>
                    <td><ChannelActions channelId={ch.id} category={ch.category} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--muted)]">No channels yet. Add one above!</div>
        )}
      </div>
    </>
  );
}
