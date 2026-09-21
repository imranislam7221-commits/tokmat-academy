import { Pool } from "pg";

// Global singleton (survive hot-reload in dev)
const globalForDb = globalThis as unknown as { _tokmatPool?: Pool };

export const pool: Pool =
  globalForDb._tokmatPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost")
      ? { rejectUnauthorized: false }
      : undefined,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") globalForDb._tokmatPool = pool;

// Auto-create users table on first use
let initPromise: Promise<void> | null = null;

export function initDb(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL DEFAULT '',
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          plan TEXT NOT NULL DEFAULT 'Free',
          status TEXT NOT NULL DEFAULT 'Active',
          balance NUMERIC NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_login TIMESTAMPTZ
        )
      `);
      // Migration: country column (testimonial section e real user dekhate use hoy)
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT ''`);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          token TEXT PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at)
      `);
      // Cleanup: expired sessions delete (>7 din purano) — DB clean rakhe
      await pool.query(`DELETE FROM sessions WHERE expires_at < NOW()`);
    })().catch((e) => {
      initPromise = null; // allow retry on next request
      throw e;
    });
  }
  return initPromise;
}

export interface DbUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  role: "admin" | "user";
  plan: string;
  status: string;
  balance: string;
  created_at: string;
  last_login: string | null;
}

// Safe user object (no password) to send to client
export function toSafeUser(u: DbUser) {
  return {
    id: u.id,
    firstName: u.first_name,
    lastName: u.last_name,
    email: u.email,
    role: u.role,
    plan: u.plan,
    status: u.status,
    balance: Number(u.balance),
    joined: u.created_at,
  };
}
