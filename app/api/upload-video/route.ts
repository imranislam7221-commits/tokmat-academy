import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getUserFromRequest } from "../auth/route";

// Video upload — sudhu admin.
// File direct Vercel Blob e jay (public access — website theke play kora jay).
// Browser theke direct upload (client upload token) — boro file er jonno.

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized — admin only" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "Blob storage not configured. Add BLOB_READ_WRITE_TOKEN in Vercel settings." },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
    }

    // Video files only (common formats)
    const allowed = ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v", "video/ogg"];
    const isVideo = allowed.includes(file.type) || /\.(mp4|webm|mov|m4v|ogv)$/i.test(file.name);
    if (!isVideo) {
      return NextResponse.json({ ok: false, error: "Only video files allowed (mp4, webm, mov)" }, { status: 400 });
    }

    // 2GB Vercel Blob per-upload limit er niche rakhi
    const MAX = 2 * 1024 * 1024 * 1024;
    if (file.size > MAX) {
      return NextResponse.json({ ok: false, error: "File too large (max 2GB)" }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
    const key = `videos/${Date.now()}-${safeName}`;

    const blob = await put(key, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type || "video/mp4",
    });

    return NextResponse.json({ ok: true, url: blob.url, pathname: blob.pathname, size: file.size });
  } catch (e: any) {
    console.error("video upload error:", e);
    return NextResponse.json({ ok: false, error: "Upload failed: " + String(e?.message || e) }, { status: 500 });
  }
}
