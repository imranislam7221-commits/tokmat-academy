import { NextResponse } from "next/server";
import { pool, initDb } from "@/lib/db";
import { getUserFromRequest } from "../auth/route";

// Contact form messages — DB te save hoy, admin panel e dekha jay.
// POST (public): notun message pathano
// GET (admin): sob message dekha
// PATCH (admin): mark read/unread
// DELETE (admin): message delete

export const dynamic = "force-dynamic";

async function ensureTable() {
  await initDb();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, error: "Name, email and message required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ ok: false, error: "Message too long (max 5000 chars)" }, { status: 400 });
    }

    await ensureTable();

    // Light rate limiting: ek email theke 10 min e 5 tar beshi message na
    const recent = await pool.query(
      `SELECT COUNT(*)::int AS c FROM contact_messages
       WHERE email = $1 AND created_at > NOW() - INTERVAL '10 minutes'`,
      [email.toLowerCase()]
    );
    if (recent.rows[0].c >= 5) {
      return NextResponse.json({ ok: false, error: "Too many messages. Try again later." }, { status: 429 });
    }

    await pool.query(
      `INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)`,
      [name.slice(0, 100), email.toLowerCase().slice(0, 200), message]
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("contact POST error:", e);
    return NextResponse.json({ ok: false, error: "Failed to send message" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ensureTable();
    const res = await pool.query(
      `SELECT id, name, email, message, is_read, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 200`
    );
    return NextResponse.json({ ok: true, messages: res.rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("contact GET error:", e);
    return NextResponse.json({ ok: false, error: "Failed to load messages" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id, is_read } = await req.json();
    if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
    await ensureTable();
    await pool.query(`UPDATE contact_messages SET is_read = $1 WHERE id = $2`, [!!is_read, id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
    await ensureTable();
    await pool.query(`DELETE FROM contact_messages WHERE id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Failed to delete" }, { status: 500 });
  }
}
