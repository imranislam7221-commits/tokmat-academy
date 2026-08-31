"use client"

import { use } from "react"
import { useTheme } from "@/components/ThemeProvider"
import { t as translate, type Locale } from "@/lib/translations"

export default function AboutPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = use(searchParams)
  const locale = (params?.locale || "en") as Locale
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const t = (key: string) => translate(locale, key)

  return (
    <main className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-dark-950" : "bg-gray-50"}`}>
      <section className="bg-gradient-to-br from-dark-950 via-dark-900 to-blue-950 text-white py-14 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">{t("aboutTitle")}</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">{t("aboutSubtitle")}</p>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className={`rounded-2xl p-8 border mb-8 ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"}`}>
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{t("ourMission")}</h2>
          <p className={`leading-relaxed mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{t("missionDesc1")}</p>
          <p className={`leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>{t("missionDesc2")}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "🎯", title: t("visionTitle"), desc: t("visionDesc") },
            { icon: "🤝", title: t("valuesTitle"), desc: t("valuesDesc") },
            { icon: "🌍", title: t("globalTitle"), desc: t("globalDesc") },
          ].map((item, i) => (
            <div key={i} className={`rounded-xl p-6 border text-center ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"}`}>
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className={`font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{item.title}</h3>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
