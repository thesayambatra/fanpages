import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function KTPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <>
      <div className="page-header">
        <h2>📚 Knowledge Transfer Document</h2>
      </div>

      {/* Welcome */}
      <div className="card" style={{ borderColor: "rgba(255,45,85,0.2)" }}>
        <div className="text-center py-4">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-2xl font-black mb-2" style={{ color: "var(--red)" }}>Welcome to Unacademy FanPages Team!</h2>
          <p className="text-[var(--muted)] max-w-lg mx-auto">
            We manage YouTube fan pages for Unacademy educators across JEE, NEET, UPSC & K12 categories.
            Our goal is to grow these channels through engaging Shorts and video content.
          </p>
        </div>
      </div>

      {/* What We Do */}
      <div className="card">
        <div className="card-header"><h3>🎯 What We Do</h3></div>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
          <div className="stat-card">
            <div className="stat-icon">📱</div>
            <div className="text-sm font-semibold mb-1">Create YouTube Shorts</div>
            <div className="text-xs text-[var(--muted)]">Clip viral moments from educators&apos; lectures and create engaging Shorts</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="text-sm font-semibold mb-1">Grow Fan Pages</div>
            <div className="text-xs text-[var(--muted)]">Track analytics, optimize content, and grow subscriber base</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="text-sm font-semibold mb-1">Track Performance</div>
            <div className="text-xs text-[var(--muted)]">Monitor views, engagement, and report progress to the team</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎬</div>
            <div className="text-sm font-semibold mb-1">Content Strategy</div>
            <div className="text-xs text-[var(--muted)]">Plan, schedule, and publish content across all categories</div>
          </div>
        </div>
      </div>

      {/* Team Structure */}
      <div className="card">
        <div className="card-header"><h3>👥 Team Structure</h3></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Role</th><th>Name</th><th>Responsibility</th></tr></thead>
            <tbody>
              <tr>
                <td><span className="badge manager">Manager</span></td>
                <td className="font-semibold">Basudha Parija</td>
                <td className="text-[var(--muted)]">Overall team management, reviews, approvals</td>
              </tr>
              <tr>
                <td><span className="badge employee">Employee</span></td>
                <td className="font-semibold">Sayam Batra</td>
                <td className="text-[var(--muted)]">POC for JEE & K12 categories</td>
              </tr>
              <tr>
                <td><span className="badge employee">Employee</span></td>
                <td className="font-semibold">Adishreya Lal</td>
                <td className="text-[var(--muted)]">POC for NEET & K12 categories</td>
              </tr>
              <tr>
                <td><span className="badge employee">Employee</span></td>
                <td className="font-semibold">Sudhanshu Sharma</td>
                <td className="text-[var(--muted)]">POC for UPSC category</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Category POCs */}
      <div className="card">
        <div className="card-header"><h3>🏷️ Category POC (Point of Contact)</h3></div>
        <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          <div className="stat-card" style={{ borderColor: "rgba(255,45,85,0.2)" }}>
            <div className="stat-icon">⚗️</div>
            <div className="font-bold mb-1">JEE</div>
            <div className="text-xs text-[var(--muted)]">POC: Sayam Batra</div>
          </div>
          <div className="stat-card" style={{ borderColor: "rgba(0,199,190,0.2)" }}>
            <div className="stat-icon">🧬</div>
            <div className="font-bold mb-1">NEET</div>
            <div className="text-xs text-[var(--muted)]">POC: Adishreya Lal</div>
          </div>
          <div className="stat-card" style={{ borderColor: "rgba(88,86,214,0.2)" }}>
            <div className="stat-icon">🏛️</div>
            <div className="font-bold mb-1">UPSC</div>
            <div className="text-xs text-[var(--muted)]">POC: Sudhanshu Sharma</div>
          </div>
          <div className="stat-card" style={{ borderColor: "rgba(255,149,0,0.2)" }}>
            <div className="stat-icon">📚</div>
            <div className="font-bold mb-1">K12</div>
            <div className="text-xs text-[var(--muted)]">POC: Sayam & Adishreya</div>
          </div>
        </div>
      </div>

      {/* JEE Educators */}
      <div className="card">
        <div className="card-header"><h3>⚗️ JEE Educators</h3></div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          <div className="lb-row">
            <div className="avatar" style={{ background: "#ff2d55" }}>P</div>
            <div className="lb-info">
              <div className="lb-name">Prashant Jain</div>
              <div className="lb-meta">AIR 42 · IIT Bombay</div>
            </div>
          </div>
          <div className="lb-row">
            <div className="avatar" style={{ background: "#5856d6" }}>D</div>
            <div className="lb-info">
              <div className="lb-name">Dhairya Sandhayana</div>
              <div className="lb-meta">AIR 29 · Queen of Maths</div>
            </div>
          </div>
          <div className="lb-row">
            <div className="avatar" style={{ background: "#ff9500" }}>A</div>
            <div className="lb-info">
              <div className="lb-name">Arvind Kalia Sir</div>
              <div className="lb-meta">JEE Educator</div>
            </div>
          </div>
          <div className="lb-row">
            <div className="avatar" style={{ background: "#34c759" }}>K</div>
            <div className="lb-info">
              <div className="lb-name">Kashif Alam Sir</div>
              <div className="lb-meta">JEE Educator</div>
            </div>
          </div>
        </div>
      </div>

      {/* UPSC Educators */}
      <div className="card">
        <div className="card-header"><h3>🏛️ UPSC Educators</h3></div>
        <p className="text-xs text-[var(--muted)] mb-3">Hindi Panel</p>
        <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          <div className="lb-row">
            <div className="avatar" style={{ background: "#5856d6" }}>S</div>
            <div className="lb-info"><div className="lb-name">Sudarshan Gurjar</div><div className="lb-meta">UPSC Hindi Panel</div></div>
          </div>
          <div className="lb-row">
            <div className="avatar" style={{ background: "#ff2d55" }}>M</div>
            <div className="lb-info"><div className="lb-name">Mrunal Patel</div><div className="lb-meta">UPSC Hindi Panel</div></div>
          </div>
          <div className="lb-row">
            <div className="avatar" style={{ background: "#ff9500" }}>M</div>
            <div className="lb-info"><div className="lb-name">Madhukar Kotawe</div><div className="lb-meta">UPSC Hindi Panel</div></div>
          </div>
          <div className="lb-row">
            <div className="avatar" style={{ background: "#34c759" }}>S</div>
            <div className="lb-info"><div className="lb-name">Siddharth Arora</div><div className="lb-meta">UPSC Hindi Panel</div></div>
          </div>
          <div className="lb-row">
            <div className="avatar" style={{ background: "#00c7be" }}>P</div>
            <div className="lb-info"><div className="lb-name">Prateek</div><div className="lb-meta">UPSC Hindi Panel</div></div>
          </div>
        </div>
        <p className="text-xs text-[var(--muted)] mb-3">English Panel</p>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          <div className="lb-row">
            <div className="avatar" style={{ background: "#007aff" }}>S</div>
            <div className="lb-info"><div className="lb-name">Sarmad Sir</div><div className="lb-meta">UPSC English Panel</div></div>
          </div>
        </div>
      </div>

      {/* NEET Educators */}
      <div className="card">
        <div className="card-header"><h3>🧬 NEET Educators</h3></div>
        <p className="text-xs text-[var(--muted)] mb-3">Team Legends</p>
        <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          <div className="lb-row">
            <div className="avatar" style={{ background: "#ff2d55" }}>S</div>
            <div className="lb-info"><div className="lb-name">Seep Pahuja</div><div className="lb-meta">Team Legends</div></div>
          </div>
          <div className="lb-row">
            <div className="avatar" style={{ background: "#5856d6" }}>A</div>
            <div className="lb-info"><div className="lb-name">Akansha Mam</div><div className="lb-meta">Team Legends</div></div>
          </div>
          <div className="lb-row">
            <div className="avatar" style={{ background: "#ff9500" }}>P</div>
            <div className="lb-info"><div className="lb-name">Pranav Pundrik</div><div className="lb-meta">Team Legends</div></div>
          </div>
        </div>
        <p className="text-xs text-[var(--muted)] mb-3">Team GNT</p>
        <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          <div className="lb-row">
            <div className="avatar" style={{ background: "#34c759" }}>G</div>
            <div className="lb-info"><div className="lb-name">Garima Goel</div><div className="lb-meta">Team GNT</div></div>
          </div>
          <div className="lb-row">
            <div className="avatar" style={{ background: "#00c7be" }}>T</div>
            <div className="lb-info"><div className="lb-name">Tamanna</div><div className="lb-meta">Team GNT</div></div>
          </div>
          <div className="lb-row">
            <div className="avatar" style={{ background: "#007aff" }}>N</div>
            <div className="lb-info"><div className="lb-name">Nitesh</div><div className="lb-meta">Team GNT</div></div>
          </div>
        </div>
        <p className="text-xs text-[var(--muted)] mb-3">Team Warriors</p>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          <div className="lb-row">
            <div className="avatar" style={{ background: "#ff2d55" }}>A</div>
            <div className="lb-info"><div className="lb-name">Acid Sir</div><div className="lb-meta">Team Warriors</div></div>
          </div>
          <div className="lb-row">
            <div className="avatar" style={{ background: "#5856d6" }}>R</div>
            <div className="lb-info"><div className="lb-name">Ramesh Sharda Sir</div><div className="lb-meta">Team Warriors</div></div>
          </div>
          <div className="lb-row">
            <div className="avatar" style={{ background: "#ff9500" }}>A</div>
            <div className="lb-info"><div className="lb-name">AKM Sir</div><div className="lb-meta">Team Warriors</div></div>
          </div>
        </div>
      </div>

      {/* How To Guide */}
      <div className="card">
        <div className="card-header"><h3>📋 How It Works</h3></div>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
            <span className="text-lg">1️⃣</span>
            <div><div className="font-semibold text-sm">Add Channels</div><div className="text-xs text-[var(--muted)]">Add YouTube fan page channels with the correct category (JEE/NEET/UPSC/K12)</div></div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
            <span className="text-lg">2️⃣</span>
            <div><div className="font-semibold text-sm">Track & Refresh</div><div className="text-xs text-[var(--muted)]">Regularly refresh channels to capture growth data (subscribers, views, engagement)</div></div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
            <span className="text-lg">3️⃣</span>
            <div><div className="font-semibold text-sm">Post Content</div><div className="text-xs text-[var(--muted)]">Create and post Shorts daily. Check &quot;Recent Posts&quot; to see what&apos;s been uploaded</div></div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
            <span className="text-lg">4️⃣</span>
            <div><div className="font-semibold text-sm">Report to POC</div><div className="text-xs text-[var(--muted)]">Share weekly progress with your category POC. Use Growth tab for date-range comparisons</div></div>
          </div>
        </div>
      </div>
    </>
  );
}
