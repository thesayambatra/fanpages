"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SearchItem {
  label: string;
  href: string;
  type: "page" | "channel";
  icon: string;
}

const pages: SearchItem[] = [
  { label: "Manager Dashboard", href: "/manager", type: "page", icon: "🏠" },
  { label: "Channels", href: "/manager/channels", type: "page", icon: "📺" },
  { label: "Analytics", href: "/manager/analytics", type: "page", icon: "📊" },
  { label: "Growth", href: "/manager/growth", type: "page", icon: "📈" },
  { label: "Top Videos", href: "/manager/top-videos", type: "page", icon: "🎬" },
  { label: "Quick Open", href: "/manager/quick-open", type: "page", icon: "⚡" },
  { label: "Team", href: "/manager/team", type: "page", icon: "👥" },
  { label: "Saved Reels", href: "/manager/saved-reels", type: "page", icon: "💾" },
  { label: "Reports", href: "/manager/reports", type: "page", icon: "📋" },
  { label: "Compare Channels", href: "/manager/compare", type: "page", icon: "⚖️" },
  { label: "Activity Timeline", href: "/manager/activity", type: "page", icon: "🕒" },
  { label: "Employee Dashboard", href: "/employee", type: "page", icon: "🏠" },
  { label: "My Channels", href: "/employee/channels", type: "page", icon: "📺" },
  { label: "Intern Dashboard", href: "/intern", type: "page", icon: "🏠" },
];

interface CommandPaletteProps {
  channels?: { channelName: string; id: number }[];
}

export function CommandPalette({ channels = [] }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const allItems: SearchItem[] = [
    ...pages,
    ...channels.map((ch) => ({
      label: ch.channelName,
      href: `/manager/channels?search=${encodeURIComponent(ch.channelName)}`,
      type: "channel" as const,
      icon: "📺",
    })),
  ];

  const filtered = query.trim()
    ? allItems.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : allItems.slice(0, 8);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setSelectedIdx(0);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  const navigate = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIdx]) {
      e.preventDefault();
      navigate(filtered[selectedIdx].href);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "20vh",
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "560px",
          background: "var(--card-bg, #1e1e2e)",
          borderRadius: "12px",
          border: "1px solid var(--border, #333)",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border, #333)" }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search pages and channels..."
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--foreground, #fff)",
              fontSize: "1rem",
            }}
          />
        </div>
        <div style={{ maxHeight: "320px", overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted, #888)" }}>
              No results found
            </div>
          ) : (
            filtered.map((item, i) => (
              <div
                key={item.href + item.label}
                onClick={() => navigate(item.href)}
                style={{
                  padding: "0.6rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  cursor: "pointer",
                  background: i === selectedIdx ? "var(--border, #333)" : "transparent",
                  transition: "background 0.1s",
                }}
                onMouseEnter={() => setSelectedIdx(i)}
              >
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    color: "var(--muted, #888)",
                    background: "var(--bg, #111)",
                    padding: "0.15rem 0.4rem",
                    borderRadius: "4px",
                  }}
                >
                  {item.type}
                </span>
              </div>
            ))
          )}
        </div>
        <div
          style={{
            padding: "0.5rem 1rem",
            borderTop: "1px solid var(--border, #333)",
            display: "flex",
            gap: "1rem",
            fontSize: "0.75rem",
            color: "var(--muted, #888)",
          }}
        >
          <span><kbd style={{ background: "var(--border)", padding: "0.1rem 0.3rem", borderRadius: "3px" }}>↑↓</kbd> navigate</span>
          <span><kbd style={{ background: "var(--border)", padding: "0.1rem 0.3rem", borderRadius: "3px" }}>↵</kbd> open</span>
          <span><kbd style={{ background: "var(--border)", padding: "0.1rem 0.3rem", borderRadius: "3px" }}>esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
