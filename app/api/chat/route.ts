import { NextResponse } from "next/server";
import { pool, initDb } from "@/lib/db";
import { getUserFromRequest } from "../auth/route";

// ===== Live Chat API =====
// Website theke user/guest ra admin er sathe real-time chat korbe.
// Admin panel er "Live Chat" section theke admin reply dibe.
// Telegram link alada — FloatingChat widget er niche "Or continue on Telegram" diye jay.
//
// GET  ?threads=1                       → (admin) sob thread list + unread count
// GET  ?admin=1&userId= / &guestId=     → (admin) thread er messages + user msgs read mark
// GET  ?guestId=xxx                     → (user/guest) nijer messages + admin msgs read mark
// POST { message, guestId, name? }      → (user/guest) message pathano
// POST { adminReply: true, userId|guestId, message } → (admin) reply
// DELETE ?userId= / ?guestId=           → (admin) thread delete

export const dynamic = "force-dynamic";

async function ensureTable() {
  await initDb();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      sender_type TEXT NOT NULL,              -- 'user' | 'admin'
      sender_name TEXT NOT NULL DEFAULT '',
      user_id INTEGER,                        -- logged-in user (NULL = guest)
      guest_id TEXT NOT NULL DEFAULT '',      -- browser id (login er por merge hoye jay)
      message TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,     -- admin ki dekheche
      user_read BOOLEAN NOT NULL DEFAULT FALSE,   -- user ki dekheche (admin reply)
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_user_id ON chat_messages(user_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_guest_id ON chat_messages(guest_id)`);
}

// Auto "wait" reply — thread er prothom message e sathe sathe ekbari jabe
const AUTO_WAIT_REPLY =
  "Hi! 👋 Thanks for reaching out. Your message has been received — our team will reply here shortly. Please wait a moment. 🙏";

// Rate limit: per thread 10 min e max 15 ta message (spam guard)
const chatRate = new Map<string, { count: number; resetAt: number }>();
const RATE_MAX = 15;
const RATE_WINDOW = 10 * 60 * 1000;

function rateLimited(key: string): boolean {
  const e = chatRate.get(key);
  if (!e) return false;
  if (Date.now() > e.resetAt) {
    chatRate.delete(key);
    return false;
  }
  return e.count >= RATE_MAX;
}
function recordSend(key: string): void {
  const e = chatRate.get(key);
  if (!e || Date.now() > e.resetAt) chatRate.set(key, { count: 1, resetAt: Date.now() + RATE_WINDOW });
  else e.count++;
}

// Guest history ke logged-in user er sathe merge (login er por purono chat na haariye jay)
async function mergeGuestHistory(userId: number, guestId: string): Promise<void> {
  if (!guestId) return;
  await pool.query(
    `UPDATE chat_messages SET user_id = $1, guest_id = '' WHERE guest_id = $2 AND user_id IS NULL`,
    [userId, guestId]
  );
}

export async function GET(req: Request) {
  try {
    await ensureTable();
    const { searchParams } = new URL(req.url);
    const user = await getUserFromRequest(req);
    const guestId = (searchParams.get("guestId") || "").trim().slice(0, 64);

    // ===== ADMIN: thread list =====
    if (searchParams.get("threads")) {
      if (!user || user.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      }
      const res = await pool.query(`
        WITH t AS (
          SELECT COALESCE(user_id::text, NULLIF(guest_id, '')) AS thread_key,
                 MAX(user_id) AS user_id,
                 MAX(guest_id) AS guest_id,
                 MAX(id) AS last_id,
                 MAX(created_at) AS last_at,
                 COUNT(*) FILTER (WHERE sender_type = 'user' AND NOT is_read) AS admin_unread
          FROM chat_messages
          WHERE user_id IS NOT NULL OR guest_id <> ''
          GROUP BY 1
        )
        SELECT t.thread_key, t.user_id, t.guest_id, t.last_id, t.last_at, t.admin_unread,
               m.message AS last_message, m.sender_type AS last_sender,
               u.first_name, u.last_name, u.email,
               COALESCE((
                 SELECT cm.sender_name FROM chat_messages cm
                 WHERE cm.sender_type = 'user'
                   AND ((t.user_id IS NOT NULL AND cm.user_id = t.user_id)
                     OR (t.user_id IS NULL AND cm.guest_id = t.guest_id AND cm.user_id IS NULL))
                 ORDER BY cm.id DESC LIMIT 1
               ), '') AS latest_name
        FROM t
        JOIN chat_messages m ON m.id = t.last_id
        LEFT JOIN users u ON u.id = t.user_id
        ORDER BY t.last_at DESC
        LIMIT 200
      `);
      const threads = res.rows.map((r: any) => ({
        threadKey: r.thread_key,
        userId: r.user_id,
        guestId: r.user_id ? "" : r.guest_id,
        name: r.user_id
          ? `${r.first_name || ""} ${r.last_name || ""}`.trim() || r.email
          : r.latest_name || `Guest #${String(r.guest_id || "").slice(0, 6)}`,
        email: r.email || "",
        lastMessage: r.last_message || "",
        lastSender: r.last_sender,
        lastAt: r.last_at,
        adminUnread: Number(r.admin_unread) || 0,
      }));
      return NextResponse.json(
        { ok: true, threads },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // ===== ADMIN: thread er messages (open korlei user msgs read mark) =====
    if (searchParams.get("admin")) {
      if (!user || user.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      }
      const userId = Number(searchParams.get("userId") || 0);
      const cond = userId > 0 ? `user_id = $1` : `guest_id = $1 AND user_id IS NULL`;
      const val: any = userId > 0 ? userId : guestId;
      if (!val) return NextResponse.json({ ok: true, messages: [] });
      await pool.query(`UPDATE chat_messages SET is_read = TRUE WHERE sender_type = 'user' AND ${cond}`, [val]);
      const res = await pool.query(
        `SELECT id, sender_type, sender_name, message, user_read, created_at
         FROM chat_messages WHERE ${cond} ORDER BY id ASC LIMIT 500`,
        [val]
      );
      return NextResponse.json({ ok: true, messages: res.rows }, { headers: { "Cache-Control": "no-store" } });
    }

    // ===== USER / GUEST: nijer messages =====
    let rows: any[] = [];
    let unread = 0;
    if (user) {
      // Login thakle guest history merge + admin replies read mark
      await mergeGuestHistory(user.id, guestId);
      const u = await pool.query(
        `SELECT COUNT(*)::int AS c FROM chat_messages
         WHERE sender_type = 'admin' AND NOT user_read
           AND (user_id = $1 OR (guest_id = $2 AND user_id IS NULL))`,
        [user.id, guestId]
      );
      unread = u.rows[0]?.c || 0;
      await pool.query(
        `UPDATE chat_messages SET user_read = TRUE
         WHERE sender_type = 'admin' AND NOT user_read
           AND (user_id = $1 OR (guest_id = $2 AND user_id IS NULL))`,
        [user.id, guestId]
      );
      const res = await pool.query(
        `SELECT id, sender_type, sender_name, message, created_at
         FROM chat_messages
         WHERE user_id = $1 OR (guest_id = $2 AND user_id IS NULL)
         ORDER BY id ASC LIMIT 300`,
        [user.id, guestId]
      );
      rows = res.rows;
    } else if (guestId) {
      const u = await pool.query(
        `SELECT COUNT(*)::int AS c FROM chat_messages
         WHERE sender_type = 'admin' AND NOT user_read AND guest_id = $1 AND user_id IS NULL`,
        [guestId]
      );
      unread = u.rows[0]?.c || 0;
      await pool.query(
        `UPDATE chat_messages SET user_read = TRUE
         WHERE sender_type = 'admin' AND NOT user_read AND guest_id = $1 AND user_id IS NULL`,
        [guestId]
      );
      const res = await pool.query(
        `SELECT id, sender_type, sender_name, message, created_at
         FROM chat_messages WHERE guest_id = $1 AND user_id IS NULL
         ORDER BY id ASC LIMIT 300`,
        [guestId]
      );
      rows = res.rows;
    }

    return NextResponse.json(
      { ok: true, messages: rows, unread },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error("chat GET error:", e);
    return NextResponse.json({ ok: false, error: "Failed to load chat" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureTable();
    const body = await req.json();
    const message = String(body.message || "").trim();
    if (!message) return NextResponse.json({ ok: false, error: "Message required" }, { status: 400 });
    if (message.length > 2000) return NextResponse.json({ ok: false, error: "Message too long (max 2000)" }, { status: 400 });

    const user = await getUserFromRequest(req);

    // ===== ADMIN reply =====
    if (body.adminReply) {
      if (!user || user.role !== "admin") {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
      }
      const userId = Number(body.userId) || 0;
      const guestId = String(body.guestId || "").trim().slice(0, 64);
      if (!userId && !guestId) {
        return NextResponse.json({ ok: false, error: "userId or guestId required" }, { status: 400 });
      }
      const res = await pool.query(
        `INSERT INTO chat_messages (sender_type, sender_name, user_id, guest_id, message)
         VALUES ('admin', $1, $2, $3, $4) RETURNING id`,
        [(user.first_name || "Admin").trim(), userId || null, userId ? "" : guestId, message]
      );
      return NextResponse.json({ ok: true, id: res.rows[0].id });
    }

    // ===== USER / GUEST message =====
    const guestId = String(body.guestId || "").trim().slice(0, 64);
    if (!user && !guestId) {
      return NextResponse.json({ ok: false, error: "guestId required" }, { status: 400 });
    }
    if (user) await mergeGuestHistory(user.id, guestId);

    const rateKey = user ? `u:${user.id}` : `g:${guestId}`;
    if (rateLimited(rateKey)) {
      return NextResponse.json({ ok: false, error: "Too many messages. Try again later." }, { status: 429 });
    }
    recordSend(rateKey);

    const senderName = user
      ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
      : String(body.name || "").trim().slice(0, 60);

    const res = await pool.query(
      `INSERT INTO chat_messages (sender_type, sender_name, user_id, guest_id, message)
       VALUES ('user', $1, $2, $3, $4) RETURNING id`,
      [senderName, user ? user.id : null, user ? "" : guestId, message]
    );

    // Prottek message e auto wait reply — user jeno kono din "reply ashe nai" na bhabe
    await pool.query(
      `INSERT INTO chat_messages (sender_type, sender_name, user_id, guest_id, message)
       VALUES ('admin', 'Support', $1, $2, $3)`,
      [user ? user.id : null, user ? "" : guestId, AUTO_WAIT_REPLY]
    );

    return NextResponse.json({ ok: true, id: res.rows[0].id });
  } catch (e) {
    console.error("chat POST error:", e);
    return NextResponse.json({ ok: false, error: "Failed to send message" }, { status: 500 });
  }
}

// Admin: thread delete (spam/bot thread clean)
export async function DELETE(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    await ensureTable();
    const { searchParams } = new URL(req.url);
    const userId = Number(searchParams.get("userId") || 0);
    const guestId = (searchParams.get("guestId") || "").trim().slice(0, 64);
    if (userId > 0) {
      await pool.query(`DELETE FROM chat_messages WHERE user_id = $1`, [userId]);
    } else if (guestId) {
      await pool.query(`DELETE FROM chat_messages WHERE guest_id = $1 AND user_id IS NULL`, [guestId]);
    } else {
      return NextResponse.json({ ok: false, error: "userId or guestId required" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("chat DELETE error:", e);
    return NextResponse.json({ ok: false, error: "Failed to delete thread" }, { status: 500 });
  }
}
