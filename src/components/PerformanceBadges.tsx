"use client";

interface PerformanceBadgesProps {
  subscribers: number;
  engagementRate: number;
}

export function PerformanceBadges({ subscribers, engagementRate }: PerformanceBadgesProps) {
  const badges: { emoji: string; title: string }[] = [];

  if (engagementRate > 10) {
    badges.push({ emoji: "🔥", title: "High engagement (>10%)" });
  }
  if (subscribers > 10000) {
    badges.push({ emoji: "⭐", title: "10K+ subscribers" });
  }
  if (engagementRate < 1) {
    badges.push({ emoji: "⚠️", title: "Low engagement (<1%)" });
  }

  if (badges.length === 0) return null;

  return (
    <span style={{ marginLeft: "0.4rem" }}>
      {badges.map((b, i) => (
        <span key={i} title={b.title} style={{ cursor: "help" }}>
          {b.emoji}
        </span>
      ))}
    </span>
  );
}
