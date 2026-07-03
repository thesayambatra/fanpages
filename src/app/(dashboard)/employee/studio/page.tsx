import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { StudioDashboard } from "@/components/StudioDashboard";

export default async function EmployeeStudioPage({ searchParams }: { searchParams: { channelId?: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = session.user as any;
  if (user.role !== "employee") redirect("/");

  const channelDbId = Number(searchParams.channelId);
  if (!channelDbId) redirect("/employee");

  const ch = await prisma.channel.findUnique({ where: { id: channelDbId }, include: { oauthToken: true } });
  if (!ch) redirect("/employee");

  // Check access: own channel or intern's channel
  const userId = Number(user.id);
  if (ch.userId !== userId) {
    const owner = await prisma.user.findUnique({ where: { id: ch.userId } });
    if (!owner || owner.createdById !== userId) redirect("/employee");
  }

  if (!ch.oauthToken) {
    return (
      <>
        <div className="page-header"><h2>Studio Analytics</h2></div>
        <div className="card text-center py-10">
          <p className="text-[var(--muted)]">No Google account connected for <strong>{ch.channelName}</strong>. The channel owner needs to connect first.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2>📊 Studio Analytics</h2>
          <p className="text-xs text-[var(--muted)] mt-1">{ch.channelName}</p>
        </div>
        <a href="javascript:history.back()" className="btn-outline">← Back</a>
      </div>
      <StudioDashboard channelDbId={channelDbId} channelName={ch.channelName} />
    </>
  );
}
