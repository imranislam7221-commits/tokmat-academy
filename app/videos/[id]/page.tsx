"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useTheme } from "@/components/ThemeProvider"
import { t as translate, type Locale } from "@/lib/translations"

// Videos list page er sathe same data
const allVideos = [
  { id: 1, title: "Forex Basics", desc: "Learn the fundamentals of forex trading.", lessons: 5, dur: "12:30", price: "$5", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=220&fit=crop" },
  { id: 2, title: "Technical Analysis", desc: "Master chart patterns and indicators.", lessons: 8, dur: "18:45", price: "$8", img: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=220&fit=crop" },
  { id: 3, title: "Risk Management", desc: "Protect your capital with proven strategies.", lessons: 4, dur: "09:20", price: "$5", img: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=400&h=220&fit=crop" },
  { id: 4, title: "Advanced Strategies", desc: "Professional strategies used by funded traders.", lessons: 10, dur: "22:10", price: "$12", img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=220&fit=crop" },
  { id: 5, title: "Price Action", desc: "Read charts like institutional traders.", lessons: 6, dur: "15:40", price: "$8", img: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=400&h=220&fit=crop" },
  { id: 6, title: "Trading Psychology", desc: "Master emotions and build a winning mindset.", lessons: 4, dur: "10:15", price: "$5", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=220&fit=crop" },
  { id: 7, title: "Chart Patterns", desc: "Recognize powerful chart formations early.", lessons: 7, dur: "20:05", price: "$10", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=220&fit=crop" },
  { id: 8, title: "Market News Analysis", desc: "Understand how news moves the markets.", lessons: 5, dur: "14:25", price: "$6", img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=220&fit=crop" },
  { id: 9, title: "Support & Resistance", desc: "Identify key levels for entries and exits.", lessons: 6, dur: "17:30", price: "$8", img: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=400&h=220&fit=crop" },
  { id: 10, title: "Candlestick Mastery", desc: "Read price action with candlestick patterns.", lessons: 8, dur: "25:15", price: "$10", img: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=220&fit=crop" },
  { id: 11, title: "Fibonacci Trading", desc: "Use Fibonacci retracements like a pro.", lessons: 5, dur: "13:45", price: "$7", img: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=400&h=220&fit=crop" },
  { id: 12, title: "Forex Fundamentals", desc: "Master the economic calendar and news trading.", lessons: 7, dur: "19:50", price: "$9", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=220&fit=crop" },
]

export default function VideoDetailPage() {
  const params = useParams()
  const videoId = String(params?.id || "")
  const video = allVideos.find((v) => String(v.id) === videoId)

  const [locale, setLocale] = useState<Locale>("en")
  useEffect(() => { const p = new URLSearchParams(window.location.search); setLocale((p.get("locale") || "en") as Locale); }, [])
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const t = (key: string) => translate(locale, key)

  const [authState, setAuthState] = useState<"loading" | "ok" | "denied">("loading")
  const [activeLesson, setActiveLesson] = useState(1)

  // Guard: video approved na hole access nai
  useEffect(() => {
    fetch("/api/video-requests", { cache: "no-store", credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (!j.ok) { setAuthState("denied"); return; }
        const req = (j.requests || []).find((r: any) => String(r.video_id) === videoId);
        setAuthState(req?.status === "approved" ? "ok" : "denied");
      })
      .catch(() => setAuthState("denied"))
  }, [videoId])

  if (!video) {
    return (
      <main className={`min-h-screen flex items-center justify-center ${isDark ? "bg-dark-950" : "bg-gray-50"}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Video not found</h1>
          <Link href="/videos" className="text-blue-600 hover:text-blue-700 font-semibold">← Back to Videos</Link>
        </div>
      </main>
    )
  }

  if (authState === "loading") {
    return (
      <main className={`min-h-screen flex items-center justify-center ${isDark ? "bg-dark-950" : "bg-gray-50"}`}>
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </main>
    )
  }

  if (authState === "denied") {
    return (
      <main className={`min-h-screen flex items-center justify-center px-4 ${isDark ? "bg-dark-950" : "bg-gray-50"}`}>
        <div className={`max-w-md w-full text-center rounded-2xl p-8 border ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"}`}>
          <div className="text-5xl mb-4">🔒</div>
          <h1 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{t("videoLockedTitle") || "Video Locked"}</h1>
          <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {t("videoLockedDesc") || "Ei video ta dekhte hole age request approve korte hobe."}
          </p>
          <Link href="/videos" className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors">
            {t("backToVideos") || "Back to Videos"}
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-dark-950" : "bg-gray-50"}`}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link href="/videos" className={`text-sm font-medium mb-4 inline-block ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
          ← {t("backToVideos") || "Back to Videos"}
        </Link>

        {/* Player — sample/mock video (pore nijer video URL boshano jabe) */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black mb-6 shadow-2xl">
          <video
            key={activeLesson}
            className="w-full h-full"
            controls
            autoPlay
            poster={video.img}
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
          />
        </div>

        {/* Info */}
        <h1 className={`text-2xl md:text-3xl font-extrabold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{video.title}</h1>
        <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{video.desc}</p>

        <div className={`rounded-2xl border p-6 ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"}`}>
          <h2 className={`font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Lessons</h2>
          <div className="space-y-2">
            {Array.from({ length: video.lessons }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveLesson(i + 1)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                  activeLesson === i + 1
                    ? "bg-purple-600/20 border border-purple-500/50"
                    : isDark ? "bg-dark-700 hover:bg-dark-600" : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Lesson {i + 1}: {video.title} — Part {i + 1}
                </span>
                {activeLesson === i + 1 && <span className="ml-auto text-xs font-bold text-purple-400">▶ Playing</span>}
                {activeLesson !== i + 1 && <span className={`ml-auto text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{video.dur}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
