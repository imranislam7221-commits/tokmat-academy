"use client"

import { use } from "react"
import { useTheme } from "@/components/ThemeProvider"
import { t as translate, type Locale } from "@/lib/translations"

const signals = [
  { pair: "EUR/USD", direction: "BUY", entry: "1.0850", tp: "1.0920", sl: "1.0810", profit: "+0.64%", status: "TP Hit", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { pair: "GBP/JPY", direction: "SELL", entry: "188.500", tp: "187.800", sl: "189.100", profit: "+0.37%", status: "Running", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { pair: "XAU/USD", direction: "BUY", entry: "2345.00", tp: "2375.00", sl: "2330.00", profit: "+1.28%", status: "TP Hit", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { pair: "USD/JPY", direction: "SELL", entry: "155.200", tp: "154.500", sl: "155.800", profit: "+0.45%", status: "Running", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { pair: "AUD/USD", direction: "BUY", entry: "0.6540", tp: "0.6600", sl: "0.6500", profit: "+0.92%", status: "TP Hit", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { pair: "EUR/GBP", direction: "SELL", entry: "0.8520", tp: "0.8470", sl: "0.8560", profit: "+0.22%", status: "Running", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { pair: "NZD/USD", direction: "BUY", entry: "0.5980", tp: "0.6040", sl: "0.5940", profit: "+1.00%", status: "TP Hit", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { pair: "GBP/USD", direction: "BUY", entry: "1.2720", tp: "1.2790", sl: "1.2680", profit: "+0.55%", status: "Running", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { pair: "USD/CAD", direction: "SELL", entry: "1.3650", tp: "1.3580", sl: "1.3700", profit: "+0.51%", status: "TP Hit", color: "bg-green-500/20 text-green-400 border-green-500/30" },
]

export default function SignalsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = use(searchParams)
  const locale = (params?.locale || "en") as Locale
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const t = (key: string) => translate(locale, key)

  return (
    <main className="min-h-screen bg-dark-950">
      <section className="py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-block bg-green-500/10 text-green-400 text-sm font-semibold px-4 py-1.5 rounded-full border border-green-500/20 mb-4">
            <span className="inline-flex items-center gap-2">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
              {t("liveSignalsLabel")}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">{t("newsAnalysisTitle")}</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">{t("newsAnalysisSubtitle")}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {signals.map((s, i) => (
            <div key={i} className="trading-card">
              <div className="flex items-center justify-between mb-4">
                <div className="text-white font-bold text-lg">{s.pair}</div>
                <span className={`signal-badge ${s.direction === "BUY" ? "signal-buy" : "signal-sell"}`}>{s.direction}</span>
              </div>
              <div className="space-y-2.5 mb-4 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">{t("entryLabel")}</span><span className="text-white trading-price font-medium">{s.entry}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{t("tpLabel")}</span><span className="text-green-400 trading-price font-medium">{s.tp}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{t("slLabel")}</span><span className="text-red-400 trading-price font-medium">{s.sl}</span></div>
              </div>
              <div className="border-t border-dark-700/50 pt-3 flex items-center justify-between">
                <span className="text-green-400 font-bold trading-price">{s.profit}</span>
                <span className={`signal-badge border ${s.color}`}>{s.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
