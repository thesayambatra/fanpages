"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EditCategoryButton } from "./EditCategoryButton";

export function ChannelActions({ channelId, category }: { channelId: number; category?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    await fetch(`/api/channels/${channelId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: true }),
    });
    setLoading(false);
    router.refresh();
  };

  const remove = async () => {
    if (!confirm("Remove this channel?")) return;
    await fetch(`/api/channels/${channelId}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="flex gap-1 relative">
      <a href={`/employee/stats?channelId=${channelId}`} className="btn-icon" title="View Stats" style={{ color: "#4caf50", borderColor: "#4caf5044" }}>📊</a>
      <EditCategoryButton channelId={channelId} currentCategory={category || ""} />
      <button onClick={refresh} disabled={loading} className="btn-icon" title="Refresh">
        {loading ? "⏳" : "↻"}
      </button>
      <button onClick={remove} className="btn-icon danger" title="Delete">✕</button>
    </div>
  );
}
