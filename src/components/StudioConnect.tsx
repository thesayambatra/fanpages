"use client";
import { useRouter } from "next/navigation";

export function StudioConnect({ channelDbId, hasToken }: { channelDbId: number; hasToken: boolean }) {
  const router = useRouter();

  if (hasToken) {
    return (
      <div className="flex items-center gap-1">
        <a href={`/intern/studio?channelId=${channelDbId}`} className="btn-outline btn-sm text-xs whitespace-nowrap" style={{ color: "#4caf50", borderColor: "#4caf5044" }}>
          📊 Studio
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
          className="btn-icon" title="Disconnect" style={{ width: 22, height: 22, fontSize: 10 }}
        >
          🔌
        </button>
      </div>
    );
  }

  return (
    <a href={`/api/oauth?channelId=${channelDbId}`} className="btn-outline btn-sm text-xs whitespace-nowrap" style={{ color: "#ff9800", borderColor: "#ff980044" }}>
      🔗 Connect
    </a>
  );
}
