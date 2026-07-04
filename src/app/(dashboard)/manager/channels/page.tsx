import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { enrichChannel } from "@/lib/db-helpers";
import { PerformanceBadges } from "@/components/PerformanceBadges";

export default async function ManagerChannels({ searchParams }: { searchParams: { [key: string]: string } }) {
  const session = await requireRole("manager");
  if (!session) redirect("/login");

  const employeeId = searchParams.employee_id || "all";
  const category = searchParams.category || "all";

  let channels;
  if (employeeId !== "all") {
    const emp = await prisma.user.findUnique({ where: { id: Number(employeeId) } });
    if (emp) {
      const internIds = (await prisma.user.findMany({ where: { createdById: emp.id } })).map(i => i.id);
      channels = await prisma.channel.findMany({
        where: { userId: { in: [emp.id, ...internIds] } },
        include: { user: true },
      });
    } else {
      channels = await prisma.channel.findMany({ include: { user: true } });
    }
  } else {
    channels = await prisma.channel.findMany({ include: { user: true } });
  }

  const enriched = (await Promise.all(channels.map(enrichChannel))).filter(Boolean) as any[];
  const filtered = category !== "all" ? enriched.filter(c => c.category === category) : enriched;
  filtered.sort((a, b) => b.subscribers - a.subscribers);

  const employees = await prisma.user.findMany({ where: { role: "employee" } });
  const categories = [...new Set(enriched.map(c => c.category).filter(Boolean))];

  return (
    <>
      <div className="page-header">
        <h2>All Channels ({filtered.length})</h2>
      </div>

      <div className="card filter-bar">
        <form className="filter-form" method="GET">
          <select name="employee_id" defaultValue={employeeId} className="form-input">
            <option value="all">All Employees</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
          </select>
          <select name="category" defaultValue={category} className="form-input">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" className="btn-primary btn-sm">Filter</button>
        </form>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>Channel</th><th>Category</th><th>Subscribers</th>
                <th>Views</th><th>Videos</th><th>Engagement</th><th>Added By</th><th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ch, i) => (
                <tr key={ch.id}>
                  <td>{i + 1}</td>
                  <td>
                    <div className="ch-cell">
                      {ch.thumbnail && <img src={ch.thumbnail} className="mini-thumb" alt="" />}
                      <a href={ch.url} target="_blank" className="hover:text-red-500">{ch.channelName}</a>
                      <PerformanceBadges subscribers={ch.subscribers} engagementRate={ch.engagementRate} />
                    </div>
                  </td>
                  <td>{ch.category ? <span className="tag">{ch.category}</span> : "—"}</td>
                  <td>{ch.subscribers.toLocaleString()}</td>
                  <td>{ch.totalViews.toLocaleString()}</td>
                  <td>{ch.videoCount}</td>
                  <td>
                    <span className={`eng-badge ${ch.engagementRate >= 10 ? "green" : ch.engagementRate >= 3 ? "orange" : "red"}`}>
                      {ch.engagementRate}%
                    </span>
                  </td>
                  <td>{ch.addedBy}</td>
                  <td className="text-xs text-[var(--muted)]">{new Date(ch.fetchedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
