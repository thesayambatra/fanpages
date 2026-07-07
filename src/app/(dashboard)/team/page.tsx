import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { latestSnapshot } from "@/lib/db-helpers";

export default async function TeamPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const currentUser = session.user as any;

  const manager = await prisma.user.findFirst({ where: { role: "manager" } });
  const employees = await prisma.user.findMany({ where: { role: "employee" } });

  const tree: any[] = [];
  for (const emp of employees) {
    const interns = await prisma.user.findMany({ where: { createdById: emp.id } });
    const internData: any[] = [];
    for (const intern of interns) {
      const channels = await prisma.channel.findMany({ where: { userId: intern.id } });
      const channelList: any[] = [];
      let subs = 0;
      for (const ch of channels) {
        const snap = await latestSnapshot(ch.id);
        if (snap) subs += snap.subscribers;
        channelList.push({ id: ch.id, name: ch.channelName || ch.channelId, category: ch.category, url: ch.channelUrl });
      }
      internData.push({
        id: intern.id, fullName: intern.fullName, username: intern.username,
        avatarColor: intern.avatarColor, channelCount: channels.length, subscribers: subs,
        channels: channelList,
      });
    }
    const empChannels = await prisma.channel.findMany({ where: { userId: emp.id } });
    const empChannelList: any[] = [];
    let empSubs = 0;
    for (const ch of empChannels) {
      const snap = await latestSnapshot(ch.id);
      if (snap) empSubs += snap.subscribers;
      empChannelList.push({ id: ch.id, name: ch.channelName || ch.channelId, category: ch.category, url: ch.channelUrl });
    }
    tree.push({
      id: emp.id, fullName: emp.fullName, username: emp.username,
      avatarColor: emp.avatarColor, channelCount: empChannels.length,
      subscribers: empSubs, interns: internData, channels: empChannelList,
    });
  }

  const totalInterns = tree.reduce((sum, emp) => sum + emp.interns.length, 0);
  const totalChannels = tree.reduce((sum, emp) => sum + emp.channelCount + emp.interns.reduce((s: number, i: any) => s + i.channelCount, 0), 0);

  return (
    <>
      <div className="page-header"><h2>👥 Team & Channel Management</h2></div>

      {/* Summary */}
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
        <div className="stat-card"><div className="stat-icon">👑</div><div className="stat-val">1</div><div className="stat-label">Manager</div></div>
        <div className="stat-card"><div className="stat-icon">💼</div><div className="stat-val">{employees.length}</div><div className="stat-label">Employees</div></div>
        <div className="stat-card"><div className="stat-icon">🎓</div><div className="stat-val">{totalInterns}</div><div className="stat-label">Interns</div></div>
        <div className="stat-card"><div className="stat-icon">📺</div><div className="stat-val">{totalChannels}</div><div className="stat-label">Total Channels</div></div>
      </div>

      {/* Manager */}
      <div className="flex flex-col items-center mb-6">
        <div className={`org-node manager-node ${currentUser.id == manager?.id ? "ring-2 ring-[var(--red)]" : ""}`}>
          <div className="avatar" style={{ background: manager?.avatarColor || "#ff0000", width: 48, height: 48, fontSize: 18 }}>
            {manager?.fullName?.[0]}
          </div>
          <div className="org-info">
            <div className="org-name text-lg">{manager?.fullName}</div>
            <div className="org-role">Manager — Can see & manage everything</div>
          </div>
          {currentUser.id == manager?.id && <span className="tag !border-[var(--red)]/30 !text-[var(--red)] ml-2">You</span>}
        </div>
      </div>

      {/* Employees & their teams */}
      <div className="grid gap-5">
        {tree.map((emp) => (
          <div key={emp.id} className="card">
            {/* Employee header */}
            <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: "1px solid var(--glass-border)" }}>
              <div className="avatar" style={{ background: emp.avatarColor, width: 40, height: 40, fontSize: 14 }}>
                {emp.fullName[0]}
              </div>
              <div className="flex-1">
                <div className="font-semibold flex items-center gap-2">
                  {emp.fullName}
                  {currentUser.id == emp.id && <span className="tag !border-[var(--red)]/30 !text-[var(--red)]">You</span>}
                </div>
                <div className="text-xs text-[var(--muted)]">@{emp.username} · {emp.channelCount + emp.interns.reduce((s: number, i: any) => s + i.channelCount, 0)} total channels</div>
              </div>
              <span className="badge employee">Employee</span>
            </div>

            {/* Employee's own channels */}
            {emp.channels.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-2">📺 {emp.fullName}&apos;s Channels ({emp.channels.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {emp.channels.map((ch: any) => (
                    <a key={ch.id} href={ch.url} target="_blank" className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:border-[var(--red)]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)" }}>
                      {ch.name}
                      {ch.category && <span className="tag">{ch.category}</span>}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Interns */}
            {emp.interns.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-3">🎓 Interns ({emp.interns.length})</h4>
                <div className="space-y-3">
                  {emp.interns.map((intern: any) => (
                    <div key={intern.id} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="avatar" style={{ background: intern.avatarColor, width: 28, height: 28, fontSize: 11 }}>
                          {intern.fullName[0]}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-sm">{intern.fullName}</span>
                          <span className="text-xs text-[var(--muted)] ml-2">@{intern.username}</span>
                          {currentUser.id == intern.id && <span className="tag !border-[var(--red)]/30 !text-[var(--red)] ml-2 text-[10px]">You</span>}
                        </div>
                        <span className="text-xs text-[var(--muted)]">{intern.channelCount} channels</span>
                        <span className="badge intern">Intern</span>
                      </div>
                      {/* Intern's channels */}
                      {intern.channels.length > 0 && (
                        <div className="flex flex-wrap gap-2 ml-9">
                          {intern.channels.map((ch: any) => (
                            <a key={ch.id} href={ch.url} target="_blank" className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all hover:border-[var(--red)]" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)" }}>
                              {ch.name}
                              {ch.category && <span className="text-[9px] px-1 rounded" style={{ background: "rgba(255,45,85,0.1)", color: "var(--red)" }}>{ch.category}</span>}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {emp.interns.length === 0 && emp.channels.length === 0 && (
              <p className="text-xs text-[var(--muted)] italic">No channels or interns yet</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
