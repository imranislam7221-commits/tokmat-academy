"use client"

import { use } from "react"
import { useTheme } from "@/components/ThemeProvider"
import { t as translate, type Locale } from "@/lib/translations"

const months = [
  { month: "July 2024", signals: 156, wins: 132, losses: 24, winRate: "84.6%", profit: "+12.4%" },
  { month: "June 2024", signals: 148, wins: 127, losses: 21, winRate: "85.8%", profit: "+14.2%" },
  { month: "May 2024", signals: 162, wins: 138, losses: 24, winRate: "85.2%", profit: "+13.8%" },
  { month: "April 2024", signals: 144, wins: 120, losses: 24, winRate: "83.3%", profit: "+11.1%" },
  { month: "March 2024", signals: 158, wins: 135, losses: 23, winRate: "85.4%", profit: "+14.6%" },
  { month: "February 2024", signals: 140, wins: 119, losses: 21, winRate: "85.0%", profit: "+13.5%" },
]

export default function ResultsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = use(searchParams)
  const locale = (params?.locale || "en") as Locale
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const t = (key: string) => translate(locale, key)

  const stats = [
    { label: t("totalSignals"), value: "908", icon: "📡" },
    { label: t("winRateLabel"), value: "84.9%", icon: "🎯" },
    { label: t("totalProfitResults"), value: "+79.6%", icon: "📈" },
    { label: t("avgMonthly"), value: "+13.3%", icon: "💰" },
  ]

  return (
    <main className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-dark-950" : "bg-gray-50"}`}>
      <section className={`py-14 px-4 relative overflow-hidden ${isDark ? "" : "bg-gradient-to-br from-dark-950 via-dark-900 to-blue-950"}`}>
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-block bg-green-500/10 text-green-400 text-sm font-semibold px-4 py-1.5 rounded-full border border-green-500/20 mb-4">{t("verifiedResults")}</div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">{t("resultsPageTitle")}</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">{t("resultsPageSubtitle")}</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-10 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className={`rounded-2xl border text-center p-5 transition-all hover:shadow-lg ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100 shadow-sm"}`}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className={`text-2xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>{s.value}</div>
              <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100 shadow-sm"}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? "bg-dark-700" : "bg-gray-50"}>
                  {[t("monthLabel"), t("signalsLabel"), t("winsLabel"), t("lossesLabel"), t("winRateLabel"), t("profitLabel")].map((h) => (
                    <th key={h} className={`text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-dark-700" : "divide-gray-100"}`}>
                {months.map((m, i) => (
                  <tr key={i} className={`transition-colors ${isDark ? "hover:bg-dark-700/50" : "hover:bg-gray-50"}`}>
                    <td className={`text-center font-medium py-3 px-4 ${isDark ? "text-white" : "text-gray-900"}`}>{m.month}</td>
                    <td className={`text-center py-3 px-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>{m.signals}</td>
                    <td className="text-center text-green-500 py-3 px-4">{m.wins}</td>
                    <td className="text-center text-red-500 py-3 px-4">{m.losses}</td>
                    <td className="text-center text-blue-500 font-medium py-3 px-4">{m.winRate}</td>
                    <td className="text-center text-green-500 font-bold trading-price py-3 px-4">{m.profit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  )
}
