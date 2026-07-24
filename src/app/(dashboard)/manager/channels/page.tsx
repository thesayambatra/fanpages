import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { enrichChannel } from "@/lib/db-helpers";
import { PerformanceBadges } from "@/components/PerformanceBadges";
import { AddChannelForm } from "@/components/AddChannelForm";
import { ChannelActions } from "@/components/ChannelActions";
import { BulkAddChannels } from "@/components/BulkAddChannels";
import { StudioConnect } from "@/components/StudioConnect";

function getHealthIndicator(views: number) {
  if (views > 100000) return { emoji: "🟢", label: "Active" };
  if (views >= 10000) return { emoji: "🟡", label: "Growing" };
  return { emoji: "🔴", label: "Needs Attention" };
}

export default async function ManagerChannels({ searchParams }: { searchParams: { [key: string]: string } }) {
  const session = await requireRole("manager");
  if (!session) redirect("/login");

  const employeeId = searchParams.employee_id || "all";
  const category = searchParams.category || "all";
  const dateFrom = searchParams.from || "";
  const dateTo = searchParams.to || "";
  const sortBy = searchParams.sort || "views";
  const search = searchParams.search || "";
  const minSubs = searchParams.min_subs || "";
  const studioFilter = searchParams.studio || "all";

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
  // Date range filter using addedAt directly in Prisma where clause
  if (dateFrom || dateTo) {
    whereFilter.addedAt = {};
    if (dateFrom) {
      whereFilter.addedAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      whereFilter.addedAt.lte = new Date(dateTo + "T23:59:59");
    }
  }

  const channels = await prisma.channel.findMany({
    where: whereFilter,
    include: { user: true, oauthToken: true },
  });

  const enriched = (await Promise.all(channels.map(enrichChannel))).filter(Boolean) as any[];

  // Add oauthToken info
  const channelTokenMap: Record<number, boolean> = {};
  for (const ch of channels) {
    channelTokenMap[ch.id] = !!(ch as any).oauthToken;
  }

  // Search filter
  let filtered = enriched;
  if (search) {
    filtered = filtered.filter(c => c.channelName?.toLowerCase().includes(search.toLowerCase()));
  }

  // Min subscribers filter
  if (minSubs) {
    filtered = filtered.filter(c => c.subscribers >= Number(minSubs));
  }

  // Studio connected filter
  if (studioFilter === "connected") {
    filtered = filtered.filter(c => channelTokenMap[c.id]);
  } else if (studioFilter === "not_connected") {
    filtered = filtered.filter(c => !channelTokenMap[c.id]);
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy) {
      case "subscribers": return b.subscribers - a.subscribers;
      case "name": return (a.channelName || "").localeCompare(b.channelName || "");
      case "videos": return b.videoCount - a.videoCount;
      case "newest": return new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime();
      default: return b.totalViews - a.totalViews;
    }
  });

  const employees = await prisma.user.findMany({ where: { role: "employee" } });
  const categories = ["JEE", "K12", "UPSC", "NEET"];

  // Quick date helpers
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().slice(0, 10);
  const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().slice(0, 10);

  // Summary stats
  const totalViews = filtered.reduce((sum, c) => sum + c.totalViews, 0);
  const totalSubscribers = filtered.reduce((sum, c) => sum + c.subscribers, 0);
  const totalVideos = filtered.reduce((sum, c) => sum + c.videoCount, 0);
  const avgViewsPerChannel = filtered.length > 0 ? Math.round(totalViews / filtered.length) : 0;

  // Calculate views growth this month (compare latest snapshot vs earliest snapshot this month)
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let viewsThisMonth = 0;
  for (const ch of channels) {
    const earliestThisMonth = await prisma.snapshot.findFirst({
      where: { channelId: ch.id, fetchedAt: { gte: monthStart } },
      orderBy: { fetchedAt: "asc" },
    });
    const latest = await prisma.snapshot.findFirst({
      where: { channelId: ch.id },
      orderBy: { fetchedAt: "desc" },
    });
    if (earliestThisMonth && latest && latest.id !== earliestThisMonth.id) {
      viewsThisMonth += (latest.totalViews - earliestThisMonth.totalViews);
    }
  }

  // Build export URL with current filters
  const exportParams = new URLSearchParams();
  if (employeeId !== "all") exportParams.set("employee_id", employeeId);
  if (category !== "all") exportParams.set("category", category);
  if (dateFrom) exportParams.set("from", dateFrom);
  if (dateTo) exportParams.set("to", dateTo);
  if (sortBy) exportParams.set("sort", sortBy);
  if (search) exportParams.set("search", search);
  if (minSubs) exportParams.set("min_subs", minSubs);
  const exportUrl = `/api/export${exportParams.toString() ? "?" + exportParams.toString() : ""}`;

  return (
    <>
      <div className="page-header">
        <h2>All Channels ({filtered.length})</h2>
      </div>

      <AddChannelForm />
      <BulkAddChannels />

      {/* Summary Stats Section */}
      <div className="stat-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="stat-card">
          <div className="text-xs text-[var(--muted)]">Total Views</div>
          <div className="text-2xl font-bold" style={{ color: "var(--red)" }}>{totalViews.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-[var(--muted)]">Views This Month</div>
          <div className="text-2xl font-bold" style={{ color: "#4caf50" }}>{viewsThisMonth > 0 ? "+" : ""}{viewsThisMonth.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-[var(--muted)]">Total Subscribers</div>
          <div className="text-2xl font-bold">{totalSubscribers.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-[var(--muted)]">Avg Views / Channel</div>
          <div className="text-2xl font-bold">{avgViewsPerChannel.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-[var(--muted)]">Total Videos</div>
          <div className="text-2xl font-bold">{totalVideos.toLocaleString()}</div>
        </div>
      </div>

      <div className="card filter-bar">
        <form className="filter-form" method="GET">
          <input type="text" name="search" defaultValue={search} placeholder="🔍 Search channel..." className="form-input" />
          <select name="employee_id" defaultValue={employeeId} className="form-input">
            <option value="all">All Employees</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
          </select>
          <select name="category" defaultValue={category} className="form-input">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select name="sort" defaultValue={sortBy} className="form-input">
            <option value="views">Sort: Views ↓</option>
            <option value="subscribers">Sort: Subscribers ↓</option>
            <option value="videos">Sort: Videos ↓</option>
            <option value="name">Sort: Name A-Z</option>
            <option value="newest">Sort: Newest</option>
          </select>
          <input type="number" name="min_subs" defaultValue={minSubs} placeholder="Min Subs" className="form-input" style={{ width: "100px" }} />
          <select name="studio" defaultValue={studioFilter} className="form-input">
            <option value="all">All Channels</option>
            <option value="connected">Studio Connected ✅</option>
            <option value="not_connected">Not Connected ❌</option>
          </select>
          <span className="text-xs text-[var(--muted)] font-semibold">From</span>
          <input type="date" name="from" defaultValue={dateFrom} className="form-input" />
          <span className="text-xs text-[var(--muted)] font-semibold">To</span>
          <input type="date" name="to" defaultValue={dateTo} className="form-input" />
          <button type="submit" className="btn-primary btn-sm">Filter</button>
          <a href="/manager/channels" className="btn-outline btn-sm">Reset</a>
        </form>
        <div className="flex gap-2 mt-2">
          <a href={`?from=${thisMonth}&to=${today}&employee_id=${employeeId}&category=${category}&sort=${sortBy}`} className="btn-outline btn-sm">This Month</a>
          <a href={`?from=${lastMonth}&to=${lastMonthEnd}&employee_id=${employeeId}&category=${category}&sort=${sortBy}`} className="btn-outline btn-sm">Last Month</a>
          <a href={`?employee_id=${employeeId}&category=${category}&sort=${sortBy}`} className="btn-outline btn-sm">All Time</a>
          <a href={exportUrl} className="btn-primary btn-sm" target="_blank">📥 Export Filtered</a>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>Channel</th><th>Health</th><th>Category</th><th>Subscribers</th>
                <th>Views</th><th>Videos</th><th>Views/Video</th><th>Managed By</th><th>Studio</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ch, i) => {
                const health = getHealthIndicator(ch.totalViews);
                const viewsPerVideo = ch.videoCount > 0 ? Math.round(ch.totalViews / ch.videoCount) : 0;
                return (
                  <tr key={ch.id}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="ch-cell">
                        {ch.thumbnail && <img src={ch.thumbnail} className="mini-thumb" alt="" />}
                        <a href={ch.url} target="_blank" className="hover:text-red-500">{ch.channelName}</a>
                        <PerformanceBadges subscribers={ch.subscribers} engagementRate={ch.engagementRate} />
                      </div>
                    </td>
                    <td>
                      <span title={health.label}>{health.emoji} {health.label}</span>
                    </td>
                    <td>{ch.category ? <span className="tag">{ch.category}</span> : "—"}</td>
                    <td>{ch.subscribers.toLocaleString()}</td>
                    <td className="font-bold text-lg" style={{ color: "var(--red)" }}>{ch.totalViews.toLocaleString()}</td>
                    <td>{ch.videoCount}</td>
                    <td className="text-sm">{viewsPerVideo.toLocaleString()}</td>
                    <td className="text-xs">{ch.addedBy}</td>
                    <td><StudioConnect channelDbId={ch.id} hasToken={channelTokenMap[ch.id] || false} /></td>
                    <td><ChannelActions channelId={ch.id} category={ch.category} /></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: "bold", borderTop: "2px solid var(--border)" }}>
                <td colSpan={4}>Totals ({filtered.length} channels)</td>
                <td>{totalSubscribers.toLocaleString()}</td>
                <td style={{ color: "var(--red)" }}>{totalViews.toLocaleString()}</td>
                <td>{totalVideos.toLocaleString()}</td>
                <td colSpan={4}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}
