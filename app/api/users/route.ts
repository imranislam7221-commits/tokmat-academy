import { NextResponse } from "next/server";
import { pool, initDb } from "@/lib/db";
import { getUserFromRequest } from "../auth/route";

const MASTER_ADMIN = "maasum1231@gmail.com";

async function requireAdmin(req: Request): Promise<{ ok: boolean; user?: any }> {
  try {
    // Multi-cookie safe: sob tokmat_session cookie check kore first valid token nibe
    const user = await getUserFromRequest(req);
    if (!user || user.role !== "admin") return { ok: false };
    return { ok: true, user };
  } catch {
    return { ok: false };
  }
}

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    await initDb();
    // Admin ra sobar opore, tarpor baki user ra (notun age)
    const res = await pool.query(
      `SELECT id, first_name, last_name, email, role, plan, status, balance, created_at, last_login
       FROM users
       ORDER BY CASE WHEN role = 'admin' THEN 0 ELSE 1 END, created_at DESC
       LIMIT 500`
    );
    const users = res.rows.map((u: any) => ({
      id: u.id,
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email,
      role: u.role,
      plan: u.plan,
      status: u.status,
      balance: Number(u.balance),
      joined: u.created_at,
      lastLogin: u.last_login,
    }));
    return NextResponse.json({ ok: true, users, total: users.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}

// Suspend / Activate user
export async function PATCH(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ ok: false, error: "userId required" }, { status: 400 });
    await initDb();
    const targetRes = await pool.query(`SELECT id, email, role FROM users WHERE id = $1`, [userId]);
    const target = targetRes.rows[0];
    if (!target) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    const isMasterRequester = auth.user.email.toLowerCase() === MASTER_ADMIN;
    const isMasterTarget = target.email.toLowerCase() === MASTER_ADMIN;
    // Master ke keu suspend korte parbe na
    if (isMasterTarget) return NextResponse.json({ ok: false, error: "Cannot suspend master admin" }, { status: 403 });
    // Co-admin ra onno admin ke suspend korte parbe na, sudhu user ke
    if (!isMasterRequester && target.role === "admin") {
      return NextResponse.json({ ok: false, error: "Only master can suspend admins" }, { status: 403 });
    }
    // Toggle status
    await pool.query(
      `UPDATE users SET status = CASE WHEN status = 'Active' THEN 'Suspended' ELSE 'Active' END WHERE id = $1`,
      [userId]
    );
    // Suspended user er session revoke kori
    await pool.query(
      `DELETE FROM sessions WHERE user_id = $1`,
      [userId]
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
