import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { latestSnapshot } from "@/lib/db-helpers";

export default async function ManagerTopVideos() {
  const session = await requireRole("manager");
  if (!session) redirect("/login");

  const channels = await prisma.channel.findMany({ include: { user: true } });
  const allVideos: any[] = [];

  for (const ch of channels) {
    const snap = await latestSnapshot(ch.id);
    if (snap) {
      try {
        const videos = JSON.parse(snap.topVideos || "[]");
        for (const v of videos) {
          allVideos.push({ ...v, channelName: ch.channelName, addedBy: ch.user?.fullName });
        }
      } catch {}
    }
  }
  allVideos.sort((a, b) => (b.views || 0) - (a.views || 0));

  return (
    <>
      <div className="page-header"><h2>Top Videos</h2></div>
      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Video</th><th>Channel</th><th>Views</th><th>Likes</th><th>Comments</th><th>Published</th><th>Added By</th></tr>
            </thead>
            <tbody>
              {allVideos.slice(0, 100).map((v, i) => (
                <tr key={v.videoId + i}>
                  <td>{i + 1}</td>
                  <td>
                    <a href={v.url} target="_blank" className="hover:text-red-500 text-sm max-w-[200px] truncate block">
                      {v.title || v.videoId}
                    </a>
                  </td>
                  <td>{v.channelName}</td>
                  <td>{(v.views || 0).toLocaleString()}</td>
                  <td>{(v.likes || 0).toLocaleString()}</td>
                  <td>{(v.comments || 0).toLocaleString()}</td>
                  <td className="text-xs text-[var(--muted)]">{v.published}</td>
                  <td>{v.addedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
