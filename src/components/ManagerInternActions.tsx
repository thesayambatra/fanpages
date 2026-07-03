"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ManagerInternActions({ internId, name }: { internId: number; name: string }) {
  const router = useRouter();
  const [showReset, setShowReset] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [loading, setLoading] = useState(false);

  const remove = async () => {
    if (!confirm(`Remove intern "${name}"? This will delete ALL their channels too.`)) return;
    setLoading(true);
    await fetch(`/api/interns/${internId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  };

  const resetPassword = async () => {
    if (!newPw.trim()) return;
    await fetch(`/api/interns/${internId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: newPw }),
    });
    setNewPw("");
    setShowReset(false);
    alert(`Password reset for ${name}`);
  };

  return (
    <div className="flex items-center gap-1 relative">
      <button onClick={() => setShowReset(!showReset)} className="btn-icon" title="Reset Password" style={{ width: 24, height: 24, fontSize: 11 }}>
        🔑
      </button>
      <button onClick={remove} disabled={loading} className="btn-icon danger" title="Delete Intern" style={{ width: 24, height: 24, fontSize: 11 }}>
        {loading ? "⏳" : "✕"}
      </button>
      {showReset && (
        <div className="absolute top-7 right-0 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-2 z-20 flex gap-2 shadow-xl">
          <input
            type="text" placeholder="New password" value={newPw}
            onChange={e => setNewPw(e.target.value)}
            className="form-input text-xs w-28 py-1"
          />
          <button onClick={resetPassword} className="btn-primary btn-sm text-xs">Set</button>
          <button onClick={() => setShowReset(false)} className="btn-outline btn-sm text-xs">✕</button>
        </div>
      )}
    </div>
  );
}
