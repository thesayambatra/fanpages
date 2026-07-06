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
  const month = searchParams.month || "all";

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

  let enriched = (await Promise.all(channels.map(enrichChannel))).filter(Boolean) as any[];

  // Filter by category
  if (category !== "all") {
    enriched = enriched.filter(c => c.category === category);
  }

  // Filter by month (added date)
  if (month !== "all") {
    enriched = enriched.filter(c => {
      const date = new Date(c.fetchedAt);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return monthStr === month;
    });
  }

  enriched.sort((a, b) => b.totalViews - a.totalViews);

  const employees = await prisma.user.findMany({ where: { role: "employee" } });
  const categories = ["JEE", "K12", "UPSC", "NEET"];

  // Get unique months from data
  const allChannels = await prisma.channel.findMany();
  const months = [...new Set(allChannels.map(c => {
    const d = c.addedAt;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }))].sort().reverse();

  return (
    <>
      <div className="page-header">
        <h2>All Channels ({enriched.length})</h2>
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
          <select name="month" defaultValue={month} className="form-input">
            <option value="all">All Months</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
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
                <th>Views</th><th>Videos</th><th>Managed By</th><th>Added</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((ch, i) => (
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
                  <td className="font-bold text-lg" style={{ color: "var(--red)" }}>{ch.totalViews.toLocaleString()}</td>
                  <td>{ch.videoCount}</td>
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
