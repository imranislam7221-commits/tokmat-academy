"use client"

import { use, useState } from "react"
import { useTheme } from "@/components/ThemeProvider"
import { t as translate, type Locale } from "@/lib/translations"

const courses = [
  {
    id: 1,
    title: "Forex Basics",
    description: "Learn the fundamentals of forex trading.",
    lessons: 5,
    duration: "2h 30m",
    level: "Beginner",
    free: true,
    color: "from-blue-500 to-blue-600",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=220&fit=crop",
  },
  {
    id: 2,
    title: "Technical Analysis",
    description: "Master chart patterns and indicators.",
    lessons: 8,
    duration: "4h 15m",
    level: "Intermediate",
    free: false,
    color: "from-purple-500 to-purple-600",
    thumbnail: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=220&fit=crop",
  },
  {
    id: 3,
    title: "Risk Management",
    description: "Protect your capital with proven strategies.",
    lessons: 4,
    duration: "1h 45m",
    level: "Beginner",
    free: true,
    color: "from-green-500 to-green-600",
    thumbnail: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=400&h=220&fit=crop",
  },
  {
    id: 4,
    title: "Advanced Strategies",
    description: "Professional strategies used by funded traders.",
    lessons: 10,
    duration: "6h 00m",
    level: "Advanced",
    free: false,
    color: "from-orange-500 to-orange-600",
    thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=220&fit=crop",
  },
  {
    id: 5,
    title: "Price Action",
    description: "Read charts like institutional traders.",
    lessons: 6,
    duration: "3h 30m",
    level: "Intermediate",
    free: false,
    color: "from-pink-500 to-pink-600",
    thumbnail: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=400&h=220&fit=crop",
  },
  {
    id: 6,
    title: "Trading Psychology",
    description: "Master emotions and build a winning mindset.",
    lessons: 4,
    duration: "2h 00m",
    level: "Beginner",
    free: false,
    color: "from-teal-500 to-teal-600",
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=220&fit=crop",
  },
]

export default function EducationPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = use(searchParams)
  const locale = (params?.locale || "en") as Locale
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const t = (key: string) => translate(locale, key)
  const [activeLevel, setActiveLevel] = useState("All")
  const [selectedCourse, setSelectedCourse] = useState<typeof courses[0] | null>(null)
  const [playing, setPlaying] = useState(false)

  const levels = [t("allLevels"), t("beginner"), t("intermediate"), t("advanced")]
  const levelMap: Record<string, string> = {
    [t("allLevels")]: "All",
    [t("beginner")]: "Beginner",
    [t("intermediate")]: "Intermediate",
    [t("advanced")]: "Advanced",
  }

  const filtered = activeLevel === t("allLevels") ? courses : courses.filter(c => c.level === levelMap[activeLevel])

  return (
    <main className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-dark-950" : "bg-gray-50"}`}>
      <section className="bg-gradient-to-br from-dark-950 via-dark-900 to-blue-950 text-white py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">{t("educationPageTitle")}</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">{t("educationPageSubtitle")}</p>
        </div>
      </section>

      {selectedCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { setSelectedCourse(null); setPlaying(false) }}></div>
          <div className="relative bg-dark-900 rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl border border-dark-700">
            <div className="relative aspect-video bg-dark-950">
              {!selectedCourse.free && !playing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-dark-900 to-dark-950">
                  <img src={selectedCourse.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" />
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center border-2 border-yellow-500/50 mx-auto mb-6">
                      <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    </div>
                    <h3 className="text-white text-xl font-bold mb-2">{t("premiumContent")}</h3>
                    <p className="text-gray-400 text-sm mb-6">{t("subscribeToAccess")}</p>
                    <button className="bg-yellow-500 text-dark-900 font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors">{t("unlockFor")}</button>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-950">
                  <img src={selectedCourse.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                  <button onClick={() => setPlaying(!playing)} className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white/30 transition-all mx-auto">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </button>
                  <p className="relative z-10 text-white font-semibold mt-4">{selectedCourse.title}</p>
                  <div className="absolute bottom-0 left-0 right-0 bg-dark-800 px-4 py-3">
                    <div className="w-full bg-dark-700 rounded-full h-1.5 mb-2"><div className="bg-blue-500 h-1.5 rounded-full" style={{width: "35%"}}></div></div>
                    <div className="flex justify-between text-xs text-gray-400"><span>12:35</span><span>45:20</span></div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-xl font-bold">{selectedCourse.title}</h3>
                <button onClick={() => { setSelectedCourse(null); setPlaying(false) }} className="w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-4">{selectedCourse.lessons} {t("lessons")} • {selectedCourse.duration}</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Array.from({ length: selectedCourse.lessons }, (_, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? "bg-blue-500/10 border border-blue-500/20" : "bg-dark-800/50"}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-blue-500 text-white" : "bg-dark-700 text-gray-400"}`}>{i + 1}</div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${i === 0 ? "text-white" : "text-gray-300"}`}>{t("lesson")} {i + 1}</div>
                      <div className="text-xs text-gray-500">15:00 {t("min")}</div>
                    </div>
                    {!selectedCourse.free && i > 0 && (
                      <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          {levels.map(level => (
            <button key={level} onClick={() => setActiveLevel(level)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeLevel === level ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25" : isDark ? "bg-dark-800 text-gray-400 border border-dark-700 hover:border-blue-500/30" : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600"}`}>{level}</button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <div key={course.id} onClick={() => setSelectedCourse(course)} className={`rounded-2xl overflow-hidden border hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 group cursor-pointer ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"}`}>
              <div className="relative h-44 overflow-hidden">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className={`absolute inset-0 bg-gradient-to-t ${course.color} opacity-50`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
                {course.free ? (
                  <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">{t("freeLabel")}</span>
                ) : (
                  <span className="absolute top-3 left-3 bg-yellow-500 text-dark-900 text-xs font-bold px-3 py-1 rounded-full">{t("premiumLabel")}</span>
                )}
                <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">{course.duration}</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${course.level === "Beginner" ? "bg-green-50 text-green-600" : course.level === "Intermediate" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}>{course.level === "Beginner" ? t("beginner") : course.level === "Intermediate" ? t("intermediate") : t("advanced")}</span>
                  <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{course.lessons} {t("lessons")}</span>
                </div>
                <h3 className={`text-lg font-bold mb-1 group-hover:text-blue-600 transition-colors ${isDark ? "text-white" : "text-gray-900"}`}>{course.title}</h3>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{course.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-14 px-4 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white mt-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-3">{t("unlockAllPremium")}</h2>
          <p className="text-blue-100/80 mb-8">{t("lifetimeAccess")}</p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <h3 className="font-bold mb-1">{t("oneMonth")}</h3>
              <div className="text-4xl font-extrabold mb-1">$49</div>
              <div className="text-blue-200 text-sm mb-6">/month</div>
              <button className="w-full bg-white text-blue-700 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors">{t("subscribe")}</button>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <h3 className="font-bold mb-1">{t("sixMonths")}</h3>
              <div className="text-4xl font-extrabold mb-1">$199</div>
              <div className="text-blue-200 text-sm mb-6">$33/month</div>
              <button className="w-full bg-white text-blue-700 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors">{t("subscribe")}</button>
            </div>
            <div className="bg-white border-2 border-yellow-400 rounded-2xl p-8 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-dark-900 text-xs font-bold px-3 py-1 rounded-full">{t("bestValue")}</span>
              <h3 className="font-bold text-gray-900 mb-1">{t("yearly")}</h3>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">$349</div>
              <div className="text-gray-500 text-sm mb-6">$29/month</div>
              <button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-dark-900 font-bold py-3 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-colors">{t("getYearly")}</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
