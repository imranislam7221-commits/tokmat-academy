import { NextResponse } from "next/server";
import { pool, initDb } from "@/lib/db";
import { put } from "@vercel/blob";
import { getUserFromRequest } from "../auth/route";

// ===== Testimonial Posts (admin uploaded screenshots) =====
// Admin panel theke screenshot upload korle ekhane save hoy (Vercel Blob + DB).
// Homepage er testimonial section e SOBAR AGE dekhay (real users ar mock review er age).
//
// GET  (public): approved posts list — homepage dekhabe
// POST (admin): screenshot upload (multipart form: file, name?, country?)
// DELETE (admin): ?id= — post delete

export const dynamic = "force-dynamic";

async function ensureTable() {
  await initDb();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS testimonial_posts (
      id SERIAL PRIMARY KEY,
      image_url TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      country TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function GET() {
  try {
    await ensureTable();
    const res = await pool.query(
      `SELECT id, image_url, name, country, sort_order, created_at
       FROM testimonial_posts
       ORDER BY sort_order ASC, created_at DESC
       LIMIT 50`
    );
    return NextResponse.json(
      { ok: true, posts: res.rows },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (e) {
    console.error("testimonial-posts GET error:", e);
    return NextResponse.json({ ok: false, error: "Failed to load" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized — admin only" }, { status: 401 });
  }
  try {
    await ensureTable();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
    }

    // Image only (screenshot)
    const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(file.name);
    if (!isImage) {
      return NextResponse.json({ ok: false, error: "Only image files allowed (png, jpg, webp)" }, { status: 400 });
    }
    // 10MB limit — screenshot er jonno beshi
    const MAX = 10 * 1024 * 1024;
    if (file.size > MAX) {
      return NextResponse.json({ ok: false, error: "File too large (max 10MB)" }, { status: 400 });
    }

    const name = String(formData.get("name") || "").trim().slice(0, 60);
    const country = String(formData.get("country") || "").trim().slice(0, 60);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-60);
    const key = `testimonials/${Date.now()}-${safeName}`;
    const blob = await put(key, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type || "image/png",
    });

    const res = await pool.query(
      `INSERT INTO testimonial_posts (image_url, name, country) VALUES ($1, $2, $3) RETURNING *`,
      [blob.url, name, country]
    );
    return NextResponse.json({ ok: true, post: res.rows[0] });
  } catch (e: any) {
    console.error("testimonial-posts POST error:", e);
    return NextResponse.json({ ok: false, error: "Upload failed: " + String(e?.message || e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ensureTable();
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
    await pool.query(`DELETE FROM testimonial_posts WHERE id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Failed to delete" }, { status: 500 });
  }
}
