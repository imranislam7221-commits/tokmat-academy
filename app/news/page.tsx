"use client"
import { useState, useEffect } from "react"

import { useTheme } from "@/components/ThemeProvider"
import { t as translate, type Locale } from "@/lib/translations"

const news = [
  { title: "EUR/USD Rises as Fed Signals Rate Cut Pause", time: "2 hours ago", tag: "Market Update", color: "bg-blue-500/10 text-blue-400" },
  { title: "Gold Hits New Monthly High on Dollar Weakness", time: "5 hours ago", tag: "Gold", color: "bg-yellow-500/10 text-yellow-400" },
  { title: "GBP/JPY Volatility Expected Ahead of BOE Decision", time: "8 hours ago", tag: "Pound", color: "bg-purple-500/10 text-purple-400" },
  { title: "US Non-Farm Payrolls Report This Friday", time: "1 day ago", tag: "Economic Data", color: "bg-red-500/10 text-red-400" },
  { title: "Oil Prices Surge on Middle East Tensions", time: "1 day ago", tag: "Commodities", color: "bg-orange-500/10 text-orange-400" },
  { title: "AUD/USD Tests Key Support Level at 0.6500", time: "2 days ago", tag: "Technical Analysis", color: "bg-green-500/10 text-green-400" },
]

export default function NewsPage() {
  
  const [locale, setLocale] = useState<Locale>("en")
  useEffect(() => { const p = new URLSearchParams(window.location.search); setLocale((p.get("locale") || "en") as Locale); }, [])
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const t = (key: string) => translate(locale, key)

  return (
    <main className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-dark-950" : "bg-gray-50"}`}>
      <section className="bg-gradient-to-br from-dark-950 via-dark-900 to-blue-950 text-white py-14 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">{t("newsPageTitle")}</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">{t("newsPageSubtitle")}</p>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="space-y-4">
          {news.map((item, i) => (
            <div key={i} className={`rounded-xl p-5 border hover:shadow-elevated transition-all cursor-pointer ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.color}`}>{item.tag}</span>
                <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{item.time}</span>
              </div>
              <h3 className={`text-lg font-bold hover:text-blue-600 transition-colors ${isDark ? "text-white" : "text-gray-900"}`}>{item.title}</h3>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
