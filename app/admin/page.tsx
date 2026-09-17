"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/components/ThemeProvider"
import { t as translate, type Locale } from "@/lib/translations"
import { logout as authLogout } from "@/lib/auth"

const demoUsers: any[] = [] // real users DB theke ase — demo list removed

const demoSignals = [
  { id: 1, pair: "EUR/USD", direction: "BUY", entry: "1.0850", tp: "1.0920", sl: "1.0810", posted: "2h ago" },
  { id: 2, pair: "GBP/JPY", direction: "SELL", entry: "188.500", tp: "187.800", sl: "189.100", posted: "5h ago" },
  { id: 3, pair: "XAU/USD", direction: "BUY", entry: "2345.00", tp: "2375.00", sl: "2330.00", posted: "1d ago" },
]


export default function AdminDashboard() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [locale, setLocale] = useState<Locale>("en")
  const [activeSection, setActiveSection] = useState<"overview" | "users" | "signals" | "videos" | "content" | "settings">("overview")
  const [showNewSignal, setShowNewSignal] = useState(false)
  const [newSignal, setNewSignal] = useState({ pair: "", direction: "BUY", entry: "", tp: "", sl: "" })
  const [mounted, setMounted] = useState(false)
  const [liveSignals, setLiveSignals] = useState<any[]>(demoSignals)
  const [videoReqs, setVideoReqs] = useState<any[]>([])
  const [videoReqsLoading, setVideoReqsLoading] = useState(false)
  // Video management state
  const [dbVideos, setDbVideos] = useState<any[]>([])
  const [videosLoading, setVideosLoading] = useState(false)
  const [showVideoForm, setShowVideoForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<any>(null)
  const [videoForm, setVideoForm] = useState({ title: "", desc: "", lessons: "5", dur: "", price: "$5", img: "", video_url: "" })
  // Limited Offer banner + site settings (site_settings table theke)
  const [offerSettings, setOfferSettings] = useState({ enabled: true, title: "", subtitle: "", deadline: "", ctaText: "" })
  const [siteSettings, setSiteSettings] = useState({ site_name: "", support_email: "", telegram_link: "", max_free_signals: "" })
  const [offerSaving, setOfferSaving] = useState(false)

  useEffect(() => {
    fetch("/api/settings").then(r=>r.json()).then(j=>{
      if (j.ok && j.settings) {
        setOfferSettings({
          enabled: j.settings.offer_enabled !== "false",
          title: j.settings.offer_title || "",
          subtitle: j.settings.offer_subtitle || "",
          deadline: j.settings.offer_deadline ? j.settings.offer_deadline.slice(0, 16) : "",
          ctaText: j.settings.offer_cta_text || "",
        })
        setSiteSettings({
          site_name: j.settings.site_name || "",
          support_email: j.settings.support_email || "",
          telegram_link: j.settings.telegram_link || "",
          max_free_signals: j.settings.max_free_signals || "",
        })
      }
    }).catch(()=>{})
  }, [])

  const saveSiteSettings = async () => {
    try {
      const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ site_name: siteSettings.site_name, support_email: siteSettings.support_email, telegram_link: siteSettings.telegram_link, max_free_signals: siteSettings.max_free_signals }) })
      if (res.ok) {
        const el = document.createElement("div"); el.textContent = "Site settings saved!"; el.className = "fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg z-50 text-sm font-bold"; document.body.appendChild(el); setTimeout(()=>el.remove(), 2500)
      }
    } catch {}
  }

  const saveOfferSettings = async () => {
    setOfferSaving(true)
    try {
      const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ offer_enabled: String(offerSettings.enabled), offer_title: offerSettings.title, offer_subtitle: offerSettings.subtitle, offer_deadline: offerSettings.deadline ? new Date(offerSettings.deadline).toISOString() : "", offer_cta_text: offerSettings.ctaText }) })
      if (res.ok) {
        const el = document.createElement("div"); el.textContent = "Settings saved!"; el.className = "fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg z-50 text-sm font-bold"; document.body.appendChild(el); setTimeout(()=>el.remove(), 2500)
      }
    } catch {} finally { setOfferSaving(false) }
  }

  useEffect(() => {
    setMounted(true)
    const params = new URLSearchParams(window.location.search)
    setLocale((params.get("locale") || "en") as Locale)
    fetch("/api/signals").then(r=>r.json()).then(j=>{ if(Array.isArray(j.signals)) setLiveSignals(j.signals.map((s:any,i:number)=>({ id:s.id||i, pair:s.pair, direction:s.direction, entry:s.entry, tp:s.tp, sl:s.sl, posted:s.time||"now"}))) }).catch(()=>{})
  }, [])  // Admin guard: only real admin session can access

  // Signal delete (admin) — DB theke remove + list refresh
  const deleteSignal = async (id: number) => {
    try {
      const res = await fetch(`/api/signals?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setLiveSignals((prev) => prev.filter((s) => s.id !== id))
        const el = document.createElement("div"); el.textContent = "Signal deleted"; el.className = "fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg z-50 text-sm font-bold"; document.body.appendChild(el); setTimeout(()=>el.remove(), 2000)
      }
    } catch {}
  }
  const [currentAdmin, setCurrentAdmin] = useState<any>(null)
  const MASTER_ADMIN = (process.env.NEXT_PUBLIC_MASTER_ADMIN_EMAIL || "maasum1231@gmail.com").toLowerCase()
  useEffect(() => {
    fetch("/api/auth", { cache: "no-store", credentials: "include" })
      .then(r => r.json())
      .then(j => {
        if (!j.ok || !j.user) { window.location.href = "/login"; return; }
        if (j.user.role !== "admin") { window.location.href = "/dashboard"; }
        setCurrentAdmin(j.user)
      })
      .catch(() => { window.location.href = "/login"; })
  }, [])

  // Real users list from database
  const [dbUsers, setDbUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    if (activeSection !== "users") return
    setUsersLoading(true)
    fetch("/api/users")
      .then(r => r.json())
      .then(j => { if (j.ok) setDbUsers(j.users || []); setUsersLoading(false) })
      .catch(() => setUsersLoading(false))
  }, [activeSection])

  const toggleSuspend = async (userId: number) => {
    try {
      const res = await fetch("/api/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) })
      if (res.ok) {
        setDbUsers((prev: any[]) => prev.map((u: any) => u.id === userId ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u))
      }
    } catch {}
  }

  useEffect(() => {
    if (activeSection !== "content") return
    setVideoReqsLoading(true)
    fetch("/api/video-requests").then(r=>r.json()).then(j=>{ if(j.ok) setVideoReqs(j.requests||[]); setVideoReqsLoading(false)}).catch(()=> setVideoReqsLoading(false))
  }, [activeSection])

  // Video management loader
  const loadVideos = () => {
    setVideosLoading(true)
    fetch("/api/videos").then(r=>r.json()).then(j=>{ setDbVideos(j.videos||[]); setVideosLoading(false) }).catch(()=> setVideosLoading(false))
  }
  useEffect(() => {
    if (activeSection !== "videos") return
    loadVideos()
  }, [activeSection])

  const openVideoForm = (v?: any) => {
    if (v) {
      setEditingVideo(v)
      setVideoForm({ title: v.title||"", desc: v.desc||"", lessons: String(v.lessons||1), dur: v.dur||"", price: v.price||"$5", img: v.img||"", video_url: v.video_url||"" })
    } else {
      setEditingVideo(null)
      setVideoForm({ title: "", desc: "", lessons: "5", dur: "", price: "$5", img: "", video_url: "" })
    }
    setShowVideoForm(true)
  }

  const saveVideo = async () => {
    if (!videoForm.title.trim()) return
    try {
      const method = editingVideo ? "PATCH" : "POST"
      const body = editingVideo ? { id: editingVideo.id, ...videoForm } : videoForm
      const res = await fetch("/api/videos", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      if (res.ok) {
        setShowVideoForm(false)
        loadVideos()
        const el = document.createElement("div"); el.textContent = editingVideo ? "Video updated!" : "Video added!"; el.className = "fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg z-50 text-sm font-bold"; document.body.appendChild(el); setTimeout(()=>el.remove(), 2500)
      }
    } catch {}
  }

  const deleteVideo = async (id: number) => {
    try {
      const res = await fetch(`/api/videos?id=${id}`, { method: "DELETE" })
      if (res.ok) setDbVideos((prev) => prev.filter((v) => v.id !== id))
    } catch {}
  }

  const handleVideoAction = async (id:number, status:string) => {
    try { const r=await fetch("/api/video-requests",{method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id, status})}); if(r.ok) setVideoReqs((prev:any)=> prev.map((x:any)=> x.id===id ? {...x, status}:x)); } catch {}
  }

  const totalUsers = dbUsers.length;
  const premiumUsers = dbUsers.filter((u:any)=> (u.plan||"").toLowerCase().includes("premium") || (u.plan||"").toLowerCase().includes("supreme")).length;
  const activeSignals = liveSignals.length;
  const premiumPct = totalUsers ? Math.round((premiumUsers/totalUsers)*100) : 0;

  if (!mounted) return null

  const t = (key: string) => translate(locale, key)

  const sections = [
    { id: "overview" as const, label: t("overview"), icon: "📊" },
    { id: "users" as const, label: t("users"), icon: "👥" },
    { id: "signals" as const, label: t("signals"), icon: "📡" },
    { id: "videos" as const, label: "Videos", icon: "🎬" },
    { id: "content" as const, label: t("content"), icon: "📝" },
    { id: "settings" as const, label: t("settings"), icon: "⚙️" },
  ]
  const handlePostSignal = async () => {
    if (!newSignal.pair || !newSignal.entry) return
    setPosting(true)
    try {
      const res = await fetch("/api/signals", { method:"POST", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({ pair:newSignal.pair, direction:newSignal.direction, entry:newSignal.entry, tp:newSignal.tp || newSignal.entry, sl:newSignal.sl || newSignal.entry }) })
      if (res.ok) {
        const j = await res.json()
        // optimistic feedback
        const msg = j.signal ? `${t("signalPosted")} ${j.signal.direction} ${j.signal.pair} @ ${j.signal.entry}` : t("signalPosted")
        // use custom toast instead of alert
        const el = document.createElement("div")
        el.textContent = msg
        el.className = "fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg z-50 text-sm font-bold"
        document.body.appendChild(el)
        setTimeout(()=>el.remove(), 2500)
        setNewSignal({ pair: "", direction: "BUY", entry: "", tp: "", sl: "" })
        setShowNewSignal(false)
      }
    } catch {} finally { setPosting(false) }
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
            <button onClick={() => authLogout()} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">{t("logout")}</button>
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
                    { label: t("totalUsers"), value: totalUsers.toLocaleString(), change: `${totalUsers} ${t("thisMonth")}`, icon: "👥", color: "from-blue-500 to-blue-600" },
                    { label: t("revenue"), value: `$${(premiumUsers*49).toLocaleString()}`, change: `${premiumUsers} × $49 ${t("thisMonth")}`, icon: "💰", color: "from-green-500 to-green-600" },
                    { label: t("activeSignals"), value: String(activeSignals), change: `${activeSignals} ${t("today")}`, icon: "📡", color: "from-purple-500 to-purple-600" },
                    { label: t("premiumUsers"), value: String(premiumUsers), change: `${premiumPct}% ${t("percentOfTotal")}`, icon: "⭐", color: "from-orange-500 to-orange-600" },
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
                    {(() => {
                      const acts:any[] = [];
                      dbUsers.slice(0,3).forEach((u:any)=> acts.push({ text: `${t("newRegistered")} ${u.firstName||u.email.split('@')[0]}`, time: u.joined ? new Date(u.joined).toLocaleDateString() : t("today"), icon: "👤", color: "text-blue-500" }));
                      liveSignals.slice(0,2).forEach((s:any)=> acts.push({ text: `${t("signalPosted")} ${s.pair} ${s.direction} @ ${s.entry}`, time: s.posted || s.time || "now", icon: "📡", color: "text-green-500" }));
                      if (acts.length===0) acts.push({ text: t("noActivity"), time: t("today"), icon: "📊", color: "text-gray-500" });
                      return acts.slice(0,5);
                    })().map((activity, i) => (
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
                        {["User", "Email", "Role", "Plan", "Joined", "Status", t("edit")].map((h) => (
                          <th key={h} className={`text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? "divide-dark-700" : "divide-gray-100"}`}>
                      {dbUsers.length === 0 && !usersLoading && (
                        <tr><td colSpan={6} className={`px-6 py-8 text-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>No registered users yet. Share the register link to get users!</td></tr>
                      )}
                      {usersLoading && (
                        <tr><td colSpan={6} className={`px-6 py-8 text-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}><span className="animate-spin inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></span> Loading users...</td></tr>
                      )}
                      {dbUsers.map((user: any) => (
                        <tr key={user.id} className={`transition-colors ${isDark ? "hover:bg-dark-700/50" : "hover:bg-gray-50"}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">{(user.firstName || user.email || "U").charAt(0).toUpperCase()}</div>
                              <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}</span>
                            </div>
                          </td>
                          <td className={`px-6 py-4 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>{user.email}</td>
                          <td className={`px-6 py-4 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{user.role === "admin" ? "👑 Admin" : "👤 User"}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${user.plan === "Premium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{user.plan}</span>
                          </td>
                          <td className={`px-6 py-4 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>{user.joined ? new Date(user.joined).toLocaleDateString() : "—"}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${user.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{user.status}</span>
                          </td>
                          <td className={`px-6 py-4 text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{user.balance}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {(() => {
                                const isMasterTarget = (user.email||"").toLowerCase() === MASTER_ADMIN;
                                const isMasterRequester = (currentAdmin?.email||"").toLowerCase() === MASTER_ADMIN;
                                const canSuspend = !isMasterTarget && (isMasterRequester || user.role !== "admin");
                                if (!canSuspend) return <span className="text-xs text-gray-400">—</span>;
                                return (
                                  <button onClick={() => toggleSuspend(user.id)} className={`${user.status === "Suspended" ? "text-green-500 hover:text-green-600" : "text-red-500 hover:text-red-600"} text-xs font-medium`}>
                                    {user.status === "Suspended" ? "Activate" : t("suspend")}
                                  </button>
                                );
                              })()}
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
                  {liveSignals.map((signal, i) => (
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
                        <button onClick={() => deleteSignal(signal.id)} className="text-red-500 hover:text-red-600 text-xs font-medium">{t("delete")}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIDEOS - Video Management */}
            {activeSection === "videos" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>🎬 Video Management</h3>
                  <button onClick={() => openVideoForm()} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <span>+</span> Add Video
                  </button>
                </div>

                {/* Add/Edit Form */}
                {showVideoForm && (
                  <div className={`${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"} border rounded-2xl p-6 animate-fade-in`}>
                    <h4 className={`font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{editingVideo ? `Edit: ${editingVideo.title}` : "Add New Video"}</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      <input type="text" placeholder="Video title *" value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} className={`px-3 py-2.5 rounded-xl text-sm border outline-none ${isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`} />
                      <input type="text" placeholder="Price (e.g. $5)" value={videoForm.price} onChange={(e) => setVideoForm({ ...videoForm, price: e.target.value })} className={`px-3 py-2.5 rounded-xl text-sm border outline-none ${isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`} />
                      <input type="text" placeholder="Description" value={videoForm.desc} onChange={(e) => setVideoForm({ ...videoForm, desc: e.target.value })} className={`px-3 py-2.5 rounded-xl text-sm border outline-none md:col-span-2 ${isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`} />
                      <input type="number" min="1" placeholder="Lessons count" value={videoForm.lessons} onChange={(e) => setVideoForm({ ...videoForm, lessons: e.target.value })} className={`px-3 py-2.5 rounded-xl text-sm border outline-none ${isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`} />
                      <input type="text" placeholder="Duration (e.g. 12:30)" value={videoForm.dur} onChange={(e) => setVideoForm({ ...videoForm, dur: e.target.value })} className={`px-3 py-2.5 rounded-xl text-sm border outline-none ${isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`} />
                      <input type="text" placeholder="Thumbnail image URL" value={videoForm.img} onChange={(e) => setVideoForm({ ...videoForm, img: e.target.value })} className={`px-3 py-2.5 rounded-xl text-sm border outline-none md:col-span-2 ${isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`} />
                      <input type="text" placeholder="Video URL (mp4 / embed link) *" value={videoForm.video_url} onChange={(e) => setVideoForm({ ...videoForm, video_url: e.target.value })} className={`px-3 py-2.5 rounded-xl text-sm border outline-none md:col-span-2 ${isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`} />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={saveVideo} className="bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors">{editingVideo ? "Update Video" : "Add Video"}</button>
                      <button onClick={() => setShowVideoForm(false)} className={`px-6 py-2 rounded-xl text-sm font-medium ${isDark ? "bg-dark-700 text-gray-300 hover:bg-dark-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"} transition-colors`}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* Video List */}
                {videosLoading ? (
                  <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Loading videos...</div>
                ) : dbVideos.length === 0 ? (
                  <div className={`text-sm border rounded-xl p-6 text-center ${isDark ? "bg-dark-800 border-dark-700 text-gray-400" : "bg-white border-gray-100 text-gray-500"}`}>No videos yet. Click "Add Video" to create the first one.</div>
                ) : (
                  <div className={`${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"} border rounded-2xl overflow-hidden`}>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={isDark ? "bg-dark-700" : "bg-gray-50"}>
                            {["Video", "Price", "Lessons", "Duration", "Video URL", "Actions"].map((h) => (
                              <th key={h} className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? "divide-dark-700" : "divide-gray-100"}`}>
                          {dbVideos.map((v: any) => (
                            <tr key={v.id} className={`transition-colors ${isDark ? "hover:bg-dark-700/50" : "hover:bg-gray-50"}`}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {v.img ? <img src={v.img} alt="" className="w-14 h-9 object-cover rounded-lg" /> : <div className="w-14 h-9 rounded-lg bg-gray-200 dark:bg-dark-700 flex items-center justify-center text-xs">🎬</div>}
                                  <div>
                                    <div className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{v.title}</div>
                                    <div className={`text-xs max-w-[220px] truncate ${isDark ? "text-gray-500" : "text-gray-400"}`}>{v.desc}</div>
                                  </div>
                                </div>
                              </td>
                              <td className={`px-4 py-3 text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{v.price}</td>
                              <td className={`px-4 py-3 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>{v.lessons}</td>
                              <td className={`px-4 py-3 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>{v.dur}</td>
                              <td className={`px-4 py-3 text-xs max-w-[180px] truncate ${v.video_url ? (isDark ? "text-gray-400" : "text-gray-500") : "text-red-500 font-bold"}`}>{v.video_url || "⚠ No URL set"}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => openVideoForm(v)} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-700">Edit</button>
                                  <button onClick={() => deleteVideo(v.id)} className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-700">Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CONTENT - Video Requests */}
            {activeSection === "content" && (
              <div className="space-y-4">
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Video Requests - Approve to Unlock</h3>
                {videoReqsLoading ? <div className={`text-sm ${isDark?"text-gray-400":"text-gray-500"}`}>Loading...</div> : videoReqs.length===0 ? <div className={`text-sm ${isDark?"text-gray-400":"text-gray-500"} border rounded-xl p-6 text-center ${isDark?"bg-dark-800 border-dark-700":"bg-white border-gray-100"}`}>No video requests yet. When users click "Request" on videos page, it will appear here.</div> : (
                  <div className={`${isDark?"bg-dark-800 border-dark-700":"bg-white border-gray-100"} border rounded-2xl overflow-hidden`}>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className={isDark?"bg-dark-700":"bg-gray-50"}><th className="text-left px-4 py-3 text-xs font-semibold uppercase">User</th><th className="text-left px-4 py-3 text-xs font-semibold uppercase">Video</th><th className="text-left px-4 py-3 text-xs font-semibold uppercase">Status</th><th className="text-left px-4 py-3 text-xs font-semibold uppercase">Date</th><th className="text-left px-4 py-3 text-xs font-semibold uppercase">Action</th></tr></thead>
                        <tbody className={`divide-y ${isDark?"divide-dark-700":"divide-gray-100"}`}>
                          {videoReqs.map((r:any)=> (
                            <tr key={r.id}>
                              <td className={`px-4 py-3 text-sm ${isDark?"text-gray-300":"text-gray-700"}`}>{r.email}<br/><span className="text-xs text-gray-500">{r.first_name}</span></td>
                              <td className={`px-4 py-3 text-sm font-medium ${isDark?"text-white":"text-gray-900"}`}>{r.video_title} <span className="text-xs text-gray-500">({r.video_id})</span></td>
                              <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${r.status==='approved'?'bg-green-100 text-green-700': r.status==='rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{r.status}</span></td>
                              <td className={`px-4 py-3 text-xs ${isDark?"text-gray-400":"text-gray-500"}`}>{new Date(r.created_at).toLocaleString()}</td>
                              <td className="px-4 py-3 flex gap-2">
                                {r.status!=='approved' && <button onClick={()=>handleVideoAction(r.id,'approved')} className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-green-700">Approve</button>}
                                {r.status!=='rejected' && <button onClick={()=>handleVideoAction(r.id,'rejected')} className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-700">Reject</button>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS */}
            {activeSection === "settings" && (
              <div className="space-y-4">
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{t("settings")}</h3>

                {/* Limited Offer Banner Control */}
                <div className={`${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"} border rounded-2xl p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>⏰ Limited Offer Banner</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={offerSettings.enabled} onChange={(e) => setOfferSettings({ ...offerSettings, enabled: e.target.checked })} className="w-4 h-4 accent-blue-600" />
                      <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>{offerSettings.enabled ? "Visible" : "Hidden"}</span>
                    </label>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className={`text-xs font-semibold mb-1 block ${isDark ? "text-gray-400" : "text-gray-500"}`}>Title</label>
                      <input type="text" value={offerSettings.title} onChange={(e) => setOfferSettings({ ...offerSettings, title: e.target.value })} className={`w-full px-3 py-2.5 rounded-xl text-sm border outline-none ${isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`} />
                    </div>
                    <div>
                      <label className={`text-xs font-semibold mb-1 block ${isDark ? "text-gray-400" : "text-gray-500"}`}>Subtitle</label>
                      <input type="text" value={offerSettings.subtitle} onChange={(e) => setOfferSettings({ ...offerSettings, subtitle: e.target.value })} className={`w-full px-3 py-2.5 rounded-xl text-sm border outline-none ${isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`} />
                    </div>
                    <div>
                      <label className={`text-xs font-semibold mb-1 block ${isDark ? "text-gray-400" : "text-gray-500"}`}>Deadline (countdown end)</label>
                      <input type="datetime-local" value={offerSettings.deadline} onChange={(e) => setOfferSettings({ ...offerSettings, deadline: e.target.value })} className={`w-full px-3 py-2.5 rounded-xl text-sm border outline-none ${isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`} />
                    </div>
                    <div>
                      <label className={`text-xs font-semibold mb-1 block ${isDark ? "text-gray-400" : "text-gray-500"}`}>Button Text</label>
                      <input type="text" value={offerSettings.ctaText} onChange={(e) => setOfferSettings({ ...offerSettings, ctaText: e.target.value })} className={`w-full px-3 py-2.5 rounded-xl text-sm border outline-none ${isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`} />
                    </div>
                  </div>
                  <button onClick={saveOfferSettings} className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">{t("saveSettings")}</button>
                </div>

                {/* Site Info — editable + save-able */}
                <div className={`${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"} border rounded-2xl p-6`}>
                  <h4 className={`font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>🌐 Site Info</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className={`text-xs font-semibold mb-1 block ${isDark ? "text-gray-400" : "text-gray-500"}`}>{t("siteName")}</label>
                      <input type="text" value={siteSettings.site_name} onChange={(e) => setSiteSettings({ ...siteSettings, site_name: e.target.value })} className={`w-full px-3 py-2.5 rounded-xl text-sm border outline-none ${isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`} />
                    </div>
                    <div>
                      <label className={`text-xs font-semibold mb-1 block ${isDark ? "text-gray-400" : "text-gray-500"}`}>{t("supportEmail")}</label>
                      <input type="email" value={siteSettings.support_email} onChange={(e) => setSiteSettings({ ...siteSettings, support_email: e.target.value })} className={`w-full px-3 py-2.5 rounded-xl text-sm border outline-none ${isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`} />
                    </div>
                    <div>
                      <label className={`text-xs font-semibold mb-1 block ${isDark ? "text-gray-400" : "text-gray-500"}`}>{t("telegramLink")}</label>
                      <input type="text" value={siteSettings.telegram_link} onChange={(e) => setSiteSettings({ ...siteSettings, telegram_link: e.target.value })} className={`w-full px-3 py-2.5 rounded-xl text-sm border outline-none ${isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`} />
                    </div>
                    <div>
                      <label className={`text-xs font-semibold mb-1 block ${isDark ? "text-gray-400" : "text-gray-500"}`}>{t("maxFreeSignals")}</label>
                      <input type="number" min="0" value={siteSettings.max_free_signals} onChange={(e) => setSiteSettings({ ...siteSettings, max_free_signals: e.target.value })} className={`w-full px-3 py-2.5 rounded-xl text-sm border outline-none ${isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`} />
                    </div>
                  </div>
                  <button onClick={saveSiteSettings} className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">{t("saveSettings")}</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  )
}
