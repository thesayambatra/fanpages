"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORIES = ["JEE", "K12", "UPSC", "NEET"];

export function EditCategoryButton({ channelId, currentCategory }: { channelId: number; currentCategory: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState(currentCategory);

  const save = async () => {
    await fetch(`/api/channels/${channelId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: cat }),
    });
    setOpen(false);
    router.refresh();
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-icon" title="Edit Category" style={{ width: 24, height: 24, fontSize: 11 }}>
        ✎
      </button>
    );
  }

  return (
    <div className="absolute top-7 right-0 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-2 z-20 flex gap-2 shadow-xl">
      <select value={cat} onChange={e => setCat(e.target.value)} className="form-input text-xs py-1">
        <option value="">No Category</option>
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <button onClick={save} className="btn-primary btn-sm text-xs">Save</button>
      <button onClick={() => setOpen(false)} className="btn-outline btn-sm text-xs">✕</button>
    </div>
  );
}
