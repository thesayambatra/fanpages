"use client";
import { useRouter } from "next/navigation";

export function StudioConnect({ channelDbId, hasToken }: { channelDbId: number; hasToken: boolean }) {
  const router = useRouter();

  if (hasToken) {
    return (
      <div className="flex items-center gap-2">
        <a href={`/intern/studio?channelId=${channelDbId}`} className="btn-outline btn-sm" style={{ color: "#4caf50", borderColor: "#4caf5044" }}>
          📊 View Studio
        </a>
        <button
          onClick={async () => {
            if (!confirm("Disconnect Google account from this channel?")) return;
            await fetch(`/api/oauth/disconnect`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ channelId: channelDbId }),
            });
            router.refresh();
          }}
          className="btn-icon" title="Disconnect" style={{ width: 24, height: 24, fontSize: 10 }}
        >
          🔌
        </button>
      </div>
    );
  }

  return (
    <a href={`/api/oauth?channelId=${channelDbId}`} className="btn-outline btn-sm" style={{ color: "#ff9800", borderColor: "#ff980044" }}>
      🔗 Connect Google
    </a>
  );
}
