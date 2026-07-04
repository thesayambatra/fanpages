import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { getRecentActivities } from "@/lib/activity";
import { prisma } from "@/lib/prisma";

export default async function ActivityPage() {
  const session = await requireRole("manager");
  if (!session) redirect("/login");

  const activities = await getRecentActivities(100);

  // Get user names for activity entries
  const userIds = [...new Set(activities.map((a) => a.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, fullName: true, avatarColor: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const actionIcons: Record<string, string> = {
    channel_added: "📺",
    channel_refreshed: "🔄",
    intern_created: "🎓",
    channel_deleted: "🗑️",
    report_generated: "📊",
    login: "🔑",
  };

  return (
    <>
      <div className="page-header">
        <h2>Activity Timeline</h2>
      </div>

      <div className="card">
        {activities.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
            No activity recorded yet.
          </div>
        ) : (
          <div style={{ padding: "1rem" }}>
            {activities.map((activity) => {
              const user = userMap[activity.userId];
              const icon = actionIcons[activity.action] || "📝";
              return (
                <div
                  key={activity.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "0.75rem 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div style={{ fontSize: "1.4rem", lineHeight: 1 }}>{icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {user && (
                        <div
                          className="avatar"
                          style={{ background: user.avatarColor, width: 24, height: 24, fontSize: "0.7rem" }}
                        >
                          {user.fullName[0]}
                        </div>
                      )}
                      <span style={{ fontWeight: 500 }}>{user?.fullName || `User #${activity.userId}`}</span>
                      <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {activity.action.replace(/_/g, " ")}
                      </span>
                    </div>
                    {activity.details && (
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                        {activity.details}
                      </div>
                    )}
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                    {new Date(activity.createdAt).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
