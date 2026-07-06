"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  if (!session) return null;
  const user = session.user as any;
  const role = user.role;

  const links =
    role === "manager" || role === "cbo"
      ? [
          { href: "/manager", label: "Dashboard" },
          { href: "/manager/channels", label: "Channels" },
          { href: "/manager/analytics", label: "Analytics" },
          { href: "/team", label: "Team" },
          { href: "/kt", label: "KT Doc" },
        ]
      : role === "employee"
        ? [
            { href: "/employee", label: "Dashboard" },
            { href: "/employee/channels", label: "Channels" },
            { href: "/employee/interns", label: "Interns" },
            { href: "/team", label: "Team" },
            { href: "/kt", label: "KT Doc" },
          ]
        : [
            { href: "/intern", label: "Dashboard" },
            { href: "/intern/channels", label: "Channels" },
            { href: "/team", label: "Team" },
            { href: "/kt", label: "KT Doc" },
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
        <ThemeToggle />
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
