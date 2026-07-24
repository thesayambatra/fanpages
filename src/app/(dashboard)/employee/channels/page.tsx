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
  const userName = (session.user as any).name;

  // Get own channels
  const myChannels = await prisma.channel.findMany({
    where: { userId },
    include: { user: true, oauthToken: true },
  });

  // Get intern channels
  const myInterns = await prisma.user.findMany({ where: { createdById: userId } });
  const internIds = myInterns.map(i => i.id);
  const internChannels = await prisma.channel.findMany({
    where: { userId: { in: internIds } },
    include: { user: true, oauthToken: true },
  });

  // Enrich all
  const enrichMyChannels: any[] = [];
  for (const ch of myChannels) {
    const snap = await latestSnapshot(ch.id);
    enrichMyChannels.push({ ...ch, snap, hasToken: !!ch.oauthToken, managedBy: userName });
  }

  const enrichInternChannels: any[] = [];
  for (const ch of internChannels) {
    const snap = await latestSnapshot(ch.id);
    enrichInternChannels.push({ ...ch, snap, hasToken: !!ch.oauthToken, managedBy: ch.user?.fullName || "" });
  }

  const allChannels = [...enrichMyChannels, ...enrichInternChannels];

  return (
    <>
      <div className="page-header">
        <h2>My Channels</h2>
      </div>

      <AddChannelForm />
      <BulkAddChannels />

      {/* My own channels */}
      <div className="card">
        <div className="card-header">
          <h3>📺 My Channels ({enrichMyChannels.length})</h3>
        </div>
        {enrichMyChannels.length > 0 ? (
          <ChannelTable channels={enrichMyChannels} />
        ) : (
          <div className="text-center py-6 text-[var(--muted)]">No channels yet. Add one above!</div>
        )}
      </div>

      {/* Intern channels - grouped per intern */}
      {myInterns.length > 0 && myInterns.map((intern) => {
        const internChs = enrichInternChannels.filter(ch => ch.userId === intern.id);
        if (internChs.length === 0) return null;
        return (
          <div key={intern.id} className="card">
            <div className="card-header">
              <h3 className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold" style={{ background: intern.avatarColor }}>
                  {intern.fullName[0]}
                </div>
                🎓 {intern.fullName}&apos;s Channels ({internChs.length})
              </h3>
            </div>
            <ChannelTable channels={internChs} />
          </div>
        );
      })}
    </>
  );
}

function ChannelTable({ channels, showManager }: { channels: any[]; showManager?: boolean }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th><th>Channel</th><th>Category</th><th>Subscribers</th>
            <th>Views</th><th>Videos</th>
            {showManager && <th>Managed By</th>}
            <th>Studio</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {channels.map((ch, i) => (
            <tr key={ch.id}>
              <td>{i + 1}</td>
              <td>
                <div className="ch-cell">
                  {ch.snap?.thumbnail && <img src={ch.snap.thumbnail} className="mini-thumb" alt="" />}
                  <a href={ch.channelUrl?.startsWith("http") ? ch.channelUrl : `https://www.youtube.com/channel/${ch.channelUrl || ch.channelId}`} target="_blank" className="hover:text-red-500">
                    {ch.channelName || ch.channelId}
                  </a>
                </div>
              </td>
              <td>{ch.category ? <span className="tag">{ch.category}</span> : "—"}</td>
              {ch.snap ? (
                <>
                  <td>{ch.snap.subscribers.toLocaleString()}</td>
                  <td className="font-bold" style={{ color: "var(--red)" }}>{ch.snap.totalViews.toLocaleString()}</td>
                  <td>{ch.snap.videoCount}</td>
                </>
              ) : (
                <td colSpan={3} className="text-[var(--muted)]">No data</td>
              )}
              {showManager && <td className="text-xs">{ch.managedBy}</td>}
              <td><StudioConnect channelDbId={ch.id} hasToken={ch.hasToken} /></td>
              <td><ChannelActions channelId={ch.id} category={ch.category} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
