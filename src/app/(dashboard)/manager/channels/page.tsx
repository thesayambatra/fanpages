import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { enrichChannel } from "@/lib/db-helpers";
import { PerformanceBadges } from "@/components/PerformanceBadges";
import { AddChannelForm } from "@/components/AddChannelForm";
import { ChannelActions } from "@/components/ChannelActions";
import { BulkAddChannels } from "@/components/BulkAddChannels";
import { StudioConnect } from "@/components/StudioConnect";

export default async function ManagerChannels({ searchParams }: { searchParams: { [key: string]: string } }) {
  const session = await requireRole("manager");
  if (!session) redirect("/login");

  const employeeId = searchParams.employee_id || "all";
  const category = searchParams.category || "all";
  const dateFrom = searchParams.from || "";
  const dateTo = searchParams.to || "";

  // Build query filter
  const whereFilter: any = {};
  if (employeeId !== "all") {
    const emp = await prisma.user.findUnique({ where: { id: Number(employeeId) } });
    if (emp) {
      const internIds = (await prisma.user.findMany({ where: { createdById: emp.id } })).map(i => i.id);
      whereFilter.userId = { in: [emp.id, ...internIds] };
    }
  }
  if (category !== "all") {
    whereFilter.category = category;
  }
  if (dateFrom) {
    whereFilter.addedAt = { ...whereFilter.addedAt, gte: new Date(dateFrom) };
  }
  if (dateTo) {
    whereFilter.addedAt = { ...whereFilter.addedAt, lte: new Date(dateTo + "T23:59:59") };
  }

  const channels = await prisma.channel.findMany({
    where: whereFilter,
    include: { user: true, oauthToken: true },
  });

  const enriched = (await Promise.all(channels.map(enrichChannel))).filter(Boolean) as any[];
  enriched.sort((a, b) => b.totalViews - a.totalViews);

  // Add oauthToken info
  const channelTokenMap: Record<number, boolean> = {};
  for (const ch of channels) {
    channelTokenMap[ch.id] = !!(ch as any).oauthToken;
  }

  const employees = await prisma.user.findMany({ where: { role: "employee" } });
  const categories = ["JEE", "K12", "UPSC", "NEET"];

  // Quick date helpers
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().slice(0, 10);
  const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().slice(0, 10);

  return (
    <>
      <div className="page-header">
        <h2>All Channels ({enriched.length})</h2>
      </div>

      <AddChannelForm />
      <BulkAddChannels />

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
          <span className="text-xs text-[var(--muted)] font-semibold">From</span>
          <input type="date" name="from" defaultValue={dateFrom} className="form-input" />
          <span className="text-xs text-[var(--muted)] font-semibold">To</span>
          <input type="date" name="to" defaultValue={dateTo} className="form-input" />
          <button type="submit" className="btn-primary btn-sm">Filter</button>
        </form>
        <div className="flex gap-2 mt-2">
          <a href={`?from=${thisMonth}&to=${today}&employee_id=${employeeId}&category=${category}`} className="btn-outline btn-sm">This Month</a>
          <a href={`?from=${lastMonth}&to=${lastMonthEnd}&employee_id=${employeeId}&category=${category}`} className="btn-outline btn-sm">Last Month</a>
          <a href={`?employee_id=${employeeId}&category=${category}`} className="btn-outline btn-sm">All Time</a>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>Channel</th><th>Category</th><th>Subscribers</th>
                <th>Views</th><th>Videos</th><th>Managed By</th><th>Studio</th><th>Actions</th>
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
                  <td className="text-xs">{ch.addedBy}</td>
                  <td><StudioConnect channelDbId={ch.id} hasToken={channelTokenMap[ch.id] || false} /></td>
                  <td><ChannelActions channelId={ch.id} category={ch.category} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
