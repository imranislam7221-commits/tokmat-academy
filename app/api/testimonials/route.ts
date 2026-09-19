import { NextResponse } from "next/server";
import { pool, initDb } from "@/lib/db";

// Public testimonials — REAL registered users ekjon ekjon kore ashbe.
// Sob registered user (admin bad) — notun user age (ekta ekta kore add hoi).
// Sudhu safe fields: first_name, country, created_at. Email/phone kichu nai.
// Sathe HERO STATS o dibe — real user/signal/country count (homepage stats section
// mock number er sathe merge korbe: 50,000+ / 5,500+ / 85% / 100+ er upor add hobe).
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initDb();
    const res = await pool.query(
      `SELECT first_name, country, created_at
       FROM users
       WHERE role != 'admin' AND status != 'Suspended'
       ORDER BY created_at ASC
       LIMIT 500`
    );
    const testimonials = res.rows.map((u: any) => ({
      name: u.first_name || "Trader",
      country: u.country || "",
      joined: u.created_at,
    }));

    // ===== Hero stats — REAL counts (DB theke) =====
    let stats = { users: 0, signals: 0, winRate: null as number | null, resolved: 0, countries: 0 };
    try {
      const uRes = await pool.query(
        `SELECT COUNT(*)::int AS c FROM users WHERE role != 'admin' AND status != 'Suspended'`
      );
      stats.users = uRes.rows[0]?.c || 0;
      const cRes = await pool.query(
        `SELECT COUNT(DISTINCT country)::int AS c FROM users
         WHERE role != 'admin' AND status != 'Suspended' AND country IS NOT NULL AND country <> ''`
      );
      stats.countries = cRes.rows[0]?.c || 0;
    } catch {}
    // Signals count + win rate (TP Hit = win, onno resolved status = loss; Running bad)
    try {
      const sRes = await pool.query(`SELECT status, COUNT(*)::int AS c FROM signals GROUP BY status`);
      let wins = 0, resolved = 0, total = 0;
      for (const row of sRes.rows) {
        total += row.c;
        if (String(row.status) === "Running") continue;
        resolved += row.c;
        if (String(row.status).toLowerCase().includes("tp")) wins += row.c;
      }
      stats.signals = total;
      stats.resolved = resolved;
      stats.winRate = resolved > 0 ? (wins / resolved) * 100 : null;
    } catch {}

    return NextResponse.json(
      { ok: true, testimonials, stats },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (e) {
    console.error("testimonials GET error:", e);
    return NextResponse.json({ ok: false, error: "Failed to load" }, { status: 500 });
  }
}
