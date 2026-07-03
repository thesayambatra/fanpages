import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { latestSnapshot } from "@/lib/db-helpers";
import { ManagerInternActions } from "@/components/ManagerInternActions";
import { ManagerChannelActions } from "@/components/ManagerChannelActions";

export default async function TeamHierarchy() {
  const session = await requireRole("manager");
  if (!session) redirect("/login");

  const manager = await prisma.user.findFirst({ where: { role: "manager" } });
  const employees = await prisma.user.findMany({ where: { role: "employee" } });

  const tree: any[] = [];
  for (const emp of employees) {
    const interns = await prisma.user.findMany({ where: { createdById: emp.id } });
    const internData: any[] = [];
    for (const intern of interns) {
      const channels = await prisma.channel.findMany({ where: { userId: intern.id } });
      const channelData: any[] = [];
      let subs = 0;
      for (const ch of channels) {
        const snap = await latestSnapshot(ch.id);
        if (snap) subs += snap.subscribers;
        channelData.push({
          id: ch.id, channelName: ch.channelName || ch.channelId,
          channelUrl: ch.channelUrl, category: ch.category,
          subscribers: snap?.subscribers || 0,
        });
      }
      internData.push({
        id: intern.id, fullName: intern.fullName, username: intern.username,
        avatarColor: intern.avatarColor, channelCount: channels.length,
        subscribers: subs, channels: channelData,
      });
    }
    const empChannels = await prisma.channel.findMany({ where: { userId: emp.id } });
    const empChannelData: any[] = [];
    let empSubs = 0;
    for (const ch of empChannels) {
      const snap = await latestSnapshot(ch.id);
      if (snap) empSubs += snap.subscribers;
      empChannelData.push({
        id: ch.id, channelName: ch.channelName || ch.channelId,
        channelUrl: ch.channelUrl, category: ch.category,
        subscribers: snap?.subscribers || 0,
      });
    }
    tree.push({
      id: emp.id, fullName: emp.fullName, username: emp.username,
      avatarColor: emp.avatarColor, channelCount: empChannels.length,
      subscribers: empSubs, channels: empChannelData, interns: internData,
    });
  }

  return (
    <>
      <div className="page-header"><h2>Team Hierarchy</h2></div>

      {/* Manager card */}
      <div className="flex flex-col items-center mb-8">
        <div className="org-node manager-node">
          <div className="avatar" style={{ background: manager?.avatarColor || "#ff0000", width: 48, height: 48, fontSize: 18 }}>
            {manager?.fullName?.[0]}
          </div>
          <div className="org-info">
            <div className="org-name text-lg">{manager?.fullName}</div>
            <div className="org-role">Manager — Full Access</div>
          </div>
        </div>
        <div className="org-line-down" />
      </div>

      {/* Employees */}
      <div className="grid gap-6">
        {tree.map((emp) => (
          <div key={emp.id} className="card">
            {/* Employee header */}
            <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="avatar" style={{ background: emp.avatarColor, width: 40, height: 40, fontSize: 14 }}>
                {emp.fullName[0]}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{emp.fullName}</div>
                <div className="text-xs text-[var(--muted)]">@{emp.username} · Employee · {emp.channelCount} channels · {emp.interns.length} interns</div>
              </div>
              <span className="badge employee">employee</span>
            </div>

            {/* Employee's own channels */}
            {emp.channels.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-2">
                  {emp.fullName}&apos;s Channels
                </h4>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr><th>Channel</th><th>Category</th><th>Subscribers</th><th>Actions</th></tr></thead>
                    <tbody>
                      {emp.channels.map((ch: any) => (
                        <tr key={ch.id}>
                          <td><a href={ch.channelUrl} target="_blank" className="hover:text-red-500">{ch.channelName}</a></td>
                          <td>{ch.category ? <span className="tag">{ch.category}</span> : "—"}</td>
                          <td>{ch.subscribers.toLocaleString()}</td>
                          <td><ManagerChannelActions channelId={ch.id} name={ch.channelName} category={ch.category} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Interns under this employee */}
            {emp.interns.length > 0 ? (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-2">
                  Interns under {emp.fullName}
                </h4>
                {emp.interns.map((intern: any) => (
                  <div key={intern.id} className="ml-4 mb-4 p-3 rounded-lg" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="avatar" style={{ background: intern.avatarColor, width: 28, height: 28, fontSize: 11 }}>
                        {intern.fullName[0]}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-sm">{intern.fullName}</span>
                        <span className="text-xs text-[var(--muted)] ml-2">@{intern.username}</span>
                      </div>
                      <span className="text-xs text-[var(--muted)]">{intern.channelCount} ch · {intern.subscribers.toLocaleString()} subs</span>
                      <ManagerInternActions internId={intern.id} name={intern.fullName} />
                    </div>

                    {/* Intern's channels */}
                    {intern.channels.length > 0 && (
                      <div className="ml-8">
                        <table className="data-table text-xs">
                          <thead><tr><th>Channel</th><th>Category</th><th>Subs</th><th></th></tr></thead>
                          <tbody>
                            {intern.channels.map((ch: any) => (
                              <tr key={ch.id}>
                                <td><a href={ch.channelUrl} target="_blank" className="hover:text-red-500">{ch.channelName}</a></td>
                                <td>{ch.category || "—"}</td>
                                <td>{ch.subscribers.toLocaleString()}</td>
                                <td><ManagerChannelActions channelId={ch.id} name={ch.channelName} category={ch.category} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)] italic">No interns under {emp.fullName}</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
