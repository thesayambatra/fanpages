"use client";
import { useState } from "react";

type Tab = "overview" | "jee" | "neet" | "upsc" | "k12";

const JEE_PAGES = [
  { name: "DhairyaVerse", url: "https://www.youtube.com/@DhairyaVerse-e9f" },
  { name: "IIT Supremacy", url: "https://www.youtube.com/@IITSupremacy" },
  { name: "Queen of Math", url: "https://www.youtube.com/@queenofmath" },
  { name: "IIT Hustlers", url: "https://www.youtube.com/@IITHustlers-n4o" },
  { name: "IITB Motivation", url: "https://www.youtube.com/@IITBMotivation-t7l" },
  { name: "IIT Mains", url: "https://www.youtube.com/@IITmains21" },
  { name: "Unacademy Legends", url: "https://www.youtube.com/@UnacademyLegends" },
  { name: "Jee Success 300", url: "https://www.youtube.com/@Jeesuccess300" },
  { name: "Arvind Kalia Bhai", url: "https://www.youtube.com/channel/UCkNe4CgfGRKSbwRz7myb0bw" },
  { name: "IIT Dreamers Army", url: "https://www.youtube.com/channel/UCMXSYDdEzVNROSwidqHvpUQ" },
  { name: "Future IITians Club", url: "https://www.youtube.com/@FutureIITiansClub21/shorts" },
  { name: "Mission IIT", url: "https://www.youtube.com/@MissionIIT-i7e/shorts" },
  { name: "IIT Rankers", url: "https://www.youtube.com/channel/UCbCP5dDKdqd2E3vH2tHmnMQ" },
  { name: "JEE Warriors", url: "https://www.youtube.com/channel/UCo78kPjnwB0_6Vda_lEHxZw" },
  { name: "IIT Dream Chasers", url: "https://www.youtube.com/channel/UCCv1QJowNAE93vkrgMbv2Uw" },
  { name: "IITian Path", url: "https://youtube.com/@iitianpath-h8o4f" },
  { name: "JEE Ignite", url: "https://youtube.com/@jeeignite-e8u" },
  { name: "Dhairya Mam Fanpage", url: "https://www.youtube.com/@DhairyaMamFanpage" },
  { name: "DHAIRYA GOALS💛", url: "https://youtube.com/@dhairya_goals" },
  { name: "DHARIYA Mam", url: "https://www.youtube.com/@DhairyaMam" },
  { name: "Lecture Feels", url: "https://youtube.com/@lecturefeels" },
  { name: "MISSION IIT", url: "https://www.youtube.com/@TheMission_IIT" },
  { name: "Aim IIT", url: "https://youtube.com/@aim_iit0" },
  { name: "Jee Zone", url: "https://www.youtube.com/@jeezoneyt" },
  { name: "JEE Revolution", url: "https://youtube.com/@jeerevolution-09" },
  { name: "Jee Hustle", url: "https://youtube.com/@jeehustle-l1b" },
];

export function KTContent() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <>
      <div className="page-header">
        <h2>📚 Knowledge Transfer Document</h2>
      </div>

      {/* Category Nav */}
      <div className="card" style={{ padding: "0.75rem 1rem", marginBottom: "1.5rem" }}>
        <div className="flex gap-2 flex-wrap">
          {([
            { id: "overview", label: "📋 Overview", color: "var(--red)" },
            { id: "jee", label: "⚗️ JEE", color: "#ff2d55" },
            { id: "neet", label: "🧬 NEET", color: "#00c7be" },
            { id: "upsc", label: "🏛️ UPSC", color: "#5856d6" },
            { id: "k12", label: "📚 K12", color: "#ff9500" },
          ] as { id: Tab; label: string; color: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id
                  ? "text-white shadow-lg"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
              style={tab === t.id ? { background: t.color, boxShadow: `0 4px 15px ${t.color}40` } : { background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)" }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {tab === "overview" && <OverviewTab />}
      {tab === "jee" && <JEETab />}
      {tab === "neet" && <NEETTab />}
      {tab === "upsc" && <UPSCTab />}
      {tab === "k12" && <K12Tab />}
    </>
  );
}

function OverviewTab() {
  return (
    <>
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
          <div className="stat-card"><div className="stat-icon">📱</div><div className="text-sm font-semibold mb-1">Create YouTube Shorts</div><div className="text-xs text-[var(--muted)]">Clip viral moments from educators&apos; lectures</div></div>
          <div className="stat-card"><div className="stat-icon">📈</div><div className="text-sm font-semibold mb-1">Grow Fan Pages</div><div className="text-xs text-[var(--muted)]">Track analytics, optimize content, grow subscribers</div></div>
          <div className="stat-card"><div className="stat-icon">📊</div><div className="text-sm font-semibold mb-1">Track Performance</div><div className="text-xs text-[var(--muted)]">Monitor views, engagement, report progress</div></div>
          <div className="stat-card"><div className="stat-icon">🎬</div><div className="text-sm font-semibold mb-1">Content Strategy</div><div className="text-xs text-[var(--muted)]">Plan, schedule, publish across categories</div></div>
        </div>
      </div>

      {/* Team Structure */}
      <div className="card">
        <div className="card-header"><h3>👥 Team Structure</h3></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Role</th><th>Name</th><th>Responsibility</th></tr></thead>
            <tbody>
              <tr><td><span className="badge manager">Manager</span></td><td className="font-semibold">Basudha Parija</td><td className="text-[var(--muted)]">Overall team management, reviews, approvals</td></tr>
              <tr><td><span className="badge employee">Employee</span></td><td className="font-semibold">Sayam Batra</td><td className="text-[var(--muted)]">POC for JEE & K12</td></tr>
              <tr><td><span className="badge employee">Employee</span></td><td className="font-semibold">Adishreya Lal</td><td className="text-[var(--muted)]">POC for NEET & K12</td></tr>
              <tr><td><span className="badge employee">Employee</span></td><td className="font-semibold">Sudhanshu Sharma</td><td className="text-[var(--muted)]">POC for UPSC</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Category POCs */}
      <div className="card">
        <div className="card-header"><h3>🏷️ Category POC</h3></div>
        <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          <div className="stat-card" style={{ borderColor: "rgba(255,45,85,0.2)" }}><div className="stat-icon">⚗️</div><div className="font-bold mb-1">JEE</div><div className="text-xs text-[var(--muted)]">POC: Sayam Batra</div></div>
          <div className="stat-card" style={{ borderColor: "rgba(0,199,190,0.2)" }}><div className="stat-icon">🧬</div><div className="font-bold mb-1">NEET</div><div className="text-xs text-[var(--muted)]">POC: Adishreya Lal</div></div>
          <div className="stat-card" style={{ borderColor: "rgba(88,86,214,0.2)" }}><div className="stat-icon">🏛️</div><div className="font-bold mb-1">UPSC</div><div className="text-xs text-[var(--muted)]">POC: Sudhanshu Sharma</div></div>
          <div className="stat-card" style={{ borderColor: "rgba(255,149,0,0.2)" }}><div className="stat-icon">📚</div><div className="font-bold mb-1">K12</div><div className="text-xs text-[var(--muted)]">POC: Sayam & Adishreya</div></div>
        </div>
      </div>

      {/* How It Works */}
      <div className="card">
        <div className="card-header"><h3>📋 How It Works</h3></div>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}><span className="text-lg">1️⃣</span><div><div className="font-semibold text-sm">Add Channels</div><div className="text-xs text-[var(--muted)]">Add YouTube fan page channels with correct category</div></div></div>
          <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}><span className="text-lg">2️⃣</span><div><div className="font-semibold text-sm">Track & Refresh</div><div className="text-xs text-[var(--muted)]">Regularly refresh to capture growth data</div></div></div>
          <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}><span className="text-lg">3️⃣</span><div><div className="font-semibold text-sm">Post Content</div><div className="text-xs text-[var(--muted)]">Create and post Shorts daily</div></div></div>
          <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}><span className="text-lg">4️⃣</span><div><div className="font-semibold text-sm">Report to POC</div><div className="text-xs text-[var(--muted)]">Share weekly progress with category POC</div></div></div>
        </div>
      </div>
    </>
  );
}

function JEETab() {
  return (
    <>
      <div className="card" style={{ borderColor: "rgba(255,45,85,0.15)" }}>
        <div className="flex items-center gap-3 mb-4"><span className="text-3xl">⚗️</span><div><h3 className="text-lg font-bold">JEE Category</h3><p className="text-xs text-[var(--muted)]">POC: Sayam Batra</p></div></div>
      </div>

      {/* Educators */}
      <div className="card">
        <div className="card-header"><h3>👨‍🏫 JEE Educators</h3></div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          <div className="lb-row"><div className="avatar" style={{ background: "#ff2d55" }}>P</div><div className="lb-info"><div className="lb-name">Prashant Jain</div><div className="lb-meta">AIR 42 · IIT Bombay</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#5856d6" }}>D</div><div className="lb-info"><div className="lb-name">Dhairya Sandhayana</div><div className="lb-meta">AIR 29 · Queen of Maths</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#ff9500" }}>A</div><div className="lb-info"><div className="lb-name">Arvind Kalia Sir</div><div className="lb-meta">JEE Educator</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#34c759" }}>K</div><div className="lb-info"><div className="lb-name">Kashif Alam Sir</div><div className="lb-meta">JEE Educator</div></div></div>
        </div>
      </div>

      {/* Fan Pages */}
      <div className="card">
        <div className="card-header"><h3>📺 JEE Fan Pages ({JEE_PAGES.length} Channels)</h3></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>#</th><th>Channel Name</th><th>Link</th></tr></thead>
            <tbody>
              {JEE_PAGES.map((ch, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td className="font-medium">{ch.name}</td>
                  <td><a href={ch.url} target="_blank" className="hover:text-[var(--red)] text-xs">{ch.url.replace("https://www.youtube.com/", "").replace("https://youtube.com/", "")}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function NEETTab() {
  return (
    <>
      <div className="card" style={{ borderColor: "rgba(0,199,190,0.15)" }}>
        <div className="flex items-center gap-3 mb-4"><span className="text-3xl">🧬</span><div><h3 className="text-lg font-bold">NEET Category</h3><p className="text-xs text-[var(--muted)]">POC: Adishreya Lal</p></div></div>
      </div>

      {/* Team Legends */}
      <div className="card">
        <div className="card-header"><h3>🏆 Team Legends</h3></div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          <div className="lb-row"><div className="avatar" style={{ background: "#ff2d55" }}>S</div><div className="lb-info"><div className="lb-name">Seep Pahuja</div><div className="lb-meta">Team Legends</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#5856d6" }}>A</div><div className="lb-info"><div className="lb-name">Akansha Mam</div><div className="lb-meta">Team Legends</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#ff9500" }}>P</div><div className="lb-info"><div className="lb-name">Pranav Pundrik</div><div className="lb-meta">Team Legends</div></div></div>
        </div>
      </div>

      {/* Team GNT */}
      <div className="card">
        <div className="card-header"><h3>🌟 Team GNT</h3></div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          <div className="lb-row"><div className="avatar" style={{ background: "#34c759" }}>G</div><div className="lb-info"><div className="lb-name">Garima Goel</div><div className="lb-meta">Team GNT</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#00c7be" }}>T</div><div className="lb-info"><div className="lb-name">Tamanna</div><div className="lb-meta">Team GNT</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#007aff" }}>N</div><div className="lb-info"><div className="lb-name">Nitesh</div><div className="lb-meta">Team GNT</div></div></div>
        </div>
      </div>

      {/* Team Warriors */}
      <div className="card">
        <div className="card-header"><h3>⚔️ Team Warriors</h3></div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          <div className="lb-row"><div className="avatar" style={{ background: "#ff2d55" }}>A</div><div className="lb-info"><div className="lb-name">Acid Sir</div><div className="lb-meta">Team Warriors</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#5856d6" }}>R</div><div className="lb-info"><div className="lb-name">Ramesh Sharda Sir</div><div className="lb-meta">Team Warriors</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#ff9500" }}>A</div><div className="lb-info"><div className="lb-name">AKM Sir</div><div className="lb-meta">Team Warriors</div></div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>📺 NEET Fan Pages</h3></div>
        <p className="text-sm text-[var(--muted)]">Fan pages for NEET educators coming soon. Contact Adishreya for details.</p>
      </div>
    </>
  );
}

function UPSCTab() {
  return (
    <>
      <div className="card" style={{ borderColor: "rgba(88,86,214,0.15)" }}>
        <div className="flex items-center gap-3 mb-4"><span className="text-3xl">🏛️</span><div><h3 className="text-lg font-bold">UPSC Category</h3><p className="text-xs text-[var(--muted)]">POC: Sudhanshu Sharma</p></div></div>
      </div>

      {/* Hindi Panel */}
      <div className="card">
        <div className="card-header"><h3>🇮🇳 Hindi Panel Educators</h3></div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          <div className="lb-row"><div className="avatar" style={{ background: "#5856d6" }}>S</div><div className="lb-info"><div className="lb-name">Sudarshan Gurjar</div><div className="lb-meta">UPSC Hindi</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#ff2d55" }}>M</div><div className="lb-info"><div className="lb-name">Mrunal Patel</div><div className="lb-meta">UPSC Hindi</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#ff9500" }}>M</div><div className="lb-info"><div className="lb-name">Madhukar Kotawe</div><div className="lb-meta">UPSC Hindi</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#34c759" }}>S</div><div className="lb-info"><div className="lb-name">Siddharth Arora</div><div className="lb-meta">UPSC Hindi</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#00c7be" }}>P</div><div className="lb-info"><div className="lb-name">Prateek</div><div className="lb-meta">UPSC Hindi</div></div></div>
        </div>
      </div>

      {/* English Panel */}
      <div className="card">
        <div className="card-header"><h3>🌍 English Panel Educators</h3></div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          <div className="lb-row"><div className="avatar" style={{ background: "#007aff" }}>S</div><div className="lb-info"><div className="lb-name">Sarmad Sir</div><div className="lb-meta">UPSC English</div></div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>📺 UPSC Fan Pages</h3></div>
        <p className="text-sm text-[var(--muted)]">Fan pages for UPSC educators coming soon. Contact Sudhanshu for details.</p>
      </div>
    </>
  );
}

function K12Tab() {
  return (
    <>
      <div className="card" style={{ borderColor: "rgba(255,149,0,0.15)" }}>
        <div className="flex items-center gap-3 mb-4"><span className="text-3xl">📚</span><div><h3 className="text-lg font-bold">K12 Category</h3><p className="text-xs text-[var(--muted)]">POC: Sayam Batra & Adishreya Lal</p></div></div>
      </div>

      <div className="card">
        <div className="card-header"><h3>ℹ️ About K12</h3></div>
        <p className="text-sm text-[var(--muted)]">K12 covers content for students from Class 1 to Class 12 (non-competitive exam content). This is jointly managed by Sayam and Adishreya.</p>
      </div>

      <div className="card">
        <div className="card-header"><h3>📺 K12 Fan Pages</h3></div>
        <p className="text-sm text-[var(--muted)]">Fan pages for K12 category coming soon. Contact Sayam or Adishreya for details.</p>
      </div>
    </>
  );
}
