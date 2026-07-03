import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { StudioDashboard } from "@/components/StudioDashboard";

export default async function StudioPage({ searchParams }: { searchParams: { channelId?: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const channelDbId = Number(searchParams.channelId);
  if (!channelDbId) redirect("/");

  const ch = await prisma.channel.findUnique({ where: { id: channelDbId }, include: { oauthToken: true } });
  if (!ch) redirect("/");

  // Access check: owner, their manager-employee, or manager
  const user = session.user as any;
  const userId = Number(user.id);
  const isOwner = ch.userId === userId;
  const isManager = user.role === "manager";
  let isEmployeeOfOwner = false;
  if (user.role === "employee") {
    const owner = await prisma.user.findUnique({ where: { id: ch.userId } });
    isEmployeeOfOwner = owner?.createdById === userId;
  }
  if (!isOwner && !isManager && !isEmployeeOfOwner) redirect("/");

  if (!ch.oauthToken) {
    return (
      <div className="page-wrap">
        <div className="card text-center py-10">
          <h2 className="text-xl font-bold mb-2">No Google Account Connected</h2>
          <p className="text-[var(--muted)] mb-4">Connect the channel owner&apos;s Google account to see Studio analytics.</p>
          <a href={`/api/oauth?channelId=${channelDbId}`} className="btn-primary">🔗 Connect Google Account</a>
        </div>
      </div>
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
