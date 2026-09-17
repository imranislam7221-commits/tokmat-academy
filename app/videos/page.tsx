"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useTheme } from "@/components/ThemeProvider"
import { t as translate, type Locale } from "@/lib/translations"

const allVideos = [
  { id: 1, title: "Forex Basics", desc: "Learn the fundamentals of forex trading.", lessons: 5, dur: "12:30", price: "$5", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=220&fit=crop" },
  { id: 2, title: "Technical Analysis", desc: "Master chart patterns and indicators.", lessons: 8, dur: "18:45", price: "$8", img: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=220&fit=crop" },
  { id: 3, title: "Risk Management", desc: "Protect your capital with proven strategies.", lessons: 4, dur: "09:20", price: "$5", img: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=400&h=220&fit=crop" },
  { id: 4, title: "Advanced Strategies", desc: "Professional strategies used by funded traders.", lessons: 10, dur: "22:10", price: "$12", img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=220&fit=crop" },
  { id: 5, title: "Price Action", desc: "Read charts like institutional traders.", lessons: 6, dur: "15:40", price: "$8", img: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=400&h=220&fit=crop" },
  { id: 6, title: "Trading Psychology", desc: "Master emotions and build a winning mindset.", lessons: 4, dur: "10:15", price: "$5", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=220&fit=crop" },
  { id: 7, title: "Chart Patterns", desc: "Recognize powerful chart formations early.", lessons: 7, dur: "20:05", price: "$10", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=220&fit=crop" },
  { id: 8, title: "Market News Analysis", desc: "Understand how news moves the markets.", lessons: 5, dur: "14:25", price: "$6", img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=220&fit=crop" },
  { id: 9, title: "Support & Resistance", desc: "Identify key levels for entries and exits.", lessons: 6, dur: "17:30", price: "$8", img: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=400&h=220&fit=crop" },
  { id: 10, title: "Candlestick Mastery", desc: "Read price action with candlestick patterns.", lessons: 8, dur: "25:15", price: "$10", img: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=220&fit=crop" },
  { id: 11, title: "Fibonacci Trading", desc: "Use Fibonacci retracements like a pro.", lessons: 5, dur: "13:45", price: "$7", img: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=400&h=220&fit=crop" },
  { id: 12, title: "Forex Fundamentals", desc: "Master the economic calendar and news trading.", lessons: 7, dur: "19:50", price: "$9", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=220&fit=crop" },
]

export default function VideosPage() {
  const [locale, setLocale] = useState<Locale>("en")
  useEffect(() => { const p = new URLSearchParams(window.location.search); setLocale((p.get("locale") || "en") as Locale); }, [])
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const t = (key: string) => translate(locale, key)
  const [myRequests, setMyRequests] = useState<any[]>([])
  useEffect(()=>{ fetch("/api/video-requests").then(r=>r.json()).then(j=>{ if(j.ok) setMyRequests(j.requests||[])}).catch(()=>{}) }, [])
  const getStatus = (vid:string) => myRequests.find((r:any)=> String(r.video_id)===String(vid))?.status
  const handleRequest = async (v:any) => {
    try {
      const me = await fetch("/api/auth", { cache: "no-store", credentials: "include" }).then(r=>r.json());
      if (!me.ok || !me.user) { window.location.href="/register"; return; }
      const res = await fetch("/api/video-requests", { method:"POST", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({ video_id: String(v.id), video_title: v.title }) });
      const j = await res.json();
      const msg = j.ok ? "Request sent! Admin will approve soon." : (j.error||"Failed");
      const el=document.createElement("div"); el.textContent=msg; el.className=`fixed bottom-6 right-6 ${j.ok?"bg-green-600":"bg-red-600"} text-white px-4 py-2 rounded-xl shadow-lg z-50 text-sm font-bold`; document.body.appendChild(el); setTimeout(()=>el.remove(),2500);
      if (j.ok) setMyRequests((prev:any)=> [...prev, j.request]);
    } catch { window.location.href="/register"; }
  }
  const handleCheckout = async (product: string) => {
    try {
      // Real session check — server theke user ane
      const me = await fetch("/api/auth", { cache: "no-store", credentials: "include" }).then(r => r.json());
      const email = me?.user?.email;
      if (!me.ok || !email) { window.location.href = "/register"; return; }
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product, email }) });
      const j = await res.json();
      if (j.mock) { localStorage.setItem("tokmat_plan", product); window.location.href = j.url || "/dashboard"; return; }
      if (j.url) window.location.href = j.url;
    } catch { window.location.href = "/register"; }
  }

  return (
    <main className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-dark-950" : "bg-gray-50"}`}>
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-block bg-white/10 text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/20 mb-4">
            🎬 {t("videoSectionTitle")}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">{t("videoUnlockTitle")}</h1>
          <p className="text-purple-100 text-lg max-w-xl mx-auto">{t("videoUnlockDesc")}</p>
        </div>
      </section>

      {/* Video Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allVideos.map((v) => (
            <div key={v.id} className={`group rounded-2xl overflow-hidden border backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${isDark ? "bg-dark-800 border-dark-700 hover:border-purple-500/50 hover:shadow-purple-500/20" : "bg-white border-gray-100 hover:border-purple-300 hover:shadow-purple-500/10"}`}>
              <div className="relative aspect-video overflow-hidden">
                <Image src={v.img} alt={v.title} width={400} height={220} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
                <span className={`absolute top-3 right-3 text-white text-xs font-bold px-2.5 py-1 rounded-lg ${isDark ? "bg-purple-600" : "bg-purple-500"}`}>{v.price}</span>
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">{v.dur}</span>
              </div>
              <div className="p-4">
                <div className={`font-semibold text-sm mb-1 truncate ${isDark ? "text-white" : "text-gray-900"}`}>{t(`vid${v.id}Title`)}</div>
                <p className={`text-xs mb-3 line-clamp-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{t(`vid${v.id}Desc`)}</p>
                {(() => {
                  const st = getStatus(String(v.id));
                  if (st==="approved") return <button onClick={()=> window.location.href=`/videos/${v.id}` } className="block w-full font-bold text-sm py-2.5 rounded-xl text-center bg-green-600 hover:bg-green-700 text-white">▶ {t("watchNow")}</button>;
                  if (st==="pending") return <button disabled className="block w-full font-bold text-sm py-2.5 rounded-xl text-center bg-yellow-500 text-white opacity-80 cursor-not-allowed">⏳ {t("pendingApproval")}</button>;
                  return <button onClick={()=> handleRequest(v)} className={`block w-full font-bold text-sm py-2.5 rounded-xl text-center transition-colors ${isDark ? "bg-purple-600 hover:bg-purple-500 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"}`}>{t("unlockVideo")} {v.price} - Request</button>;
                })()}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Unlock ALL Videos Plans */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-10"></div>
            <div className="relative">
              <div className="text-center mb-10">
                <h3 className="text-2xl md:text-4xl font-extrabold text-white mb-3">📺 {t("unlockAllVideos")}</h3>
                <p className="text-purple-100 text-lg max-w-xl mx-auto">{t("unlockAllVideosDesc")}</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                  <h3 className="font-bold text-white mb-1">{t("oneMonth")}</h3>
                  <div className="text-4xl font-extrabold text-white mb-1">$29</div>
                  <div className="text-purple-100 text-sm mb-6">{t("perMonth")}</div>
                  <a href="/register" className="block w-full bg-white text-purple-700 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors text-center">{t("unlockVideo")}</a>
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                  <h3 className="font-bold text-white mb-1">{t("sixMonths")}</h3>
                  <div className="text-4xl font-extrabold text-white mb-1">$99</div>
                  <div className="text-purple-100 text-sm mb-6">$16{t("perMonth")}</div>
                  <a href="/register" className="block w-full bg-white text-purple-700 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors text-center">{t("unlockVideo")}</a>
                </div>
                <div className="bg-white border-2 border-yellow-400 rounded-2xl p-8 relative">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-purple-900 text-xs font-bold px-3 py-1 rounded-full">{t("bestValue")}</span>
                  <h3 className="font-bold text-gray-900 mb-1">{t("yearly")}</h3>
                  <div className="text-4xl font-extrabold text-gray-900 mb-1">$199</div>
                  <div className="text-gray-500 text-sm mb-6">$16{t("perMonth")}</div>
                  <a href="/register" className="block w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 font-bold py-3 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-colors text-center">{t("getYearly")}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}