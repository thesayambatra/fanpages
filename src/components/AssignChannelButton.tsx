"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function AssignChannelButton({ channelId }: { channelId: number }) {
  const [open, setOpen] = useState(false);
  const [interns, setInterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open && interns.length === 0) {
      fetch("/api/interns").then(r => r.json()).then(data => {
        setInterns(Array.isArray(data) ? data : []);
      });
    }
  }, [open]);

  const assign = async (internId: number) => {
    setLoading(true);
    await fetch("/api/channels/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId, internId }),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-icon" title="Assign to Intern" style={{ width: 24, height: 24, fontSize: 11 }}>
        👤
      </button>
    );
  }

  return (
    <div className="absolute top-7 right-0 bg-[var(--bg)] border border-[var(--glass-border)] rounded-xl p-3 z-20 shadow-xl min-w-[180px]" style={{ backdropFilter: "blur(20px)" }}>
      <p className="text-xs font-semibold text-[var(--muted)] mb-2">Assign to:</p>

      {/* Take back / Assign to me */}
      <button
        onClick={() => assign(-1)}
        disabled={loading}
        className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-[rgba(255,45,85,0.05)] transition-all flex items-center gap-2 mb-1 font-semibold"
        style={{ borderBottom: "1px solid var(--glass-border)", paddingBottom: "8px", marginBottom: "6px" }}
      >
        ↩️ Take back (assign to me)
      </button>

      {interns.length === 0 ? (
        <p className="text-xs text-[var(--muted)]">No interns found</p>
      ) : (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {interns.map((intern: any) => (
            <button
              key={intern.id}
              onClick={() => assign(intern.id)}
              disabled={loading}
              className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-[rgba(255,45,85,0.05)] transition-all flex items-center gap-2"
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold" style={{ background: intern.avatarColor }}>
                {intern.fullName[0]}
              </div>
              {intern.fullName}
            </button>
          ))}
        </div>
      )}
      <button onClick={() => setOpen(false)} className="btn-outline btn-sm w-full mt-2 text-xs">Cancel</button>
    </div>
  );
}
