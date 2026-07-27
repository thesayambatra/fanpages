"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid credentials");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="login-body">
      <div className="fixed top-4 right-4 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
            <path d="M8 8C8 8 8 20 20 20C32 20 32 8 32 8" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" fill="none"/>
            <path d="M8 8L32 8" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round"/>
            <ellipse cx="20" cy="32" rx="6" ry="4" fill="#08bd80"/>
          </svg>
          <span className="text-sm font-bold"><span style={{ color: "#3b82f6" }}>un</span><span style={{ color: "#08bd80" }}>academy</span></span>
        </div>
        <ThemeToggle />
      </div>
      <div className="login-wrap text-center">
        <div className="mb-6">
          <svg width="48" height="48" viewBox="0 0 40 40" fill="none" className="mx-auto">
            <path d="M8 8C8 8 8 20 20 20C32 20 32 8 32 8" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" fill="none"/>
            <path d="M8 8L32 8" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round"/>
            <ellipse cx="20" cy="32" rx="6" ry="4" fill="#08bd80"/>
          </svg>
        </div>
        <h1 className="text-xl font-black mb-1"><span style={{ color: "#3b82f6" }}>un</span><span style={{ color: "#08bd80" }}>academy</span> FanPages</h1>
        <p className="text-xs text-[var(--muted)] mb-6">YouTube Shorts Analytics Platform</p>
        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-900/30 border border-red-700/40 text-red-400 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            className="form-input w-full"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input w-full"
          />
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-xs text-[var(--muted)] mt-6">Made by Sayam Batra</p>
      </div>
    </div>
  );
}
