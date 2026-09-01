"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/components/ThemeProvider"
import { t as translate, type Locale } from "@/lib/translations"

// Demo data - localStorage e save hoy
const defaultUserData = {
  firstName: "Imran",
  lastName: "Khan",
  email: "imran@gmail.com",
  joinDate: "2024-01-15",
  balance: 12450.75,
  totalProfit: 3280.50,
  winRate: 82,
  totalTrades: 156,
  activeSignals: 3,
}

const demoSignals = [
  { pair: "EUR/USD", direction: "BUY", entry: "1.0850", tp: "1.0920", sl: "1.0810", profit: "+0.64%", status: "TP Hit", color: "green" },
  { pair: "GBP/JPY", direction: "SELL", entry: "188.500", tp: "187.800", sl: "189.100", profit: "+0.37%", status: "Running", color: "blue" },
  { pair: "XAU/USD", direction: "BUY", entry: "2345.00", tp: "2375.00", sl: "2330.00", profit: "+1.28%", status: "TP Hit", color: "green" },
  { pair: "USD/CAD", direction: "SELL", entry: "1.3650", tp: "1.3580", sl: "1.3700", profit: "-0.22%", status: "Running", color: "red" },
  { pair: "AUD/USD", direction: "BUY", entry: "0.6580", tp: "0.6640", sl: "0.6540", profit: "+0.91%", status: "TP Hit", color: "green" },
]

const demoHistory = [
  { date: "Aug 28", pair: "EUR/USD", direction: "BUY", result: "WIN", profit: "+$120", pips: "+70" },
  { date: "Aug 27", pair: "GBP/JPY", direction: "SELL", result: "WIN", profit: "+$85", pips: "+55" },
  { date: "Aug 26", pair: "XAU/USD", direction: "BUY", result: "WIN", profit: "+$310", pips: "+300" },
  { date: "Aug 25", pair: "USD/CAD", direction: "SELL", result: "LOSS", profit: "-$45", pips: "-30" },
  { date: "Aug 24", pair: "AUD/JPY", direction: "BUY", result: "WIN", profit: "+$95", pips: "+65" },
  { date: "Aug 23", pair: "NZD/USD", direction: "SELL", result: "WIN", profit: "+$60", pips: "+40" },
  { date: "Aug 22", pair: "EUR/GBP", direction: "BUY", result: "WIN", profit: "+$75", pips: "+50" },
  { date: "Aug 21", pair: "USD/JPY", direction: "SELL", result: "WIN", profit: "+$110", pips: "+80" },
]

export default function DashboardPage() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [locale, setLocale] = useState<Locale>("en")
  const t = (key: string) => translate(locale, key)
  const [activeTab, setActiveTab] = useState<"overview" | "signals" | "history" | "account">("overview")
  const [userData, setUserData] = useState(defaultUserData)
  const [mounted, setMounted] = useState(false)

  const localeFromURL = () => {
    if (typeof window === "undefined") return "en"
    return new URLSearchParams(window.location.search).get("locale") || "en"
  }

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("userData")
    if (saved) {
      setUserData({ ...defaultUserData, ...JSON.parse(saved) })
    }
    localStorage.setItem("userData", JSON.stringify(defaultUserData))
    setLocale(localeFromURL() as Locale)
  }, [])

  if (!mounted) return <div className={`min-h-screen ${isDark ? "bg-dark-950" : "bg-gray-50"} flex items-center justify-center`}><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>

  const tabs = [
    { id: "overview" as const, label: t("overview"), icon: "📊" },
    { id: "signals" as const, label: t("activeSignals"), icon: "📡" },
    { id: "history" as const, label: t("history"), icon: "📋" },
    { id: "account" as const, label: t("account"), icon: "👤" },
  ]

  return (
    <main className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-dark-950" : "bg-gray-50"}`}>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? "text-white" : "text-white"}`}>
                {t("welcomeBack")}, {userData.firstName} 👋
              </h1>
              <p className="text-blue-200 mt-1">{t("tradingOverview")}</p>
            </div>
            <div className="flex items-center gap-3">
              <a href="/signals" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/20 transition-all">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                {t("liveSignals")}
              </a>
              <a href="/news-analysis" className="inline-flex items-center gap-2 bg-white text-blue-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all shadow-lg">
                📰 {t("news")}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: t("totalBalance"), value: `$${userData.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: "💰", change: "+12.5%", changeColor: "text-green-500", bgColor: isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100" },
            { label: t("totalProfit"), value: `+$${userData.totalProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: "📈", change: "+8.2%", changeColor: "text-green-500", bgColor: isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100" },
            { label: t("winRate"), value: `${userData.winRate}%`, icon: "🎯", change: "+3%", changeColor: "text-green-500", bgColor: isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100" },
            { label: t("totalTrades"), value: userData.totalTrades.toString(), icon: "📊", change: `+${userData.activeSignals} active`, changeColor: "text-blue-500", bgColor: isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100" },
          ].map((stat, i) => (
            <div key={i} className={`${stat.bgColor} border rounded-2xl p-5 transition-all hover:shadow-lg ${isDark ? "" : ""}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
                <span className={`text-xs font-semibold ${stat.changeColor}`}>{stat.change}</span>
              </div>
              <div className={`text-2xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>{stat.value}</div>
              <div className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto ${isDark ? "bg-dark-800" : "bg-gray-100"}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? isDark ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-white text-blue-600 shadow-sm"
                  : isDark ? "text-gray-400 hover:text-white hover:bg-dark-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pb-12">
          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Signals */}
              <div className={`lg:col-span-2 rounded-2xl border p-6 ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{t("recentSignals")}</h3>
                  <button onClick={() => setActiveTab("signals")} className="text-blue-500 text-sm font-medium hover:text-blue-600">{t("viewAll")} →</button>
                </div>
                <div className="space-y-3">
                  {demoSignals.slice(0, 3).map((signal, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? "bg-dark-700/50" : "bg-gray-50"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${signal.direction === "BUY" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {signal.direction === "BUY" ? "📈" : "📉"}
                        </div>
                        <div>
                          <div className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{signal.pair}</div>
                          <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Entry: {signal.entry}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-sm ${signal.profit.startsWith("+") ? "text-green-500" : "text-red-500"}`}>{signal.profit}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${
                          signal.status === "TP Hit" ? "bg-green-100 text-green-700" : signal.status === "Running" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                        }`}>{signal.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <div className={`rounded-2xl border p-6 ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"}`}>
                  <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{t("quickActions")}</h3>
                  <div className="space-y-2">
                    {[
                      { label: t("joinTelegram"), desc: t("getSignalsOnTelegram"), icon: "📱", href: "https://t.me/tokmatacademy", color: "bg-blue-50 hover:bg-blue-100 text-blue-700" },
                      { label: t("educationCenter"), desc: t("learnTradingStrategies"), icon: "📚", href: "/education", color: "bg-purple-50 hover:bg-purple-100 text-purple-700" },
                      { label: t("viewResultsDash"), desc: t("seeTrackRecord"), icon: "🏆", href: "/results", color: "bg-green-50 hover:bg-green-100 text-green-700" },
                    ].map((action, i) => (
                      <a key={i} href={action.href} target={action.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={`flex items-center gap-3 p-3 rounded-xl ${action.color} transition-all`}>
                        <span className="text-xl">{action.icon}</span>
                        <div>
                          <div className="text-sm font-semibold">{action.label}</div>
                          <div className="text-xs opacity-70">{action.desc}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Win Rate Progress */}
                <div className={`rounded-2xl border p-6 ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"}`}>
                  <h3 className={`text-lg font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>{t("winRate")}</h3>
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke={isDark ? "#334155" : "#e5e7eb"} strokeWidth="10" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${userData.winRate * 3.14} 314`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-2xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>{userData.winRate}%</div>
                        <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Win Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE SIGNALS */}
          {activeTab === "signals" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoSignals.map((signal, i) => (
                <div key={i} className={`rounded-2xl border p-5 transition-all hover:shadow-lg ${isDark ? "bg-dark-800 border-dark-700 hover:border-blue-500/30" : "bg-white border-gray-100 hover:border-blue-200"}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${signal.direction === "BUY" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                        {signal.direction === "BUY" ? "📈" : "📉"}
                      </div>
                      <div>
                        <div className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>{signal.pair}</div>
                        <span className={`signal-badge ${signal.direction === "BUY" ? "signal-buy" : "signal-sell"}`}>{signal.direction}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {[
                      { label: t("entry"), value: signal.entry, color: isDark ? "text-gray-300" : "text-gray-700" },
                      { label: t("takeProfit"), value: signal.tp, color: "text-green-500" },
                      { label: t("stopLoss"), value: signal.sl, color: "text-red-500" },
                    ].map((item, j) => (
                      <div key={j} className="flex justify-between text-sm">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>{item.label}</span>
                        <span className={`font-medium trading-price ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`border-t pt-3 flex items-center justify-between ${isDark ? "border-dark-700" : "border-gray-100"}`}>
                    <span className={`font-bold trading-price ${signal.profit.startsWith("+") ? "text-green-500" : "text-red-500"}`}>{signal.profit}</span>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      signal.status === "TP Hit" ? "bg-green-100 text-green-700" : signal.status === "Running" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                    }`}>{signal.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* HISTORY */}
          {activeTab === "history" && (
            <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"}`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={isDark ? "bg-dark-700" : "bg-gray-50"}>
                      {[t("dateLabel"), t("pairLabel"), t("directionLabel"), t("resultLabel"), t("profitLabel"), t("pipsLabel")].map((h) => (
                        <th key={h} className={`text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                    {demoHistory.map((trade, i) => (
                      <tr key={i} className={`transition-colors ${isDark ? "hover:bg-dark-700/50" : "hover:bg-gray-50"}`}>
                        <td className={`px-6 py-4 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>{trade.date}</td>
                        <td className={`px-6 py-4 text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{trade.pair}</td>
                        <td className="px-6 py-4">
                          <span className={`signal-badge ${trade.direction === "BUY" ? "signal-buy" : "signal-sell"}`}>{trade.direction}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            trade.result === "WIN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {trade.result === "WIN" ? "✅" : "❌"} {trade.result}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-sm font-bold trading-price ${trade.profit.startsWith("+") ? "text-green-500" : "text-red-500"}`}>{trade.profit}</td>
                        <td className={`px-6 py-4 text-sm trading-price ${trade.pips.startsWith("+") ? "text-green-500" : "text-red-500"}`}>{trade.pips} pips</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ACCOUNT */}
          {activeTab === "account" && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Profile */}
              <div className={`rounded-2xl border p-6 ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"}`}>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{t("profileInformation")}</h3>
                <div className="space-y-4">
                  {[
                    { label: t("firstNameLabel"), value: userData.firstName, icon: "👤" },
                    { label: t("lastNameLabel"), value: userData.lastName, icon: "👤" },
                    { label: t("emailLabel"), value: userData.email, icon: "📧" },
                    { label: t("memberSince"), value: userData.joinDate, icon: "📅" },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? "bg-dark-700/50" : "bg-gray-50"}`}>
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{item.label}</div>
                        <div className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account Settings */}
              <div className="space-y-4">
                <div className={`rounded-2xl border p-6 ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"}`}>
                  <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{t("subscription")}</h3>
                  <div className={`p-4 rounded-xl border-2 border-dashed ${isDark ? "border-blue-500/30 bg-blue-500/5" : "border-blue-200 bg-blue-50"}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">⭐</span>
                      <div>
                        <div className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{t("freePlan")}</div>
                        <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{t("accessToSignals")}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`rounded-2xl border p-6 ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"}`}>
                  <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{t("security")}</h3>
                  <div className="space-y-2">
                    <button className={`w-full flex items-center justify-between p-3 rounded-xl text-sm transition-colors ${isDark ? "bg-dark-700/50 hover:bg-dark-700 text-gray-300" : "bg-gray-50 hover:bg-gray-100 text-gray-700"}`}>
                      <span className="flex items-center gap-2">🔒 {t("changePassword")}</span>
                      <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <button className={`w-full flex items-center justify-between p-3 rounded-xl text-sm transition-colors ${isDark ? "bg-dark-700/50 hover:bg-dark-700 text-gray-300" : "bg-gray-50 hover:bg-gray-100 text-gray-700"}`}>
                      <span className="flex items-center gap-2">📱 {t("twoFactorAuth")}</span>
                      <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <button className="w-full flex items-center justify-between p-3 rounded-xl text-sm bg-red-50 hover:bg-red-100 text-red-600 transition-colors">
                      <span className="flex items-center gap-2">🚪 {t("signOut")}</span>
                      <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}