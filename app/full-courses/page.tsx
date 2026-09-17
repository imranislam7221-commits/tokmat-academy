"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "@/components/ThemeProvider"
import { t as translate, type Locale } from "@/lib/translations"

// Demo courses — preview content (translated via fcCourse* keys)
const demoCourses = [
  { id: 1, title: "Forex Basics", dur: "12:30", lessons: 5, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=640&h=360&fit=crop", descKey: "fcCourse1" },
  { id: 2, title: "Technical Analysis", dur: "18:45", lessons: 8, img: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=640&h=360&fit=crop", descKey: "fcCourse2" },
  { id: 3, title: "Risk Management", dur: "09:20", lessons: 4, img: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=640&h=360&fit=crop", descKey: "fcCourse3" },
  { id: 4, title: "Advanced Strategies", dur: "22:10", lessons: 10, img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=640&h=360&fit=crop", descKey: "fcCourse4" },
  { id: 5, title: "Price Action", dur: "15:40", lessons: 6, img: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=640&h=360&fit=crop", descKey: "fcCourse5" },
  { id: 6, title: "Trading Psychology", dur: "10:15", lessons: 4, img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=640&h=360&fit=crop", descKey: "fcCourse6" },
]

export default function FullCoursesPage() {
  const [locale, setLocale] = useState<Locale>("en")
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const t = (key: string) => translate(locale, key)
  const [playing, setPlaying] = useState<number | null>(null)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    setLocale((p.get("locale") || "en") as Locale)
  }, [])

  return (
    <main className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-dark-950" : "bg-gray-50"}`}>
      {/* Hero strip */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 px-4 py-12 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">🎓 {t("fcTitle")}</h1>
        <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto">{t("fcSubtitle")}</p>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        {playing !== null ? (
          (() => {
            const v = demoCourses.find((c) => c.id === playing)!
            return (
              <div>
                <button onClick={() => setPlaying(null)} className="text-blue-500 hover:text-blue-400 text-sm font-semibold mb-4">
                  {t("fcBack")}
                </button>
                {/* Mock video player */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black mb-6 shadow-2xl">
                  <Image src={v.img} alt={v.title} fill className="object-cover opacity-40" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-3 animate-pulse">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                    <p className="font-bold text-lg">{v.title} — {t("fcPlaying")}</p>
                    <p className="text-xs text-white/60 mt-1">{v.dur} • {v.lessons} {t("fcLessons")}</p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
                    <div className="h-full w-1/3 bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                  </div>
                </div>
                <h2 className={`text-2xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>{v.title}</h2>
                <p className={`mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{t(v.descKey)}</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link href={`/register?locale=${locale}`} className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
                    🚀 {t("fcRegisterCta")}
                  </Link>
                  <Link href={`/videos?locale=${locale}`} className="flex-1 text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors">
                    {t("fcAllVideos")} →
                  </Link>
                </div>
              </div>
            )
          })()
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoCourses.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setPlaying(v.id)}
                  className={`group text-left rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl ${
                    isDark ? "bg-dark-800 border-dark-700 hover:border-blue-500/50" : "bg-white border-gray-100 hover:border-blue-300"
                  }`}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <Image src={v.img} alt={v.title} width={640} height={360} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">{v.dur}</span>
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">{t("fcPreview")}</span>
                  </div>
                  <div className="p-4">
                    <div className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{v.title}</div>
                    <div className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{t(v.descKey)}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className={`mt-8 text-center rounded-2xl p-5 border ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"}`}>
              <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>{t("fcPreviewNote")}</p>
              <Link href={`/register?locale=${locale}`} className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-colors">
                🚀 {t("fcRegisterCta")}
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
