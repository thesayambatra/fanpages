"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EditCategoryButton } from "./EditCategoryButton";

export function ManagerChannelActions({ channelId, name, category }: { channelId: number; name: string; category?: string }) {
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
    if (!confirm(`Remove channel "${name}"?`)) return;
    setLoading(true);
    await fetch(`/api/channels/${channelId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1 relative">
      <EditCategoryButton channelId={channelId} currentCategory={category || ""} />
      <button onClick={refresh} disabled={loading} className="btn-icon" title="Refresh" style={{ width: 24, height: 24, fontSize: 11 }}>
        {loading ? "⏳" : "↻"}
      </button>
      <button onClick={remove} disabled={loading} className="btn-icon danger" title="Delete" style={{ width: 24, height: 24, fontSize: 11 }}>
        ✕
      </button>
    </div>
  );
}
