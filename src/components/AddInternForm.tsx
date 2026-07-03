"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddInternForm() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/interns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, username, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setFullName(""); setUsername(""); setPassword("");
      setMsg("Intern added!");
      router.refresh();
    } else {
      setMsg(data.error || "Error adding intern");
    }
  };

  return (
    <div className="card">
      <h3 className="text-sm font-semibold mb-3 text-[var(--muted)] uppercase tracking-wide">Add New Intern</h3>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap">
        <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required className="form-input" />
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required className="form-input" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="form-input" />
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Adding..." : "Add Intern"}
        </button>
      </form>
      {msg && <p className="mt-2 text-sm text-[var(--muted)]">{msg}</p>}
    </div>
  );
}
