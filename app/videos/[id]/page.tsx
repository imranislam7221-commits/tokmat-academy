"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useTheme } from "@/components/ThemeProvider"
import { t as translate, type Locale } from "@/lib/translations"

// Video DB theke load hoy (/api/videos) — admin panel theke manage kora jay

export default function VideoDetailPage() {
  const params = useParams()
  const videoId = String(params?.id || "")
  const [video, setVideo] = useState<any>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)

  const [locale, setLocale] = useState<Locale>("en")
  useEffect(() => { const p = new URLSearchParams(window.location.search); setLocale((p.get("locale") || "en") as Locale); }, [])

  useEffect(() => {
    fetch("/api/videos").then(r=>r.json()).then(j=>{
      const found = (j.videos||[]).find((v:any)=> String(v.id)===videoId)
      setVideo(found || null)
      setVideoLoaded(true)
    }).catch(()=>{ setVideoLoaded(true) })
  }, [videoId])
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const t = (key: string) => translate(locale, key)

  const [authState, setAuthState] = useState<"loading" | "ok" | "denied">("loading")
  const [activeLesson, setActiveLesson] = useState(1)
  const lessonSrc = video?.video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"

  // YouTube link hole embed player, nahole direct video tag
  const ytMatch = lessonSrc?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,20})/)
  const isEmbed = !!ytMatch || /iframe|embed/i.test(lessonSrc || "")

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

  if (!videoLoaded) {
    return (
      <main className={`min-h-screen flex items-center justify-center ${isDark ? "bg-dark-950" : "bg-gray-50"}`}>
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </main>
    )
  }

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

        {/* Player — admin-set video URL (mp4 direct playback, YouTube auto-embed) */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black mb-6 shadow-2xl">
          {ytMatch ? (
            <iframe
              key={`${activeLesson}-${lessonSrc}`}
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              key={`${activeLesson}-${lessonSrc}`}
              className="w-full h-full"
              controls
              autoPlay
              poster={video.img}
              src={lessonSrc}
            />
          )}
        </div>

        {/* Info */}
        <h1 className={`text-2xl md:text-3xl font-extrabold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{video.title}</h1>
        <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{video.description || video.desc}</p>

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
