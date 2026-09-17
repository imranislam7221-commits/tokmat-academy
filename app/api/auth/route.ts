import { NextResponse } from "next/server";
import crypto from "crypto";
import { pool, initDb, toSafeUser, type DbUser } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getMasterAdminEmails } from "@/lib/admin";

const ADMIN_EMAILS = getMasterAdminEmails();

// ===== Login rate limiting (brute-force protection) =====
// Per server instance in-memory map: email+IP -> { count, resetAt }
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000; // 15 minute

function loginKey(req: Request, email: string): string {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  return `${email.toLowerCase()}|${ip}`;
}

function isRateLimited(key: string): boolean {
  const entry = loginAttempts.get(key);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    loginAttempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailedLogin(key: string): void {
  const entry = loginAttempts.get(key);
  if (!entry || Date.now() > entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
  } else {
    entry.count++;
  }
}

function clearLoginAttempts(key: string): void {
  loginAttempts.delete(key);
}

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

// Browser e ek name er ekadhik cookie thakte pare (apex + www, Secure + non-Secure).
// Sob gulo token ber kori — logout sob delete korbe, GET sob check korbe.
function extractAllTokens(cookieHeader: string | null): string[] {
  if (!cookieHeader) return [];
  const tokens: string[] = [];
  const re = new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(cookieHeader)) !== null) {
    if (m[1] && !tokens.includes(m[1])) tokens.push(m[1]);
  }
  return tokens;
}

// FIRST valid token diye user return kori (multi-cookie safe)
async function getUserFromRequest(req: Request): Promise<DbUser | null> {
  const tokens = extractAllTokens(req.headers.get("cookie"));
  for (const token of tokens) {
    const user = await getUserByToken(token);
    if (user) return user;
  }
  return null;
}

// Logout er por auto re-login block: request er sob token REVOKE kori.
// Cookie ja thakuk na ken — DB te session thakle o delete hoye jabe.
async function revokeRequestTokens(req: Request): Promise<void> {
  const tokens = extractAllTokens(req.headers.get("cookie"));
  if (tokens.length === 0) return;
  await initDb();
  await pool.query(`DELETE FROM sessions WHERE token = ANY($1::text[])`, [tokens]);
}

// Sob cookie variant clear kori — raw Set-Cookie headers (Next cookies API
// ek name er jonno sudhu last set ta pathay, tai raw header use kora hoy).
function clearAllCookieVariants(): string[] {
  const expire = "Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0";
  const base = "Path=/; HttpOnly; SameSite=Lax";
  return [
    `${COOKIE_NAME}=; ${base}; ${expire}`, // host-only (current host)
    `${COOKIE_NAME}=; ${base}; ${expire}; Domain=tokmatacademy.online`, // apex domain
    `${COOKIE_NAME}=; ${base}; ${expire}; Domain=www.tokmatacademy.online`, // www
    `${COOKIE_NAME}=; ${base}; ${expire}; Secure`, // https variants
    `${COOKIE_NAME}=; ${base}; ${expire}; Secure; Domain=tokmatacademy.online`,
    `${COOKIE_NAME}=; ${base}; ${expire}; Secure; Domain=www.tokmatacademy.online`,
    `${COOKIE_NAME}=; ${base}; ${expire}; Domain=localhost`, // local dev
  ];
}

export { getUserByToken, getUserFromRequest, revokeRequestTokens, COOKIE_NAME };

export async function POST(req: Request) {
  try {
    const { action, firstName, lastName, email, password } = await req.json();

    const emailNorm = email ? String(email).trim().toLowerCase() : "";

    await initDb();

    // ===== LOGOUT (BULLETPROOF) — email/password check er AGE rakha hoyeche,
    // ===== karon logout request e email/password thake na. Age ei check er
    // ===== pore chilo, tai logout request 400 kheto ar cookie clear hoto na!
    if (action === "logout" || action === "logout2" || action === "force_logout") {
      // 1) Request e je koyekta token ache sob DB theke delete (apex+www duita cookie thakle duitai)
      await revokeRequestTokens(req);
      // 2) User paoa gele tar SOB session revoke (onno device theke o logout hobe)
      try {
        const user = await getUserFromRequest(req);
        if (user) await pool.query(`DELETE FROM sessions WHERE user_id = $1`, [user.id]);
      } catch {}
      // 3) Sob cookie variant clear (host-only, apex, www, Secure/non-Secure, localhost)
      const res = NextResponse.json({ ok: true });
      for (const c of clearAllCookieVariants()) {
        res.headers.append("Set-Cookie", c);
      }
      return res;
    }

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
      // Brute-force protection: 15 min e 8 bar fail korle block
      const rlKey = loginKey(req, emailNorm);
      if (isRateLimited(rlKey)) {
        return NextResponse.json({ ok: false, error: "Too many failed attempts. Try again in 15 minutes." }, { status: 429 });
      }

      const res = await pool.query(`SELECT * FROM users WHERE email = $1`, [emailNorm]);
      let user = res.rows[0] as DbUser | undefined;

      if (!user || !(await bcrypt.compare(String(password), user.password_hash))) {
        recordFailedLogin(rlKey);
        return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
      }
      clearLoginAttempts(rlKey);
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
  // Return current logged-in user - no cache
  // Multi-cookie safe: request e je koyekta tokmat_session cookie ache sob check kori.
  try {
    const user = await getUserFromRequest(req);
    const r = NextResponse.json({ ok: true, user: user ? toSafeUser(user) : null });
    r.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return r;
  } catch {
    const r = NextResponse.json({ ok: true, user: null });
    r.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return r;
  }
}
