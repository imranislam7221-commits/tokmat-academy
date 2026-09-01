"use client"
import { useState, useEffect } from "react"

import { useTheme } from "@/components/ThemeProvider"
import { t as translate, type Locale } from "@/lib/translations"

const signals = [
  { pair: "EUR/USD", dir: "BUY", entry: "1.0850", tp: "1.0920", sl: "1.0810", profit: "+0.64%", status: "TP Hit" },
  { pair: "GBP/JPY", dir: "SELL", entry: "188.500", tp: "187.800", sl: "189.100", profit: "+0.37%", status: "Running" },
  { pair: "XAU/USD", dir: "BUY", entry: "2345.00", tp: "2375.00", sl: "2330.00", profit: "+1.28%", status: "TP Hit" },
  { pair: "USD/JPY", dir: "SELL", entry: "155.200", tp: "154.500", sl: "155.800", profit: "+0.45%", status: "Running" },
  { pair: "AUD/USD", dir: "BUY", entry: "0.6540", tp: "0.6600", sl: "0.6500", profit: "+0.92%", status: "TP Hit" },
  { pair: "EUR/GBP", dir: "SELL", entry: "0.8520", tp: "0.8470", sl: "0.8560", profit: "+0.22%", status: "Running" },
]

export default function SignalsPage() {
  
  const [locale, setLocale] = useState<Locale>("en")
  useEffect(() => { const p = new URLSearchParams(window.location.search); setLocale((p.get("locale") || "en") as Locale); }, [])
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const t = (key: string) => translate(locale, key)

  return (
    <main className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-dark-950" : "bg-gray-50"}`}>
      <section className={`py-14 px-4 relative overflow-hidden ${isDark ? "" : "bg-gradient-to-br from-dark-950 via-dark-900 to-blue-950"}`}>
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-block bg-green-500/10 text-green-400 text-sm font-semibold px-4 py-1.5 rounded-full border border-green-500/20 mb-4">
            <span className="inline-flex items-center gap-2"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>{t("liveSignalsLabel")}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">{t("signalsPageTitle")}</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">{t("signalsPageSubtitle")}</p>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 pb-16 -mt-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {signals.map((s, i) => (
            <div key={i} className={`rounded-2xl p-5 border transition-all hover:shadow-lg ${isDark ? "bg-dark-800 border-dark-700 hover:border-blue-500/30" : "bg-white border-gray-100 hover:border-blue-200 shadow-sm"}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>{s.pair}</div>
                <span className={`signal-badge ${s.dir === "BUY" ? "signal-buy" : "signal-sell"}`}>{s.dir}</span>
              </div>
              <div className="space-y-2.5 mb-4 text-sm">
                <div className="flex justify-between"><span className={isDark ? "text-gray-500" : "text-gray-400"}>{t("entryLabel")}</span><span className={`trading-price font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{s.entry}</span></div>
                <div className="flex justify-between"><span className={isDark ? "text-gray-500" : "text-gray-400"}>{t("tpLabel")}</span><span className="text-green-500 trading-price font-medium">{s.tp}</span></div>
                <div className="flex justify-between"><span className={isDark ? "text-gray-500" : "text-gray-400"}>{t("slLabel")}</span><span className="text-red-500 trading-price font-medium">{s.sl}</span></div>
              </div>
              <div className={`border-t pt-3 flex items-center justify-between ${isDark ? "border-dark-700/50" : "border-gray-100"}`}>
                <span className={`font-bold trading-price ${s.profit.startsWith("+") ? "text-green-500" : "text-red-500"}`}>{s.profit}</span>
                <span className={`signal-badge border ${s.status === "TP Hit" ? (isDark ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-green-100 text-green-700 border-green-200") : (isDark ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-blue-100 text-blue-700 border-blue-200")}`}>{s.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
