import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { latestSnapshot } from "@/lib/db-helpers";
import { AddInternForm } from "@/components/AddInternForm";
import { InternActions } from "@/components/InternActions";

export default async function EmployeeInterns() {
  const session = await requireRole("employee");
  if (!session) redirect("/login");
  const userId = Number((session.user as any).id);

  const interns = await prisma.user.findMany({ where: { createdById: userId } });

  const internData: any[] = [];
  for (const intern of interns) {
    const channels = await prisma.channel.findMany({ where: { userId: intern.id } });
    let subs = 0, views = 0, eng = 0, count = 0;
    for (const ch of channels) {
      const snap = await latestSnapshot(ch.id);
      if (snap) { subs += snap.subscribers; views += snap.totalViews; eng += snap.engagementRate; count++; }
    }
    internData.push({
      ...intern, channelCount: channels.length,
      subscribers: subs, views, avgEng: count ? +(eng / count).toFixed(2) : 0,
    });
  }

  return (
    <>
      <div className="page-header">
        <h2>Manage Interns</h2>
      </div>

      <AddInternForm />

      <div className="card">
        <div className="card-header"><h3>My Interns ({interns.length})</h3></div>
        {internData.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Name</th><th>Username</th><th>Channels</th><th>Subscribers</th><th>Views</th><th>Engagement</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {internData.map((intern, i) => (
                  <tr key={intern.id}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar" style={{ background: intern.avatarColor, width: 28, height: 28, fontSize: 11 }}>{intern.fullName[0]}</div>
                        <span className="font-medium">{intern.fullName}</span>
                      </div>
                    </td>
                    <td className="text-[var(--muted)]">@{intern.username}</td>
                    <td>{intern.channelCount}</td>
                    <td>{intern.subscribers.toLocaleString()}</td>
                    <td>{intern.views.toLocaleString()}</td>
                    <td>
                      <span className={`eng-badge ${intern.avgEng >= 10 ? "green" : intern.avgEng >= 3 ? "orange" : "red"}`}>
                        {intern.avgEng}%
                      </span>
                    </td>
                    <td><InternActions internId={intern.id} name={intern.fullName} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--muted)]">No interns yet. Add one above!</div>
        )}
      </div>
    </>
  );
}
