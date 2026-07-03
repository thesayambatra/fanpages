"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function InternActions({ internId, name }: { internId: number; name: string }) {
  const router = useRouter();
  const [showReset, setShowReset] = useState(false);
  const [newPw, setNewPw] = useState("");

  const remove = async () => {
    if (!confirm(`Remove intern ${name}? This will delete all their channels too.`)) return;
    await fetch(`/api/interns/${internId}`, { method: "DELETE" });
    router.refresh();
  };

  const resetPassword = async () => {
    if (!newPw) return;
    await fetch(`/api/interns/${internId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: newPw }),
    });
    setNewPw("");
    setShowReset(false);
    alert("Password reset!");
  };

  return (
    <div className="flex items-center gap-1 relative">
      <button onClick={() => setShowReset(!showReset)} className="btn-icon" title="Reset Password">🔑</button>
      <button onClick={remove} className="btn-icon danger" title="Delete">✕</button>
      {showReset && (
        <div className="absolute top-8 right-0 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 z-10 flex gap-2">
          <input type="text" placeholder="New password" value={newPw} onChange={e => setNewPw(e.target.value)} className="form-input text-xs w-32" />
          <button onClick={resetPassword} className="btn-primary btn-sm">Set</button>
        </div>
      )}
    </div>
  );
}
