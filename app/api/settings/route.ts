import { NextResponse } from "next/server";
import { pool, initDb } from "@/lib/db";
import { getUserFromRequest } from "../auth/route";

// Site settings — admin panel theke control kora jay.
// GET (public): settings e khule rakha value gulo (offer banner etc.)
// PUT: sudhu admin — settings update
// force-dynamic: admin save korle sathe sathe sob page e notun value jabe (cache hole deadline/time dekhato na)
export const dynamic = "force-dynamic";
export const revalidate = 0;

const PUBLIC_KEYS = [
  "offer_enabled",
  "offer_title",
  "offer_subtitle",
  "offer_deadline",
  "offer_cta_text",
  "site_name",
  "support_email",
  "telegram_link",
  "max_free_signals",
];

async function ensureTable() {
  await initDb();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

// Default values — first load e seed hoy
const DEFAULTS: Record<string, string> = {
  offer_enabled: "true",
  offer_title: "LIMITED OFFER",
  offer_subtitle: "Premium Signals Discount Ends Soon!",
  offer_deadline: "",
  offer_cta_text: "Join Now — It's Free",
  site_name: "Tokmat Academy",
  support_email: "maasum1231@gmail.com",
  telegram_link: "https://t.me/TokmatSignal",
  max_free_signals: "3",
};

export async function GET() {
  try {
    await ensureTable();
    // seed defaults if missing
    for (const [key, value] of Object.entries(DEFAULTS)) {
      await pool.query(`INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`, [key, value]);
    }
    // One-time migration: purano placeholder email -> real Gmail (already-seeded DB teo kaj kore)
    await pool.query(`UPDATE site_settings SET value='maasum1231@gmail.com' WHERE key='support_email' AND value='support@tokmatacademy.com'`);
    const res = await pool.query(`SELECT key, value FROM site_settings WHERE key = ANY($1)`, [PUBLIC_KEYS]);
    const settings: Record<string, string> = {};
    for (const row of res.rows) settings[row.key] = row.value;
    // fill missing with defaults
    for (const [key, value] of Object.entries(DEFAULTS)) {
      if (!(key in settings)) settings[key] = value;
    }
    return NextResponse.json({ ok: true, settings }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } });
  } catch (e) {
    console.error("settings GET error:", e);
    return NextResponse.json({ ok: false, error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized — admin only" }, { status: 401 });
  }
  try {
    await ensureTable();
    const body = await req.json();
    const updates: Record<string, string> = {};
    for (const key of Object.keys(DEFAULTS)) {
      if (key in body) updates[key] = String(body[key]);
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: "No valid settings provided" }, { status: 400 });
    }
    for (const [key, value] of Object.entries(updates)) {
      await pool.query(
        `INSERT INTO site_settings (key, value, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, value]
      );
    }
    return NextResponse.json({ ok: true, updated: Object.keys(updates) });
  } catch (e) {
    console.error("settings PUT error:", e);
    return NextResponse.json({ ok: false, error: "Failed to save settings" }, { status: 500 });
  }
}
