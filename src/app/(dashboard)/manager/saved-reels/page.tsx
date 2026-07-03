import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function SavedReels() {
  const session = await requireRole("manager");
  if (!session) redirect("/login");
  const userId = Number((session.user as any).id);

  const reels = await prisma.savedReel.findMany({
    where: { savedById: userId },
    orderBy: { savedAt: "desc" },
  });

  return (
    <>
      <div className="page-header"><h2>Saved Reels</h2></div>
      {reels.length > 0 ? (
        <div className="channel-grid">
          {reels.map(r => (
            <div key={r.id} className="channel-card">
              {r.thumbnail && <img src={r.thumbnail} className="ch-thumb" alt="" />}
              <div className="ch-info">
                <a href={r.url} target="_blank" className="ch-name">{r.title}</a>
                <div className="text-xs text-[var(--muted)] mt-1">{r.channelName}</div>
                <div className="ch-stats">
                  <span>👁 {r.views.toLocaleString()}</span>
                  <span>👍 {r.likes.toLocaleString()}</span>
                  <span>💬 {r.comments.toLocaleString()}</span>
                </div>
                {r.reviewerNote && <p className="text-xs mt-2 text-[var(--muted)]">📝 {r.reviewerNote}</p>}
                {r.tag && <span className="tag mt-2">{r.tag}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-10 text-[var(--muted)]">No saved reels yet.</div>
      )}
    </>
  );
}
