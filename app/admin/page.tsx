"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/components/ThemeProvider"
import { t as translate, type Locale } from "@/lib/translations"

const demoUsers = [
  { id: 1, name: "Imran Khan", email: "imran@gmail.com", plan: "Free", status: "Active", joinDate: "Jan 15, 2024", balance: "$12,450" },
  { id: 2, name: "Sarah Ahmed", email: "sarah@gmail.com", plan: "Premium", status: "Active", joinDate: "Feb 3, 2024", balance: "$28,900" },
  { id: 3, name: "Ali Hassan", email: "ali@gmail.com", plan: "Free", status: "Suspended", joinDate: "Mar 22, 2024", balance: "$5,200" },
  { id: 4, name: "Maria Santos", email: "maria@gmail.com", plan: "Premium", status: "Active", joinDate: "Apr 10, 2024", balance: "$45,600" },
  { id: 5, name: "James Wilson", email: "james@gmail.com", plan: "Free", status: "Active", joinDate: "May 5, 2024", balance: "$8,750" },
]

const demoSignals = [
  { id: 1, pair: "EUR/USD", direction: "BUY", entry: "1.0850", tp: "1.0920", sl: "1.0810", posted: "2h ago" },
  { id: 2, pair: "GBP/JPY", direction: "SELL", entry: "188.500", tp: "187.800", sl: "189.100", posted: "5h ago" },
  { id: 3, pair: "XAU/USD", direction: "BUY", entry: "2345.00", tp: "2375.00", sl: "2330.00", posted: "1d ago" },
]

export default function AdminDashboard() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [locale, setLocale] = useState<Locale>("en")
  const [activeSection, setActiveSection] = useState<"overview" | "users" | "signals" | "content" | "settings">("overview")
  const [showNewSignal, setShowNewSignal] = useState(false)
  const [newSignal, setNewSignal] = useState({ pair: "", direction: "BUY", entry: "", tp: "", sl: "" })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const params = new URLSearchParams(window.location.search)
    setLocale((params.get("locale") || "en") as Locale)
  }, [])

  if (!mounted) return null

  const t = (key: string) => translate(locale, key)

  const sections = [
    { id: "overview" as const, label: t("overview"), icon: "📊" },
    { id: "users" as const, label: t("users"), icon: "👥" },
    { id: "signals" as const, label: t("signals"), icon: "📡" },
    { id: "content" as const, label: t("content"), icon: "📝" },
    { id: "settings" as const, label: t("settings"), icon: "⚙️" },
  ]

  const handlePostSignal = () => {
    if (!newSignal.pair || !newSignal.entry) return
    alert(`${t("signalPosted")} ${newSignal.direction} ${newSignal.pair} @ ${newSignal.entry}`)
    setNewSignal({ pair: "", direction: "BUY", entry: "", tp: "", sl: "" })
    setShowNewSignal(false)
  }

  return (
    <main className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-dark-950" : "bg-gray-50"}`}>
      {/* Admin Header */}
      <nav className={`${isDark ? "bg-dark-900 border-dark-700" : "bg-white border-gray-200"} border-b px-4 py-3`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{t("adminPanel")}</h1>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{t("master")}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{t("masterAdmin")}</span>
            <a href="/" className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">{t("logout")}</a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Sidebar + Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-56 flex-shrink-0">
            <div className={`${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"} border rounded-2xl p-2 flex lg:flex-col gap-1 overflow-x-auto`}>
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeSection === sec.id
                      ? isDark ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"
                      : isDark ? "text-gray-400 hover:bg-dark-700 hover:text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  <span>{sec.icon}</span>
                  <span className="hidden sm:inline">{sec.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">

            {/* OVERVIEW */}
            {activeSection === "overview" && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: t("totalUsers"), value: "2,847", change: `+124 ${t("thisMonth")}`, icon: "👥", color: "from-blue-500 to-blue-600" },
                    { label: t("revenue"), value: "$48,520", change: `+$5,200 ${t("thisMonth")}`, icon: "💰", color: "from-green-500 to-green-600" },
                    { label: t("activeSignals"), value: "342", change: `12 ${t("today")}`, icon: "📡", color: "from-purple-500 to-purple-600" },
                    { label: t("premiumUsers"), value: "856", change: `30% ${t("percentOfTotal")}`, icon: "⭐", color: "from-orange-500 to-orange-600" },
                  ].map((stat, i) => (
                    <div key={i} className={`${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"} border rounded-2xl p-5`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{stat.icon}</span>
                        <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>+</span>
                      </div>
                      <div className={`text-2xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>{stat.value}</div>
                      <div className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{stat.change}</div>
                    </div>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className={`${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"} border rounded-2xl p-6`}>
                  <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{t("recentActivity")}</h3>
                  <div className="space-y-3">
                    {[
                      { text: `${t("newRegistered")} Sarah Ahmed`, time: `5 ${t("minAgo")}`, icon: "👤", color: "text-blue-500" },
                      { text: `${t("signalPosted")} EUR/USD BUY @ 1.0850`, time: `15 ${t("minAgo")}`, icon: "📡", color: "text-green-500" },
                      { text: `${t("premiumUpgrade")} James Wilson`, time: `1 ${t("hourAgo")}`, icon: "⭐", color: "text-yellow-500" },
                      { text: `${t("signalTPHit")} XAU/USD +1.28%`, time: `2 ${t("hourAgo")}`, icon: "🎯", color: "text-green-500" },
                      { text: `${t("newRegistered")} Ali Hassan`, time: `3 ${t("hourAgo")}`, icon: "👤", color: "text-blue-500" },
                    ].map((activity, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? "bg-dark-700/50" : "bg-gray-50"}`}>
                        <span className={`text-xl ${activity.color}`}>{activity.icon}</span>
                        <div className="flex-1">
                          <div className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{activity.text}</div>
                          <div className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* USERS */}
            {activeSection === "users" && (
              <div className={`${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"} border rounded-2xl overflow-hidden`}>
                <div className="p-6 flex items-center justify-between">
                  <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{t("userManagement")}</h3>
                  <input type="text" placeholder={`🔍 ${t("searchUsers")}`} className={`px-4 py-2 rounded-lg text-sm border outline-none ${isDark ? "bg-dark-700 border-dark-600 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"}`} />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={isDark ? "bg-dark-700" : "bg-gray-50"}>
                        {["User", "Email", "Plan", "Status", "Balance", t("edit")].map((h) => (
                          <th key={h} className={`text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? "divide-dark-700" : "divide-gray-100"}`}>
                      {demoUsers.map((user) => (
                        <tr key={user.id} className={`transition-colors ${isDark ? "hover:bg-dark-700/50" : "hover:bg-gray-50"}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">{user.name.charAt(0)}</div>
                              <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{user.name}</span>
                            </div>
                          </td>
                          <td className={`px-6 py-4 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${user.plan === "Premium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{user.plan}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${user.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{user.status}</span>
                          </td>
                          <td className={`px-6 py-4 text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{user.balance}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button className="text-blue-500 hover:text-blue-600 text-xs font-medium">{t("edit")}</button>
                              <button className="text-red-500 hover:text-red-600 text-xs font-medium">{t("suspend")}</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SIGNALS */}
            {activeSection === "signals" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{t("signalManagement")}</h3>
                  <button onClick={() => setShowNewSignal(!showNewSignal)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <span>+</span> {t("postNewSignal")}
                  </button>
                </div>

                {/* New Signal Form */}
                {showNewSignal && (
                  <div className={`${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"} border rounded-2xl p-6 animate-fade-in`}>
                    <h4 className={`font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{t("newSignal")}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <input type="text" placeholder={t("pairLabel")} value={newSignal.pair} onChange={(e) => setNewSignal({ ...newSignal, pair: e.target.value })} className={`px-3 py-2.5 rounded-xl text-sm border outline-none ${isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`} />
                      <select value={newSignal.direction} onChange={(e) => setNewSignal({ ...newSignal, direction: e.target.value })} className={`px-3 py-2.5 rounded-xl text-sm border outline-none ${isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}>
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                      </select>
                      <input type="text" placeholder={t("entryPlaceholder")} value={newSignal.entry} onChange={(e) => setNewSignal({ ...newSignal, entry: e.target.value })} className={`px-3 py-2.5 rounded-xl text-sm border outline-none ${isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`} />
                      <input type="text" placeholder={t("takeProfit")} value={newSignal.tp} onChange={(e) => setNewSignal({ ...newSignal, tp: e.target.value })} className={`px-3 py-2.5 rounded-xl text-sm border outline-none ${isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`} />
                      <input type="text" placeholder={t("stopLoss")} value={newSignal.sl} onChange={(e) => setNewSignal({ ...newSignal, sl: e.target.value })} className={`px-3 py-2.5 rounded-xl text-sm border outline-none ${isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`} />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={handlePostSignal} className="bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors">{t("postSignal")}</button>
                      <button onClick={() => setShowNewSignal(false)} className={`px-6 py-2 rounded-xl text-sm font-medium ${isDark ? "bg-dark-700 text-gray-300 hover:bg-dark-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"} transition-colors`}>{t("cancel")}</button>
                    </div>
                  </div>
                )}

                {/* Signal List */}
                <div className={`${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"} border rounded-2xl overflow-hidden`}>
                  {demoSignals.map((signal, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 ${i < demoSignals.length - 1 ? (isDark ? "border-b border-dark-700" : "border-b border-gray-100") : ""}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold ${signal.direction === "BUY" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {signal.direction === "BUY" ? "📈" : "📉"}
                        </div>
                        <div>
                          <div className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{signal.pair}</div>
                          <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{signal.direction} @ {signal.entry} | TP: {signal.tp} | SL: {signal.sl}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{signal.posted}</span>
                        <button className="text-red-500 hover:text-red-600 text-xs font-medium">{t("delete")}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONTENT */}
            {activeSection === "content" && (
              <div className="space-y-4">
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{t("contentManagement")}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: t("educationVideos"), desc: t("uploadManageVideo"), icon: "🎬", count: `24 ${t("videos")}`, color: "from-purple-500 to-purple-600" },
                    { title: t("newsArticles"), desc: t("writePublishNews"), icon: "📰", count: `156 ${t("articles")}`, color: "from-blue-500 to-blue-600" },
                    { title: t("resultsReports"), desc: t("monthlyPerformance"), icon: "📊", count: `12 ${t("reports")}`, color: "from-green-500 to-green-600" },
                    { title: t("brokerPartners"), desc: t("manageAffiliate"), icon: "🏦", count: `8 ${t("brokersCount")}`, color: "from-orange-500 to-orange-600" },
                  ].map((item, i) => (
                    <div key={i} className={`${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"} border rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer`}>
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-3xl">{item.icon}</span>
                        <span className={`bg-gradient-to-r ${item.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>{item.count}</span>
                      </div>
                      <h4 className={`font-bold text-lg mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>{item.title}</h4>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SETTINGS */}
            {activeSection === "settings" && (
              <div className="space-y-4">
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{t("settings")}</h3>
                {[
                  { title: t("siteName"), value: "Tokmat Academy", type: "text" },
                  { title: t("supportEmail"), value: "support@tokmatacademy.com", type: "email" },
                  { title: t("telegramLink"), value: "https://t.me/tokmatacademy", type: "text" },
                  { title: t("maxFreeSignals"), value: "3", type: "number" },
                ].map((setting, i) => (
                  <div key={i} className={`${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"} border rounded-xl p-4 flex items-center justify-between`}>
                    <label className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>{setting.title}</label>
                    <input type={setting.type} defaultValue={setting.value} className={`px-4 py-2 rounded-lg text-sm border outline-none w-64 text-right ${isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`} />
                  </div>
                ))}
                <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">{t("saveSettings")}</button>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  )
}
