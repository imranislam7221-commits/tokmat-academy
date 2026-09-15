import { NextResponse } from "next/server";
import crypto from "crypto";
import { pool, initDb, toSafeUser, type DbUser } from "@/lib/db";
import bcrypt from "bcryptjs";

const ADMIN_EMAILS = ["maasum1231@gmail.com"];

// Session cookie options
const COOKIE_NAME = "tokmat_session";
const SESSION_DAYS = 7;

function makeToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function sessionExpiry(): Date {
  return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
}

// Secure flag sudhu tokhon e set hobe jokhon request actually HTTPS asche.
// Na hole http://VPS_IP e login cookie browser set-i korbe na.
function isHttps(req: Request): boolean {
  const proto = req.headers.get("x-forwarded-proto") || "";
  if (proto) return proto.split(",")[0].trim() === "https";
  try {
    return new URL(req.url).protocol === "https:";
  } catch {
    return false;
  }
}

function cookieHeader(token: string, expires: Date, req: Request): string {
  const secure = isHttps(req) ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires.toUTCString()}${secure}`;
}

function clearCookieHeader(req: Request): string {
  const secure = isHttps(req) ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

async function getUserByToken(token: string): Promise<DbUser | null> {
  if (!token) return null;
  await initDb();
  const res = await pool.query(
    `SELECT u.* FROM users u
     JOIN sessions s ON s.user_id = u.id
     WHERE s.token = $1 AND s.expires_at > NOW()`,
    [token]
  );
  return res.rows[0] || null;
}

export { getUserByToken, COOKIE_NAME };

export async function POST(req: Request) {
  try {
    const { action, firstName, lastName, email, password } = await req.json();

    const emailNorm = email ? String(email).trim().toLowerCase() : "";

    await initDb();

    // ===== GOOGLE LOGIN (Gmail) - save to DB =====
    if (action === "google") {
      if (!emailNorm || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
        return NextResponse.json({ ok: false, error: "Invalid Google email" }, { status: 400 });
      }
      // Find existing or create new Google user
      let userRes = await pool.query(`SELECT * FROM users WHERE email = $1`, [emailNorm]);
      let user = userRes.rows[0] as DbUser | undefined;
      if (user) {
        if (user.status === "Suspended") {
          return NextResponse.json({ ok: false, error: "Your account has been suspended. Contact support." }, { status: 403 });
        }
        if (ADMIN_EMAILS.includes(emailNorm) && user.role !== "admin") {
          await pool.query(`UPDATE users SET role = 'admin' WHERE id = $1`, [user.id]);
          user.role = "admin";
        }
        await pool.query(`UPDATE users SET last_login = NOW() WHERE id = $1`, [user.id]);
        // Update name if missing
        if ((!user.first_name || user.first_name === "User") && firstName) {
          await pool.query(`UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3`, [String(firstName).trim(), String(lastName||"").trim(), user.id]);
          user.first_name = String(firstName).trim();
          user.last_name = String(lastName||"").trim();
        }
      } else {
        const role = ADMIN_EMAILS.includes(emailNorm) ? "admin" : "user";
        const dummyHash = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);
        const fn = String(firstName||"").trim() || emailNorm.split("@")[0];
        const ln = String(lastName||"").trim();
        const ins = await pool.query(
          `INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [fn, ln, emailNorm, dummyHash, role]
        );
        user = ins.rows[0] as DbUser;
      }
      const token = makeToken();
      const expires = sessionExpiry();
      await pool.query(`INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)`, [token, user!.id, expires]);
      const safe = toSafeUser(user!);
      return NextResponse.json({ ok: true, user: safe, redirect: safe.role === "admin" ? "/admin" : "/dashboard" }, { headers: { "Set-Cookie": cookieHeader(token, expires, req) } });
    }

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Email and password required" }, { status: 400 });
    }

    // ===== REGISTER =====
    if (action === "register") {
      if (!firstName || !firstName.trim()) {
        return NextResponse.json({ ok: false, error: "First name is required" }, { status: 400 });
      }
      if (String(password).length < 6) {
        return NextResponse.json({ ok: false, error: "Password must be at least 6 characters" }, { status: 400 });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
        return NextResponse.json({ ok: false, error: "Invalid email address" }, { status: 400 });
      }

      // Check duplicate
      const dupe = await pool.query(`SELECT id FROM users WHERE email = $1`, [emailNorm]);
      if (dupe.rows.length > 0) {
        return NextResponse.json({ ok: false, error: "An account with this email already exists. Please login." }, { status: 409 });
      }

      const hash = await bcrypt.hash(String(password), 10);
      const role = ADMIN_EMAILS.includes(emailNorm) ? "admin" : "user";

      const res = await pool.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [firstName.trim(), (lastName || "").trim(), emailNorm, hash, role]
      );
      const user = res.rows[0] as DbUser;

      // Create session
      const token = makeToken();
      const expires = sessionExpiry();
      await pool.query(
        `INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)`,
        [token, user.id, expires]
      );

      const safe = toSafeUser(user);
      return NextResponse.json({
        ok: true,
        user: safe,
        redirect: role === "admin" ? "/admin" : "/dashboard",
      }, { headers: { "Set-Cookie": cookieHeader(token, expires, req) } });
    }

    // ===== LOGIN =====
    if (action === "login") {
      const res = await pool.query(`SELECT * FROM users WHERE email = $1`, [emailNorm]);
      let user = res.rows[0] as DbUser | undefined;

      if (!user || !(await bcrypt.compare(String(password), user.password_hash))) {
        return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
      }
      if (user.status === "Suspended") {
        return NextResponse.json({ ok: false, error: "Your account has been suspended. Contact support." }, { status: 403 });
      }

      // Keep master admin login working even if DB row was deleted
      if (ADMIN_EMAILS.includes(emailNorm) && user.role !== "admin") {
        await pool.query(`UPDATE users SET role = 'admin' WHERE id = $1`, [user.id]);
        user.role = "admin";
      }

      // Update last_login
      await pool.query(`UPDATE users SET last_login = NOW() WHERE id = $1`, [user.id]);

      // Create session
      const token = makeToken();
      const expires = sessionExpiry();
      await pool.query(
        `INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)`,
        [token, user.id, expires]
      );

      const safe = toSafeUser(user);
      return NextResponse.json({
        ok: true,
        user: safe,
        redirect: safe.role === "admin" ? "/admin" : "/dashboard",
      }, { headers: { "Set-Cookie": cookieHeader(token, expires, req) } });
    }

    // ===== LOGOUT =====
    if (action === "logout") {
      const cookie = req.headers.get("cookie") || "";
      const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
      if (match) {
        const token = match[1];
        // Always delete the exact token, even if getUserByToken fails
        try {
          const u = await getUserByToken(token);
          if (u) await pool.query(`DELETE FROM sessions WHERE user_id = $1`, [u.id]);
        } catch {}
        await pool.query(`DELETE FROM sessions WHERE token = $1`, [token]).catch(() => {});
      }
      // Clear cookie for both Secure and non-Secure to avoid https/http mismatch — browser needs exact attributes
      const clearSecure = `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure`;
      const clearPlain = `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      const res = NextResponse.json({ ok: true });
      res.headers.append("Set-Cookie", clearSecure);
      res.headers.append("Set-Cookie", clearPlain);
      // Also append the dynamic one (covers current proto)
      res.headers.append("Set-Cookie", clearCookieHeader(req));
      return res;
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    // Database not configured yet
    if (String(e?.message || "").includes("DATABASE_URL") || e?.code === "ECONNREFUSED" || String(e?.code || "") === "ETIMEDOUT") {
      return NextResponse.json({ ok: false, error: "Database not connected. Add DATABASE_URL in .env.local (see DEPLOY-HOSTINGER.md)" }, { status: 500 });
    }
    return NextResponse.json({ ok: false, error: "Server error: " + String(e?.message || e) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Return current logged-in user
  try {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (!match) return NextResponse.json({ ok: true, user: null });

    const user = await getUserByToken(match[1]);
    if (!user) return NextResponse.json({ ok: true, user: null });

    return NextResponse.json({ ok: true, user: toSafeUser(user) });
  } catch {
    return NextResponse.json({ ok: true, user: null });
  }
}
