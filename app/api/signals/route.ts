import { NextResponse } from "next/server";
import { pool, initDb } from "@/lib/db";
import { getUserFromRequest } from "../auth/route";

// Signals ekhon PostgreSQL e save hoy (age data/signals.json file e chilo —
// Vercel e file system ephemeral, proti deploy e data harato).

async function ensureTable() {
  await initDb();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS signals (
      id BIGINT PRIMARY KEY,
      pair TEXT NOT NULL,
      direction TEXT NOT NULL DEFAULT 'BUY',
      entry TEXT NOT NULL,
      tp TEXT NOT NULL DEFAULT '',
      sl TEXT NOT NULL DEFAULT '',
      profit TEXT NOT NULL DEFAULT '+0.00%',
      status TEXT NOT NULL DEFAULT 'Running',
      time TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function readSignals() {
  await ensureTable();
  const res = await pool.query(`SELECT * FROM signals ORDER BY id DESC LIMIT 50`);
  return res.rows.map((r: any) => ({
    pair: r.pair,
    direction: r.direction,
    entry: r.entry,
    tp: r.tp,
    sl: r.sl,
    profit: r.profit,
    status: r.status,
    time: r.time,
    id: Number(r.id),
  }));
}

// POST/DELETE sudhu admin pari — public keu fake signal push korte parbe na
async function requireAdmin(req: Request) {
  const user = await getUserFromRequest(req);
  return !!user && user.role === "admin";
}

export async function GET() {
  const signals = await readSignals();
  return NextResponse.json({ signals });
}

export async function POST(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized — admin only" }, { status: 401 });
  }
  try {
    await ensureTable();
    const body = await req.json();
    const { pair, direction, entry, tp, sl, status, profit } = body;
    if (!pair || !entry) return NextResponse.json({ error: "pair and entry required" }, { status: 400 });
    const id = Date.now();
    const newSignal = {
      pair: String(pair),
      direction: direction || "BUY",
      entry: String(entry),
      tp: String(tp || entry),
      sl: String(sl || entry),
      profit: profit || "+0.00%",
      status: status || "Running",
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
      id,
    };
    await pool.query(
      `INSERT INTO signals (id, pair, direction, entry, tp, sl, profit, status, time)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [newSignal.id, newSignal.pair, newSignal.direction, newSignal.entry, newSignal.tp, newSignal.sl, newSignal.profit, newSignal.status, newSignal.time]
    );
    return NextResponse.json({ ok: true, signal: newSignal });
  } catch (e: any) {
    return NextResponse.json({ error: "insert failed: " + String(e?.message || e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized — admin only" }, { status: 401 });
  }
  try {
    await ensureTable();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const pair = searchParams.get("pair");
    if (id) await pool.query(`DELETE FROM signals WHERE id = $1`, [Number(id)]);
    else if (pair) await pool.query(`DELETE FROM signals WHERE pair = $1`, [pair]);
    else await pool.query(`DELETE FROM signals`);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: "delete failed: " + String(e?.message || e) }, { status: 500 });
  }
}
