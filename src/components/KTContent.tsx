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
              <tr><td><span className="badge employee">Employee</span></td><td className="font-semibold">Adhishreya Lal</td><td className="text-[var(--muted)]">POC for NEET & K12</td></tr>
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
          <div className="stat-card" style={{ borderColor: "rgba(0,199,190,0.2)" }}><div className="stat-icon">🧬</div><div className="font-bold mb-1">NEET</div><div className="text-xs text-[var(--muted)]">POC: Adhishreya Lal</div></div>
          <div className="stat-card" style={{ borderColor: "rgba(88,86,214,0.2)" }}><div className="stat-icon">🏛️</div><div className="font-bold mb-1">UPSC</div><div className="text-xs text-[var(--muted)]">POC: Sudhanshu Sharma</div></div>
          <div className="stat-card" style={{ borderColor: "rgba(255,149,0,0.2)" }}><div className="stat-icon">📚</div><div className="font-bold mb-1">K12</div><div className="text-xs text-[var(--muted)]">POC: Sayam & Adhishreya</div></div>
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
        <div className="card-header"><h3>👨‍🏫 JEE Educators — Detailed Profiles</h3></div>
        <div className="space-y-4">

          {/* Prashant Jain */}
          <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="avatar" style={{ background: "#ff2d55", width: 44, height: 44, fontSize: 16 }}>P</div>
              <div>
                <div className="font-bold text-base">Prashant Jain</div>
                <div className="text-xs text-[var(--muted)]">God of Maths · Fastest Solver · God of Manipulations</div>
              </div>
              <span className="tag ml-auto">Mathematics</span>
            </div>
            <ul className="text-xs text-[var(--muted)] space-y-1 ml-14">
              <li>• AIR 42, IIT Bombay</li>
              <li>• Gold Medallist Chemistry Olympiad 2008</li>
              <li>• Known as &quot;God of Maths&quot; & &quot;Fastest Solver&quot;</li>
              <li>• ⭐ Needs Individual Fanpage</li>
            </ul>
          </div>

          {/* Dhairya Sandhyana */}
          <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="avatar" style={{ background: "#5856d6", width: 44, height: 44, fontSize: 16 }}>D</div>
              <div>
                <div className="font-bold text-base">Dhairya Sandhyana</div>
                <div className="text-xs text-[var(--muted)]">Queen of Maths · Girl Topper · Female Mentor</div>
              </div>
              <span className="tag ml-auto">Mathematics</span>
            </div>
            <ul className="text-xs text-[var(--muted)] space-y-1 ml-14">
              <li>• 1 Cr Package · IIT Delhi CSE Graduate</li>
              <li>• AIR 29 in JEE Advanced 2014</li>
              <li>• Passion: Teaching & Mathematics</li>
              <li>• Known as &quot;Queen of Maths&quot;</li>
              <li>• Girl Motivation · Mentorship · Female Mentor</li>
              <li>• ⭐ Needs Individual Fanpage</li>
            </ul>
          </div>

          {/* Arvind Kalia */}
          <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="avatar" style={{ background: "#ff9500", width: 44, height: 44, fontSize: 16 }}>A</div>
              <div>
                <div className="font-bold text-base">Arvind Kalia Sir</div>
                <div className="text-xs text-[var(--muted)]">Masters Bhai · Aapka Bhai · Love You Shera</div>
              </div>
              <span className="tag ml-auto">Mathematics</span>
            </div>
            <ul className="text-xs text-[var(--muted)] space-y-1 ml-14">
              <li>• IIT Delhi Masters</li>
              <li>• Emotional + Motivational · Father Figure</li>
              <li>• Known as &quot;Bhai&quot; among students</li>
              <li>• ⭐ Needs Individual Fanpage</li>
            </ul>
          </div>

          {/* Vishal Sir */}
          <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="avatar" style={{ background: "#34c759", width: 44, height: 44, fontSize: 16 }}>V</div>
              <div>
                <div className="font-bold text-base">Vishal Sir</div>
                <div className="text-xs text-[var(--muted)]">Quick Shortcuts + Motivational Chemistry</div>
              </div>
              <span className="tag ml-auto">Chemistry</span>
            </div>
            <ul className="text-xs text-[var(--muted)] space-y-1 ml-14">
              <li>• Chemistry Faculty</li>
              <li>• Known for quick shortcuts</li>
              <li>• Motivational teaching style</li>
            </ul>
          </div>

          {/* Kashif Alam */}
          <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="avatar" style={{ background: "#007aff", width: 44, height: 44, fontSize: 16 }}>K</div>
              <div>
                <div className="font-bold text-base">Kashif Alam Sir</div>
                <div className="text-xs text-[var(--muted)]">JEE Educator</div>
              </div>
            </div>
          </div>

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
        <div className="flex items-center gap-3 mb-4"><span className="text-3xl">🧬</span><div><h3 className="text-lg font-bold">NEET Category</h3><p className="text-xs text-[var(--muted)]">POC: Adhishreya Lal</p></div></div>
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
        <p className="text-sm text-[var(--muted)]">Fan pages for NEET educators coming soon. Contact Adhishreya for details.</p>
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

      {/* Detailed Educator Profiles */}
      <div className="card">
        <div className="card-header"><h3>👨‍🏫 UPSC Educators — Detailed Profiles</h3></div>
        <div className="space-y-4">

          {/* Mrunal Patel */}
          <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="avatar" style={{ background: "#ff2d55", width: 44, height: 44, fontSize: 16 }}>M</div>
              <div>
                <div className="font-bold text-base">Dr. Mrunal Patel</div>
                <div className="text-xs text-[var(--muted)]">Economics · &quot;God of Economy&quot;</div>
              </div>
              <span className="tag ml-auto">Economics</span>
            </div>
            <ul className="text-xs text-[var(--muted)] space-y-1 ml-14">
              <li>• Alumnus of LMCP, PDEU</li>
              <li>• Over a decade of teaching experience</li>
              <li>• 1 Million+ subscribers on YouTube</li>
              <li>• Called the &quot;God of Economy&quot;</li>
              <li>• The Most Trusted Educator in UPSC Ecosystem</li>
              <li>• Unique Teaching Style — Roasting</li>
            </ul>
          </div>

          {/* Sudarshan Gurjar */}
          <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="avatar" style={{ background: "#5856d6", width: 44, height: 44, fontSize: 16 }}>S</div>
              <div>
                <div className="font-bold text-base">Sudarshan Gurjar</div>
                <div className="text-xs text-[var(--muted)]">Geography & Environment · Aspirational & Motivator</div>
              </div>
              <span className="tag ml-auto">Geography</span>
            </div>
            <ul className="text-xs text-[var(--muted)] space-y-1 ml-14">
              <li>• 9+ Years Teaching Experience</li>
              <li>• India&apos;s Top Geography & Environment Educator</li>
              <li>• Guided 5 Lakh+ Learners in UPSC & State Service</li>
              <li>• 1500+ Students cleared Prelims and Mains</li>
              <li>• Most Followed Educator in UPSC Ecosystem</li>
            </ul>
          </div>

          {/* Pratik Nayak */}
          <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="avatar" style={{ background: "#ff9500", width: 44, height: 44, fontSize: 16 }}>P</div>
              <div>
                <div className="font-bold text-base">Pratik Nayak</div>
                <div className="text-xs text-[var(--muted)]">History · Top History UPSC Educator</div>
              </div>
              <span className="tag ml-auto">History</span>
            </div>
            <ul className="text-xs text-[var(--muted)] space-y-1 ml-14">
              <li>• 12 Years Teaching Experience</li>
              <li>• 10 Million+ views on YouTube</li>
              <li>• Studied at CEPT University</li>
              <li>• Worked with Government of Gujarat</li>
              <li>• Top Educator on Unacademy</li>
              <li>• 500+ Learners cleared Prelims and Mains</li>
            </ul>
          </div>

          {/* Madhukar Kotawe */}
          <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="avatar" style={{ background: "#34c759", width: 44, height: 44, fontSize: 16 }}>M</div>
              <div>
                <div className="font-bold text-base">Madhukar Kotawe</div>
                <div className="text-xs text-[var(--muted)]">Geography, Polity, Economics, Current Affairs · Famous CSAT Educator</div>
              </div>
              <span className="tag ml-auto">Multi-Subject</span>
            </div>
            <ul className="text-xs text-[var(--muted)] space-y-1 ml-14">
              <li>• 16 Years Teaching Experience</li>
              <li>• Guided 3 Lakh+ CSE aspirants</li>
              <li>• 3000+ learners cleared UPSC Prelims and Mains</li>
              <li>• Motivation + Perception Builder</li>
              <li>• Teaches Geography, Polity, Economics & Current Affairs</li>
            </ul>
          </div>

          {/* Siddharth Arora */}
          <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="avatar" style={{ background: "#00c7be", width: 44, height: 44, fontSize: 16 }}>S</div>
              <div>
                <div className="font-bold text-base">Siddharth Arora</div>
                <div className="text-xs text-[var(--muted)]">UPSC Hindi Panel</div>
              </div>
            </div>
          </div>

          {/* Prateek */}
          <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="avatar" style={{ background: "#007aff", width: 44, height: 44, fontSize: 16 }}>P</div>
              <div>
                <div className="font-bold text-base">Prateek</div>
                <div className="text-xs text-[var(--muted)]">UPSC Hindi Panel</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* English Panel */}
      <div className="card">
        <div className="card-header"><h3>🌍 English Panel</h3></div>
        <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)" }}>
          <div className="flex items-center gap-3">
            <div className="avatar" style={{ background: "#007aff", width: 44, height: 44, fontSize: 16 }}>S</div>
            <div>
              <div className="font-bold text-base">Sarmad Sir</div>
              <div className="text-xs text-[var(--muted)]">UPSC English Panel Educator</div>
            </div>
          </div>
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
        <div className="flex items-center gap-3 mb-4"><span className="text-3xl">📚</span><div><h3 className="text-lg font-bold">K12 Category (Class 6-12)</h3><p className="text-xs text-[var(--muted)]">POC: Sayam Batra & Adhishreya Lal</p></div></div>
      </div>

      {/* Educators */}
      <div className="card">
        <div className="card-header"><h3>👨‍🏫 K12 Educators</h3></div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          <div className="lb-row"><div className="avatar" style={{ background: "#ff9500" }}>J</div><div className="lb-info"><div className="lb-name">Juhi Mam</div><div className="lb-meta">K12 Educator</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#5856d6" }}>A</div><div className="lb-info"><div className="lb-name">Ayush Sir</div><div className="lb-meta">K12 Educator</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#ff2d55" }}>S</div><div className="lb-info"><div className="lb-name">Saniya Mam</div><div className="lb-meta">K12 Educator</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#34c759" }}>A</div><div className="lb-info"><div className="lb-name">Abhinay Sir</div><div className="lb-meta">K12 Educator</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#007aff" }}>A</div><div className="lb-info"><div className="lb-name">Alok Sir</div><div className="lb-meta">K12 Educator</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#00c7be" }}>N</div><div className="lb-info"><div className="lb-name">Nikita Mam</div><div className="lb-meta">K12 Educator</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#ff2d55" }}>S</div><div className="lb-info"><div className="lb-name">Shivangi Mam</div><div className="lb-meta">K12 Educator</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#5856d6" }}>A</div><div className="lb-info"><div className="lb-name">Aryan Sir</div><div className="lb-meta">K12 Educator</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#ff9500" }}>P</div><div className="lb-info"><div className="lb-name">Prem Sir</div><div className="lb-meta">K12 Educator</div></div></div>
          <div className="lb-row"><div className="avatar" style={{ background: "#34c759" }}>K</div><div className="lb-info"><div className="lb-name">Kumar Sir</div><div className="lb-meta">K12 Educator</div></div></div>
        </div>
      </div>

      {/* Fan Pages */}
      <div className="card">
        <div className="card-header"><h3>📺 K12 Fan Pages (5 Channels)</h3></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>#</th><th>Channel Name</th><th>Link</th></tr></thead>
            <tbody>
              {[
                { name: "10th Titans Army", url: "https://www.youtube.com/@10thTitansArmy10" },
                { name: "Marks On", url: "https://www.youtube.com/@MarksOn21" },
                { name: "Avengerzs Army", url: "https://www.youtube.com/@AvengerzsArmy" },
                { name: "Boards ke Baahubali", url: "https://www.youtube.com/@BoardkeBaahubali" },
                { name: "Unacademy Pookies", url: "https://www.youtube.com/@UnacademyPookies" },
              ].map((ch, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td className="font-medium">{ch.name}</td>
                  <td><a href={ch.url} target="_blank" className="hover:text-[var(--red)] text-xs">{ch.url.replace("https://www.youtube.com/", "")}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
