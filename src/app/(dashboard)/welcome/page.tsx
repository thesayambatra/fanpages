import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function WelcomePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = session.user as any;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card text-center" style={{ borderColor: "rgba(255,45,85,0.2)", padding: "3rem 2rem" }}>
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-black mb-2">Welcome, {user.name}!</h1>
        <p className="text-lg text-[var(--muted)] mb-6">
          Welcome to the <span style={{ color: "var(--red)" }}>Unacademy FanPages</span> team!
        </p>
        <div className="text-left max-w-md mx-auto space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📺</span>
            <div>
              <div className="font-semibold text-sm">Track YouTube Channels</div>
              <div className="text-xs text-[var(--muted)]">Add and monitor fan pages for Unacademy educators</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🩳</span>
            <div>
              <div className="font-semibold text-sm">Create Engaging Shorts</div>
              <div className="text-xs text-[var(--muted)]">Clip viral moments and grow subscriber base</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📈</span>
            <div>
              <div className="font-semibold text-sm">Track Your Growth</div>
              <div className="text-xs text-[var(--muted)]">Monitor views, engagement, and compete on the leaderboard</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <div className="font-semibold text-sm">Read the KT Doc</div>
              <div className="text-xs text-[var(--muted)]">Learn about team structure, educators, and workflow</div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <Link href="/kt" className="btn-primary">📚 Read KT Doc</Link>
          <Link href="/" className="btn-outline">Go to Dashboard →</Link>
        </div>
      </div>
    </div>
  );
}
