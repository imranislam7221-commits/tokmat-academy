"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/components/ThemeProvider"
import { t as translate, type Locale } from "@/lib/translations"

const allVideosFallback: any[] = [] // videos ekhon /api/videos (DB) theke ase

export default function VideosPage() {
  const [locale, setLocale] = useState<Locale>("en")
  useEffect(() => { const p = new URLSearchParams(window.location.search); setLocale((p.get("locale") || "en") as Locale); }, [])
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const t = (key: string) => translate(locale, key)
  const [myRequests, setMyRequests] = useState<any[]>([])
  // Videos DB theke load hoy — admin panel theke add/edit/delete kora jay
  const [allVideos, setAllVideos] = useState<any[]>([])
  const [videosLoading, setVideosLoading] = useState(true)
  useEffect(()=>{
    fetch("/api/videos").then(r=>r.json()).then(j=>{ setAllVideos(j.videos||[]); setVideosLoading(false) }).catch(()=> setVideosLoading(false))
  }, [])
  const [hasFullAccess, setHasFullAccess] = useState(false)
  useEffect(()=>{ fetch("/api/video-requests", { cache: "no-store", credentials: "include" }).then(r=>r.json()).then(j=>{ if(j.ok){ setMyRequests(j.requests||[]); setHasFullAccess(!!j.fullAccess || (j.requests||[]).some((r:any)=> r.video_id==="full_access" && r.status==="approved"))}}).catch(()=>{}) }, [])
  const getStatus = (vid:string) => myRequests.find((r:any)=> String(r.video_id)===String(vid))?.status
  const getRequestId = (vid:string) => myRequests.find((r:any)=> String(r.video_id)===String(vid))?.id
  const cancelRequest = async (vid:string) => {
    const id = getRequestId(vid)
    if (!id) return
    try {
      const res = await fetch(`/api/video-requests?id=${id}`, { method: "DELETE" })
      const j = await res.json()
      const msg = j.ok ? "Request cancelled" : (j.error || "Failed")
      const el=document.createElement("div"); el.textContent=msg; el.className=`fixed bottom-6 right-6 ${j.ok?"bg-green-600":"bg-red-600"} text-white px-4 py-2 rounded-xl shadow-lg z-[60] text-sm font-bold`; document.body.appendChild(el); setTimeout(()=>el.remove(),2500)
      if (j.ok) setMyRequests((prev:any)=> prev.filter((r:any)=> String(r.id)!==String(id)))
    } catch {}
  }
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
        {videosLoading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        )}
        {!videosLoading && allVideos.length === 0 && (
          <div className={`text-center py-20 ${isDark ? "text-gray-400" : "text-gray-500"}`}>No videos available yet.</div>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allVideos.map((v: any) => (
            <div key={v.id} className={`group rounded-2xl overflow-hidden border backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${isDark ? "bg-dark-800 border-dark-700 hover:border-purple-500/50 hover:shadow-purple-500/20" : "bg-white border-gray-100 hover:border-purple-300 hover:shadow-purple-500/10"}`}>
              <div className="relative aspect-video overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.img} alt={v.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
                {/* Admin-set title/desc direct dekhano — khali hole translated fallback */}
                <div className={`font-semibold text-sm mb-1 truncate ${isDark ? "text-white" : "text-gray-900"}`}>{v.title || t(`vid${v.id}Title`)}</div>
                <p className={`text-xs mb-3 line-clamp-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{v.description || v.desc || t(`vid${v.id}Desc`)}</p>
                {(() => {
                  const st = getStatus(String(v.id));
                  // Full Access active hole sob video Watch Now
                  if (hasFullAccess) return <button onClick={()=> window.location.href=`/videos/${v.id}` } className="block w-full font-bold text-sm py-2.5 rounded-xl text-center bg-green-600 hover:bg-green-700 text-white">▶ {t("watchNow")}</button>;
                  if (st==="approved") return <button onClick={()=> window.location.href=`/videos/${v.id}` } className="block w-full font-bold text-sm py-2.5 rounded-xl text-center bg-green-600 hover:bg-green-700 text-white">▶ {t("watchNow")}</button>;
                  if (st==="pending") return (
                    <div className="flex gap-1.5">
                      <button disabled className="flex-1 font-bold text-sm py-2.5 rounded-xl text-center bg-yellow-500 text-white opacity-80 cursor-not-allowed">⏳ {t("pendingApproval")}</button>
                      <button onClick={()=> cancelRequest(String(v.id))} title="Cancel request" className={`px-3 rounded-xl text-red-500 hover:bg-red-500/10 font-bold text-sm transition-colors ${isDark ? "border border-dark-600" : "border border-gray-200"}`}>✕</button>
                    </div>
                  );
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