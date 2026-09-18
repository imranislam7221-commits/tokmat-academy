import { NextResponse } from "next/server";
import { pool, initDb } from "@/lib/db";
import { getUserFromRequest } from "../auth/route";

// Personalized response (video_url access user onujayi alada) — kokhono cache hobe na
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Video management — admin panel theke full control.
// GET (public): video list — videos page + detail page ei API theke load hoy
// POST/PATCH/DELETE: sudhu admin

async function ensureTable() {
  await initDb();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS videos (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      lessons INTEGER NOT NULL DEFAULT 1,
      dur TEXT NOT NULL DEFAULT '',
      price TEXT NOT NULL DEFAULT '$5',
      img TEXT NOT NULL DEFAULT '',
      video_url TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

// 12 ta default video — first load e ekbar auto-seed hoy
const DEFAULT_VIDEOS = [
  { title: "Forex Basics", desc: "Learn the fundamentals of forex trading.", lessons: 5, dur: "12:30", price: "$5", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=220&fit=crop", video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
  { title: "Technical Analysis", desc: "Master chart patterns and indicators.", lessons: 8, dur: "18:45", price: "$8", img: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=220&fit=crop", video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
  { title: "Risk Management", desc: "Protect your capital with proven strategies.", lessons: 4, dur: "09:20", price: "$5", img: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=400&h=220&fit=crop", video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
  { title: "Advanced Strategies", desc: "Professional strategies used by funded traders.", lessons: 10, dur: "22:10", price: "$12", img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=220&fit=crop", video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
  { title: "Price Action", desc: "Read charts like institutional traders.", lessons: 6, dur: "15:40", price: "$8", img: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=400&h=220&fit=crop", video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
  { title: "Trading Psychology", desc: "Master emotions and build a winning mindset.", lessons: 4, dur: "10:15", price: "$5", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=220&fit=crop", video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
  { title: "Chart Patterns", desc: "Recognize powerful chart formations early.", lessons: 7, dur: "20:05", price: "$10", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=220&fit=crop", video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
  { title: "Market News Analysis", desc: "Understand how news moves the markets.", lessons: 5, dur: "14:25", price: "$6", img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=220&fit=crop", video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
  { title: "Support & Resistance", desc: "Identify key levels for entries and exits.", lessons: 6, dur: "17:30", price: "$8", img: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=400&h=220&fit=crop", video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
  { title: "Candlestick Mastery", desc: "Read price action with candlestick patterns.", lessons: 8, dur: "25:15", price: "$10", img: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=220&fit=crop", video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
  { title: "Fibonacci Trading", desc: "Use Fibonacci retracements like a pro.", lessons: 5, dur: "13:45", price: "$7", img: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=400&h=220&fit=crop", video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
  { title: "Forex Fundamentals", desc: "Master the economic calendar and news trading.", lessons: 7, dur: "19:50", price: "$9", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=220&fit=crop", video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
];

export async function GET(req: Request) {
  try {
    await ensureTable();
    const count = await pool.query(`SELECT COUNT(*)::int AS c FROM videos`);
    if (count.rows[0].c === 0) {
      // seed with sort order
      for (let i = 0; i < DEFAULT_VIDEOS.length; i++) {
        const v = DEFAULT_VIDEOS[i];
        await pool.query(
          `INSERT INTO videos (title, description, lessons, dur, price, img, video_url, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [v.title, v.desc, v.lessons, v.dur, v.price, v.img, v.video_url, i]
        );
      }
    }
    const res = await pool.query(`SELECT id, title, description, lessons, dur, price, img, video_url, sort_order FROM videos ORDER BY sort_order ASC, id ASC`);

    // SECURITY: video_url sudhu authorized viewer ke dekhay —
    // admin (sob), full_access approved user (sob), ba je video tar request approved (oi video ta).
    // Guest/unauthorized user video list dekhbe kintu URL thakbe na (payment bypass block).
    let user: any = null;
    try { user = await getUserFromRequest(req); } catch {}
    let allAllowed = !!user && user.role === "admin";
    let allowedIds = new Set<string>();
    if (user && !allAllowed) {
      try {
        const reqRes = await pool.query(`SELECT video_id FROM video_requests WHERE user_id=$1 AND status='approved'`, [user.id]);
        if (reqRes.rows.some((r: any) => r.video_id === "full_access")) {
          allAllowed = true;
        } else {
          for (const r of reqRes.rows) allowedIds.add(String(r.video_id));
        }
      } catch {}
    }
    const videos = res.rows.map((v: any) => {
      if (allAllowed || allowedIds.has(String(v.id))) return v;
      const { video_url, ...safe } = v;
      return safe;
    });
    return NextResponse.json({ ok: true, videos }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } });
  } catch (e) {
    console.error("videos GET error:", e);
    return NextResponse.json({ ok: false, error: "Failed to load videos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized — admin only" }, { status: 401 });
  }
  try {
    await ensureTable();
    const body_ = await req.json();
    // frontend "desc" pathay — DB column "description"
    const { title, desc, description, lessons, dur, price, img, video_url, sort_order } = body_;
    if (!title) return NextResponse.json({ ok: false, error: "Title required" }, { status: 400 });
    const descVal = description ?? desc ?? "";
    const maxRes = await pool.query(`SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM videos`);
    const res = await pool.query(
      `INSERT INTO videos (title, description, lessons, dur, price, img, video_url, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, descVal, Number(lessons) || 1, dur || "", price || "$5", img || "", video_url || "", sort_order ?? maxRes.rows[0].next]
    );
    return NextResponse.json({ ok: true, video: res.rows[0] });
  } catch (e) {
    console.error("videos POST error:", e);
    return NextResponse.json({ ok: false, error: "Failed to create video" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized — admin only" }, { status: 401 });
  }
  try {
    await ensureTable();
    const body = await req.json();
    const { id, ...fields } = body;
    if (!id) return NextResponse.json({ ok: false, error: "Video id required" }, { status: 400 });
    // frontend "desc" pathay — DB column "description"
    if ("desc" in fields) { fields.description = fields.desc; delete fields.desc; }
    const allowed = ["title", "description", "lessons", "dur", "price", "img", "video_url", "sort_order"];
    const sets: string[] = [];
    const vals: any[] = [];
    let i = 1;
    for (const key of allowed) {
      if (key in fields) {
        sets.push(`${key} = $${i}`);
        vals.push(key === "lessons" || key === "sort_order" ? Number(fields[key]) || 0 : fields[key]);
        i++;
      }
    }
    if (sets.length === 0) return NextResponse.json({ ok: false, error: "Nothing to update" }, { status: 400 });
    vals.push(id);
    const res = await pool.query(`UPDATE videos SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`, vals);
    if (res.rows.length === 0) return NextResponse.json({ ok: false, error: "Video not found" }, { status: 404 });
    return NextResponse.json({ ok: true, video: res.rows[0] });
  } catch (e) {
    console.error("videos PATCH error:", e);
    return NextResponse.json({ ok: false, error: "Failed to update video" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Unauthorized — admin only" }, { status: 401 });
  }
  try {
    await ensureTable();
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) return NextResponse.json({ ok: false, error: "Video id required" }, { status: 400 });
    await pool.query(`DELETE FROM videos WHERE id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("videos DELETE error:", e);
    return NextResponse.json({ ok: false, error: "Failed to delete video" }, { status: 500 });
  }
}
