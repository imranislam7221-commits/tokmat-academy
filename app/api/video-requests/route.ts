import { NextResponse } from "next/server";
import { pool, initDb } from "@/lib/db";
import { getUserFromRequest } from "../auth/route";

async function getUser(req: Request) {
  try { return await getUserFromRequest(req); } catch { return null; }
}

async function ensureTable() {
  await initDb();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS video_requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      video_id TEXT NOT NULL,
      video_title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function GET(req: Request) {
  // admin sees all, user sees own
  const user = await getUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  await ensureTable();
  if (user.role === "admin") {
    const res = await pool.query(`SELECT vr.*, u.email, u.first_name FROM video_requests vr JOIN users u ON u.id=vr.user_id ORDER BY vr.created_at DESC LIMIT 200`);
    return NextResponse.json({ ok: true, requests: res.rows });
  } else {
    const res = await pool.query(`SELECT * FROM video_requests WHERE user_id=$1 ORDER BY created_at DESC`, [user.id]);
    // full access check — approved hole flag on
    const hasFullAccess = res.rows.some((r: any) => r.video_id === "full_access" && r.status === "approved");
    return NextResponse.json({ ok: true, requests: res.rows, fullAccess: hasFullAccess });
  }
}

export async function POST(req: Request) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "Please login" }, { status: 401 });
  await ensureTable();
  const { video_id, video_title } = await req.json();
  if (!video_id || !video_title) return NextResponse.json({ ok: false, error: "video required" }, { status: 400 });
  // avoid duplicate pending
  const dup = await pool.query(`SELECT id FROM video_requests WHERE user_id=$1 AND video_id=$2 AND status='pending'`, [user.id, String(video_id)]);
  if (dup.rows.length) return NextResponse.json({ ok: false, error: "Already requested, pending approval" }, { status: 409 });
  const approved = await pool.query(`SELECT id FROM video_requests WHERE user_id=$1 AND video_id=$2 AND status='approved'`, [user.id, String(video_id)]);
  if (approved.rows.length) return NextResponse.json({ ok: false, error: "Already approved" }, { status: 409 });
  const res = await pool.query(`INSERT INTO video_requests (user_id, video_id, video_title, status) VALUES ($1,$2,$3,'pending') RETURNING *`, [user.id, String(video_id), String(video_title)]);
  return NextResponse.json({ ok: true, request: res.rows[0] });
}

// Full Access ($100 one-time — sob video unlock) request
export async function PUT(req: Request) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "Please login" }, { status: 401 });
  await ensureTable();
  // already approved?
  const approved = await pool.query(`SELECT id FROM video_requests WHERE user_id=$1 AND video_id='full_access' AND status='approved'`, [user.id]);
  if (approved.rows.length) return NextResponse.json({ ok: false, error: "Full access already active" }, { status: 409 });
  // pending?
  const pending = await pool.query(`SELECT id FROM video_requests WHERE user_id=$1 AND video_id='full_access' AND status='pending'`, [user.id]);
  if (pending.rows.length) return NextResponse.json({ ok: false, error: "Full access request already pending" }, { status: 409 });
  const res = await pool.query(`INSERT INTO video_requests (user_id, video_id, video_title, status) VALUES ($1,'full_access','Full Access — All Courses ($100)','pending') RETURNING *`, [user.id]);
  return NextResponse.json({ ok: true, request: res.rows[0] });
}

export async function PATCH(req: Request) {
  const user = await getUser(req);
  if (!user || user.role !== "admin") return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  await ensureTable();
  const { id, status } = await req.json();
  if (!id || !["approved","rejected","pending"].includes(status)) return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  await pool.query(`UPDATE video_requests SET status=$1 WHERE id=$2`, [status, id]);
  return NextResponse.json({ ok: true });
}

// Cancel — user sudhu nijer PENDING request cancel korte parbe; admin jekono delete korte parbe
export async function DELETE(req: Request) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  await ensureTable();
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  if (user.role === "admin") {
    await pool.query(`DELETE FROM video_requests WHERE id=$1`, [id]);
    return NextResponse.json({ ok: true });
  }
  const res = await pool.query(`DELETE FROM video_requests WHERE id=$1 AND user_id=$2 AND status='pending' RETURNING id`, [id, user.id]);
  if (!res.rows.length) return NextResponse.json({ ok: false, error: "Not found or not cancelable" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
