"use client";
import { useState, useEffect, useRef } from "react";

interface GalleryImage {
  id: number;
  imageUrl: string;
  caption: string;
  createdAt: string;
  uploadedBy: { fullName: string; avatarColor: string };
}

export function GalleryView() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const res = await fetch("/api/gallery");
    const data = await res.json();
    setImages(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview) return;
    setUploading(true);
    const res = await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: preview, caption }),
    });
    if (res.ok) {
      setPreview(null);
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
      fetchImages();
    }
    setUploading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this image?")) return;
    await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    fetchImages();
    setLightbox(null);
  };

  return (
    <>
      <div className="page-header">
        <h2>🖼️ Team Gallery</h2>
        <span className="text-sm text-[var(--muted)]">{images.length} photos</span>
      </div>

      {/* Upload Section */}
      <div className="card">
        <div className="card-header"><h3>📷 Add Photo</h3></div>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="form-input w-full text-xs"
            />
            <input
              type="text"
              placeholder="Caption (optional)"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              className="form-input w-full mt-2"
            />
            <button
              onClick={handleUpload}
              disabled={!preview || uploading}
              className="btn-primary mt-2"
            >
              {uploading ? "Uploading..." : "Upload Photo"}
            </button>
          </div>
          {preview && (
            <div className="relative">
              <img src={preview} alt="Preview" className="rounded-xl max-h-32 object-cover" />
              <button
                onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-xs text-white"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="card text-center py-10 text-[var(--muted)]">Loading gallery...</div>
      ) : images.length === 0 ? (
        <div className="card text-center py-10 text-[var(--muted)]">
          <div className="text-4xl mb-3">📷</div>
          <p>No photos yet. Be the first to share a team moment!</p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {images.map((img) => (
            <div
              key={img.id}
              onClick={() => setLightbox(img)}
              className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl"
              style={{ background: "var(--glass)", border: "1px solid var(--glass-border)" }}
            >
              <img
                src={img.imageUrl}
                alt={img.caption}
                className="w-full h-48 object-cover"
              />
              <div className="p-3">
                {img.caption && <p className="text-sm font-medium mb-1">{img.caption}</p>}
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] text-white font-bold"
                    style={{ background: img.uploadedBy.avatarColor }}
                  >
                    {img.uploadedBy.fullName[0]}
                  </div>
                  <span className="text-xs text-[var(--muted)]">{img.uploadedBy.fullName}</span>
                  <span className="text-xs text-[var(--muted)] ml-auto">
                    {new Date(img.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
          onClick={() => setLightbox(null)}
        >
          <div
            className="max-w-3xl w-full rounded-2xl overflow-hidden"
            style={{ background: "var(--glass)", border: "1px solid var(--glass-border)" }}
            onClick={e => e.stopPropagation()}
          >
            <img src={lightbox.imageUrl} alt={lightbox.caption} className="w-full max-h-[70vh] object-contain bg-black" />
            <div className="p-4 flex items-center justify-between">
              <div>
                {lightbox.caption && <p className="font-medium mb-1">{lightbox.caption}</p>}
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                    style={{ background: lightbox.uploadedBy.avatarColor }}
                  >
                    {lightbox.uploadedBy.fullName[0]}
                  </div>
                  <span className="text-sm text-[var(--muted)]">{lightbox.uploadedBy.fullName}</span>
                  <span className="text-xs text-[var(--muted)]">· {new Date(lightbox.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <button onClick={() => handleDelete(lightbox.id)} className="btn-danger btn-sm">🗑️ Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
