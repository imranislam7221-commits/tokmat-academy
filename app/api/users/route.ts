import { NextResponse } from "next/server";
import { pool, initDb } from "@/lib/db";
import { getUserByToken, COOKIE_NAME } from "../auth/route";

async function requireAdmin(req: Request): Promise<boolean> {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;
  try {
    const user = await getUserByToken(match[1]);
    return !!user && user.role === "admin";
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    await initDb();
    const res = await pool.query(
      `SELECT id, first_name, last_name, email, role, plan, status, balance, created_at, last_login
       FROM users ORDER BY created_at DESC LIMIT 500`
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
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ ok: false, error: "userId required" }, { status: 400 });
    await initDb();
    // Toggle status
    await pool.query(
      `UPDATE users SET status = CASE WHEN status = 'Active' THEN 'Suspended' ELSE 'Active' END WHERE id = $1 AND role != 'admin'`,
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
