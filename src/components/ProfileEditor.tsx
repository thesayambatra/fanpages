"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function ProfileEditor() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => { setProfile(d); setLoading(false); });
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setMsg("Image must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => setProfile({ ...profile, profileImage: reader.result as string });
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true); setMsg("");
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileImage: profile.profileImage, fullName: profile.fullName, bio: profile.bio }),
    });
    setSaving(false);
    setMsg("Saved!");
    router.refresh();
  };

  if (loading) return <div className="card text-center py-10 text-[var(--muted)]">Loading...</div>;

  return (
    <>
      <div className="page-header"><h2>👤 Profile</h2></div>
      <div className="card" style={{ maxWidth: 500 }}>
        {/* Photo */}
        <div className="flex flex-col items-center mb-6">
          {profile.profileImage ? (
            <img src={profile.profileImage} alt="" className="w-24 h-24 rounded-full object-cover mb-3 border-2 border-[var(--border)]" />
          ) : (
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-3" style={{ background: profile.avatarColor }}>
              {profile.fullName?.[0]}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <button onClick={() => fileRef.current?.click()} className="btn-outline btn-sm">
            📷 {profile.profileImage ? "Change Photo" : "Upload Photo"}
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--muted)] uppercase">Full Name</label>
            <input type="text" value={profile.fullName || ""} onChange={e => setProfile({ ...profile, fullName: e.target.value })} className="form-input w-full mt-1" />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--muted)] uppercase">Username</label>
            <input type="text" value={profile.username || ""} disabled className="form-input w-full mt-1 opacity-50" />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--muted)] uppercase">Role</label>
            <input type="text" value={profile.role || ""} disabled className="form-input w-full mt-1 opacity-50" />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--muted)] uppercase">Bio</label>
            <textarea value={profile.bio || ""} onChange={e => setProfile({ ...profile, bio: e.target.value })} className="form-input w-full mt-1" rows={3} placeholder="Tell something about yourself..." />
          </div>
        </div>

        <button onClick={save} disabled={saving} className="btn-primary w-full mt-6">
          {saving ? "Saving..." : "Save Profile"}
        </button>
        {msg && <p className="text-center text-sm mt-3 text-[#08bd80]">{msg}</p>}
      </div>
    </>
  );
}
