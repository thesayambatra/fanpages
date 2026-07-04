"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  if (!session) return null;
  const user = session.user as any;
  const role = user.role;

  const links =
    role === "manager"
      ? [
          { href: "/manager", label: "Dashboard" },
          { href: "/manager/channels", label: "Channels" },
          { href: "/manager/analytics", label: "Analytics" },
          { href: "/manager/growth", label: "Growth" },
          { href: "/manager/top-videos", label: "Top Videos" },
          { href: "/manager/compare", label: "Compare" },
          { href: "/manager/quick-open", label: "Quick Open" },
          { href: "/manager/team", label: "Team" },
          { href: "/manager/saved-reels", label: "Saved Reels" },
          { href: "/manager/reports", label: "Reports" },
          { href: "/manager/activity", label: "Activity" },
        ]
      : role === "employee"
        ? [
            { href: "/employee", label: "Dashboard" },
            { href: "/employee/channels", label: "My Channels" },
            { href: "/employee/growth", label: "Growth" },
            { href: "/employee/interns", label: "Interns" },
          ]
        : [
            { href: "/intern", label: "Dashboard" },
            { href: "/intern/channels", label: "My Channels" },
          ];

  return (
    <nav className="navbar">
      <div className="nav-brand">▶ Unacademy FanPages</div>
      <div className="nav-links">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href || (l.href !== "/manager" && l.href !== "/employee" && l.href !== "/intern" && pathname.startsWith(l.href + "/")) ? "active" : ""}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <div className="avatar" style={{ background: user.avatarColor }}>
          {user.name?.[0] || "?"}
        </div>
        <span className="text-sm font-medium">{user.name}</span>
        <span className={`badge ${role}`}>{role}</span>
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="btn-outline btn-sm">
          Logout
        </button>
      </div>
    </nav>
  );
}
