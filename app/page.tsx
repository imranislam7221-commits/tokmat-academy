"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, useRef } from "react"
import { useTheme } from "@/components/ThemeProvider"
import { t as translate, type Locale } from "@/lib/translations"
import { useSiteSettings } from "@/lib/useSiteSettings"

// Animated Counter Component - counts up when page loads
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const steps = 60
    const interval = duration / steps
    let current = 0
    const timer = setInterval(() => {
      current++
      const progress = current / steps
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (current >= steps) {
        setCount(end)
        clearInterval(timer)
      }
    }, interval)
    return () => clearInterval(timer)
  }, [end, duration])

  return <div>{count.toLocaleString()}{suffix}</div>
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en")
  const [mounted, setMounted] = useState(false)
  const [visibleReviews, setVisibleReviews] = useState(6)
  
  const { theme } = useTheme()
  const { telegramLink } = useSiteSettings()
  const isDark = theme === "dark"

  const t = (key: string) => translate(locale, key)

  const handleCheckout = async (product: string) => {
    // Real session check — server theke user ane, na thakle register e pathao
    try {
      const me = await fetch("/api/auth").then(r => r.json());
      const email = me?.user?.email;
      if (!me.ok || !email) { window.location.href = "/register"; return; }
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product, email }) });
      const j = await res.json();
      if (j.mock) {
        // mock unlock - store plan locally
        localStorage.setItem("tokmat_plan", product);
        const toast = document.createElement("div");
        toast.textContent = "Mock checkout success! Plan: " + product + " (add LemonSqueezy keys for real payment)";
        toast.className = "fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl z-50 text-sm font-bold";
        document.body.appendChild(toast);
        setTimeout(()=>{ toast.remove(); window.location.href = j.url || "/dashboard"; }, 1200);
        return;
      }
      if (j.url) window.location.href = j.url;
    } catch {
      window.location.href = "/register";
    }
  }

  // Live market data state — SHURU TE KHALI (kokhono mock price dekhabe na, API theke real asbe)
  const [signals, setSignals] = useState<any[]>([])
  const [marketData, setMarketData] = useState<any[]>([])

  // Limited Offer banner — admin panel theke control hoy (/api/settings)
  const [offer, setOffer] = useState({
    enabled: true,
    title: "LIMITED OFFER",
    subtitle: "Premium Signals Discount Ends Soon!",
    deadline: "",
    ctaText: "Join Now — It's Free",
    countdown: { days: "00", hours: "00", mins: "00", secs: "00" },
  })

  // Offer settings load + real countdown tick
  useEffect(() => {
    fetch("/api/settings").then(r=>r.json()).then(j=>{
      if (j.ok && j.settings) {
        setOffer((prev) => ({ ...prev, enabled: j.settings.offer_enabled !== "false", title: j.settings.offer_title || prev.title, subtitle: j.settings.offer_subtitle || prev.subtitle, deadline: j.settings.offer_deadline || "", ctaText: j.settings.offer_cta_text || prev.ctaText }))
      }
    }).catch(()=>{})
  }, [])

  useEffect(() => {
    if (!offer.deadline) return
    const tick = () => {
      const diff = new Date(offer.deadline).getTime() - Date.now()
      if (!isFinite(diff) || diff <= 0) {
        setOffer((prev) => ({ ...prev, countdown: { days: "00", hours: "00", mins: "00", secs: "00" } }))
        return
      }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      const pad = (n: number) => String(n).padStart(2, "0")
      setOffer((prev) => ({ ...prev, countdown: { days: pad(d), hours: pad(h), mins: pad(m), secs: pad(s) } }))
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [offer.deadline])

  // Fetch live market data + signals from API
  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const res = await fetch("/api/market")
        const json = await res.json()
        if (!json.fallback) {
          if (json.ticker && json.ticker.length > 0) {
            setMarketData(json.ticker)
          }
          if (json.signals && json.signals.length > 0) {
            setSignals(json.signals)
          }
        }
      } catch {
        // Keep default data on error
      }
    }
    fetchMarket()
    const interval = setInterval(fetchMarket, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setLocale((params.get("locale") || "en") as Locale)
    setMounted(true)
  }, [])

  return (
    <main className={`min-h-screen ${isDark ? "bg-dark-950" : "bg-white"}`}>
      {/* ===== Hero Section ===== */}
      <section className="hero-bg relative min-h-[92vh] flex items-center -mt-20 noise-overlay">
        <div className="absolute top-32 left-[5%] w-20 h-20 border border-blue-500/10 rounded-2xl rotate-12 animate-float opacity-40"></div>
        <div className="absolute top-48 right-[10%] w-16 h-16 border border-green-500/10 rounded-xl -rotate-6 animate-float opacity-30" style={{animationDelay: "1s"}}></div>
        <div className="absolute bottom-32 left-[15%] w-24 h-24 border border-purple-500/10 rounded-3xl rotate-45 animate-float opacity-20" style={{animationDelay: "2s"}}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          {/* Join Telegram + YouTube Buttons - Top Center */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-12 sm:gap-40 mb-8 sm:-translate-x-8">
            <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-3.5 rounded-full shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 border border-white/20">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              {t("joinTelegram")}
            </a>
            <span className="hidden sm:inline text-white/30 text-sm">|</span>
            <a href="https://youtube.com/@tokmatsecreteducational?si=XGfM-dXS66D40dEy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-3.5 rounded-full shadow-2xl shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 transition-all duration-300 border border-white/20">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              {t("joinYouTube")}
            </a>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm text-gray-300">{t("heroBadge")}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6">
                <span className="block">{t("heroTitle1")}</span>
                <span className="block gradient-text">{t("heroTitle2")}</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-300/80 mb-10 max-w-lg leading-relaxed">
                {t("heroSubtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/full-courses" className="btn-accent !rounded-xl text-center">
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    Click Here to Full Courses
                  </span>
                </Link>
                <Link href="/register" className="btn-outline !rounded-xl text-center">
                  {t("getStarted")}
                </Link>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex -space-x-3">
                  {["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"].map((c, i) => (
                    <div key={i} className={`w-9 h-9 rounded-full ${c} border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-400">
                  <span className="text-white font-semibold">50,000+</span> {t("trustText")}
                </div>
              </div>
            </div>

            {/* Right - 2x2 Video Section */}
            <div className="animate-fade-in-up" style={{animationDelay: "0.3s"}}>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-5 text-center">{t("videoSectionTitle")}</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 1, title: "Forex Basics", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=220&fit=crop", dur: "12:30" },
                  { id: 2, title: "Technical Analysis", img: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=220&fit=crop", dur: "18:45" },
                  { id: 3, title: "Risk Management", img: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=400&h=220&fit=crop", dur: "09:20" },
                  { id: 4, title: "Advanced Strategies", img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=220&fit=crop", dur: "22:10" },
                ].map((v) => (
                  <a
                    key={v.id}
                    href={`/videos?locale=${locale}`}
                    className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105 text-left"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <Image src={v.img} alt={v.title} width={400} height={220} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <svg className="w-4 h-4 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">{v.dur}</span>
                    </div>
                    <div className="bg-dark-900/80 backdrop-blur px-3 py-2">
                      <div className="text-white font-semibold text-xs sm:text-sm truncate">{v.title}</div>
                    </div>
                  </a>
                ))}
              </div>
              {/* See All Videos Link */}
              <Link href={`/videos?locale=${locale}`} className="block text-center mt-5 text-blue-400 hover:text-blue-300 font-semibold text-sm transition-colors">
                {t("seeAllVideos")} →
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* ===== Stats Section (Animated Counters) ===== */}
      <section className="relative -mt-16 z-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className={`rounded-2xl shadow-elevated border backdrop-blur-xl p-8 transition-colors ${isDark ? "bg-white/5 border-white/10" : "bg-white/60 border-white/30"}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { end: 50000, suffix: "+", label: t("statsTraders"), color: "from-blue-500 to-blue-600", icon: "👥" },
                { end: 16000, suffix: "+", label: t("statsSignals"), color: "from-green-500 to-emerald-600", icon: "📡" },
                { end: 85, suffix: "%", label: t("statsWinRate"), color: "from-purple-500 to-purple-600", icon: "🎯" },
                { end: 100, suffix: "+", label: t("statsCountries"), color: "from-orange-500 to-orange-600", icon: "🌍" },
              ].map((stat, i) => (
                <div key={i} className="text-center group cursor-default">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className={`text-2xl md:text-3xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent animate-count-fade`} style={{ animationDelay: `${i * 0.15}s` }}>
                    <AnimatedCounter end={stat.end} suffix={stat.suffix} duration={2000} />
                  </div>
                  <div className={`text-sm font-medium mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Live Market Ticker ===== */}
      <section className="relative z-20 py-4 overflow-hidden bg-dark-950 border-y border-white/5">
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-r from-dark-950 to-transparent"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-l from-dark-950 to-transparent"></div>
          {marketData.length === 0 ? (
            <div className="flex items-center justify-center py-2">
              <span className="text-gray-500 text-xs animate-pulse">⏳ Loading live market prices...</span>
            </div>
          ) : (
            <div className="flex animate-ticker whitespace-nowrap w-max">
              {[...Array(2)].map((_, setIdx) => (
                <div key={setIdx} className="flex items-center gap-10 mr-10">
                  {marketData.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">{item.symbol}</span>
                      <span className="text-base font-extrabold text-white trading-price">{item.price}</span>
                      <svg className={`w-4 h-4 ${item.up ? "text-green-400" : "text-red-400"}`} fill="currentColor" viewBox="0 0 20 20">
                        {item.up ? (
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        )}
                      </svg>
                      <span className={`text-sm font-semibold ${item.up ? "text-green-400" : "text-red-400"}`}>{item.change}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== Pricing Plans Section - Premium Redesign ===== */}
      <section className="py-24 px-4 relative overflow-hidden bg-[#020617]">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-indigo-700 to-purple-800 opacity-95"></div>
        <div className="absolute inset-0 bg-grid opacity-[0.07]"></div>
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-fuchsia-500/20 rounded-full blur-[120px]"></div>
        
        <div className="relative max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-white/90 text-xs font-bold tracking-widest uppercase">Signal Plans</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">{t("seeOurPlans")}</h2>
            <p className="text-white/70 text-sm md:text-base max-w-2xl mx-auto">{t("videoSeparatePayment")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {/* Free Plan */}
            <div className="group relative rounded-[24px] bg-white/[0.06] backdrop-blur-xl border border-white/15 p-[1px] hover:border-white/25 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/20 flex flex-col">
              <div className="rounded-[23px] bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-7 flex flex-col h-full">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-white mb-1">{t("planFree")}</h3>
                <p className="text-white/50 text-xs font-medium tracking-widest uppercase mb-4">Starter</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">$0</span>
                  <span className="text-white/50 text-sm font-medium">/forever</span>
                </div>
                <div className="h-px bg-white/10 mb-6"></div>
                <ul className="space-y-3.5 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-white/85">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span><b className="text-white">{t("plan2to4")}</b> {t("planSignalsPerMonth")}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white/85">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span><b className="text-white">{t("plan900to1500")}</b> {t("planPointsTarget")}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white/85">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span>{t("planBasicSetup")}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white/85">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span>{t("planAllBrokers")}</span>
                  </li>
                </ul>
                <Link href="/register" className="w-full block text-center bg-white text-gray-900 font-black py-3.5 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:shadow-lg hover:shadow-white/10 text-sm tracking-wide">
                  {t("joinPlanBtn")}
                </Link>
                <p className="text-center text-white/40 text-[11px] mt-3">No credit card required</p>
              </div>
            </div>

            {/* Premium Plan - Featured */}
            <div className="group relative rounded-[24px] bg-gradient-to-b from-blue-500 to-cyan-500 p-[1.5px] shadow-2xl shadow-blue-600/30 hover:shadow-blue-600/40 transition-all duration-500 hover:-translate-y-2 md:scale-[1.03] md:-mt-2 md:mb-2 flex flex-col">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[11px] font-black tracking-widest px-5 py-1.5 rounded-full shadow-lg shadow-orange-500/25 flex items-center gap-1.5 whitespace-nowrap z-10">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                {t("recommended")}
              </div>
              <div className="rounded-[22px] bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] p-7 pt-9 flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/15 rounded-full blur-3xl"></div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-5 shadow-lg shadow-blue-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-white mb-1">{t("planPremium")}</h3>
                <p className="text-blue-300/70 text-xs font-bold tracking-widest uppercase mb-4">Most Popular</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-black text-white">$49</span>
                  <span className="text-white/50 text-sm font-medium">/month</span>
                </div>
                <p className="text-emerald-400 text-xs font-bold mb-6 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Save 40% yearly
                </p>
                <div className="h-px bg-white/10 mb-6"></div>
                <ul className="space-y-3.5 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-white">
                    <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span><b>{t("plan8to14")}</b> {t("planSignalsPerMonth")}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white">
                    <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span><b>{t("plan3000to7000")}</b> {t("planPointsTarget")}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white">
                    <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span>{t("planAccurate")} & VIP Support</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white">
                    <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span>{t("planAllBrokers")}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-blue-200">
                    <span className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span>Live Telegram Alerts</span>
                  </li>
                </ul>
                <button onClick={() => handleCheckout("premium")} className="w-full block text-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black py-3.5 rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-[1.02] text-sm tracking-wide">
                  {t("joinPlanBtn")} →
                </button>
                <p className="text-center text-white/40 text-[11px] mt-3">Cancel anytime • 7-day guarantee</p>
              </div>
            </div>

            {/* Supreme Plan */}
            <div className="group relative rounded-[24px] bg-white/[0.06] backdrop-blur-xl border border-amber-500/20 p-[1px] hover:border-amber-500/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col">
              <div className="rounded-[23px] bg-gradient-to-b from-amber-500/[0.08] via-white/[0.03] to-transparent p-7 flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mb-5 shadow-lg shadow-amber-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-white mb-1">{t("planSupreme")}</h3>
                <p className="text-amber-300/60 text-xs font-bold tracking-widest uppercase mb-4">For Professionals</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">$99</span>
                  <span className="text-white/50 text-sm font-medium">/month</span>
                </div>
                <div className="h-px bg-white/10 mb-6"></div>
                <ul className="space-y-3.5 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-white/90">
                    <span className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span><b className="text-white">{t("plan16to25")}</b> {t("planSignalsPerMonth")}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white/90">
                    <span className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span><b className="text-white">{t("plan7000to15000")}</b> {t("planPointsTarget")}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white/90">
                    <span className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span>{t("planAccurate")} + 1:1 Mentorship</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white/90">
                    <span className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span>{t("planAllBrokers")}</span>
                  </li>
                </ul>
                <button onClick={() => handleCheckout("supreme")} className="w-full block text-center bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black py-3.5 rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02] text-sm tracking-wide">
                  {t("joinPlanBtn")}
                </button>
                <p className="text-center text-white/40 text-[11px] mt-3">Best value for serious traders</p>
              </div>
            </div>
          </div>

          {/* Bottom trust row */}
          <div className="mt-10 flex flex-wrap justify-center items-center gap-6 text-white/50 text-xs">
            <span className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> Secure Payment</span>
            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
            <span className="flex items-center gap-2"><svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Instant Access</span>
            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
            <span className="flex items-center gap-2"><svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> 24/7 Support</span>
          </div>
        </div>
      </section>
      
      {/* ===== Limited Offer Countdown Banner (admin-controlled) ===== */}
      {offer.enabled && (
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className={`rounded-2xl overflow-hidden border backdrop-blur-xl transition-all hover:shadow-xl ${isDark ? "bg-white/5 border-white/10" : "bg-white/60 border-white/30"}`}>
            <div className="grid md:grid-cols-2 items-center">
              {/* Left - Offer Text */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 flex items-center gap-4">
                <div className="text-5xl">⏰</div>
                <div>
                  <h3 className="text-white font-extrabold text-2xl">{offer.title}</h3>
                  <p className="text-red-100 text-sm mt-1">{offer.subtitle}</p>
                </div>
              </div>
              {/* Right - Countdown (real, admin-set deadline theke) */}
              <div className="p-8 flex items-center justify-center gap-6">
                {[
                  { v: offer.countdown.days, label: "Days" },
                  { v: offer.countdown.hours, label: "Hours" },
                  { v: offer.countdown.mins, label: "Mins" },
                  { v: offer.countdown.secs, label: "Secs" },
                ].map((u, i) => (
                  <div key={i} className="text-center">
                    <div className={`text-3xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>{u.v}</div>
                    <div className={`text-xs uppercase ${isDark ? "text-gray-500" : "text-gray-400"}`}>{u.label}</div>
                  </div>
                )).flatMap((el, i) => (i === 0 ? [el] : [ <div key={`sep-${i}`} className={`text-2xl ${isDark ? "text-gray-600" : "text-gray-300"}`}>:</div>, el ]))}
                <Link href="/register" className="ml-4 bg-red-600 text-white font-bold px-6 py-3 rounded-full hover:bg-red-700 transition-all shadow-lg shadow-red-500/20">
                  {offer.ctaText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ===== Features Section ===== */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className={`inline-block text-sm font-semibold px-4 py-1.5 rounded-full mb-4 ${isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
              {t("featuresBadge")}
            </div>
            <h2 className={`section-title mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{t("whyTitle")}</h2>
            <p className="section-subtitle">{t("whySubtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "📡", title: t("signalsTitle"), desc: t("signalsDesc"), gradient: "from-blue-500 to-blue-600", glow: "shadow-blue-500/20 hover:shadow-blue-500/40", href: "/news-analysis" },
              { icon: "📚", title: t("educationTitle"), desc: t("educationDesc"), gradient: "from-purple-500 to-purple-600", glow: "shadow-purple-500/20 hover:shadow-purple-500/40", href: "/full-courses" },
              { icon: "✅", title: t("resultsTitle"), desc: t("resultsDesc"), gradient: "from-green-500 to-green-600", glow: "shadow-green-500/20 hover:shadow-green-500/40", href: "/results" },
              { icon: "🎧", title: t("supportTitle"), desc: t("supportDesc"), gradient: "from-orange-500 to-orange-600", glow: "shadow-orange-500/20 hover:shadow-orange-500/40", href: "/faq" },
            ].map((feature: any, i: number) => (
              <a
                key={i}
                href={feature.href}
                className={`group rounded-2xl p-8 backdrop-blur-xl border transition-all hover:shadow-xl hover:scale-105 cursor-pointer ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white/60 border-white/30 hover:bg-white/80"}`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 text-2xl`}>
                  {feature.icon}
                </div>
                <h3 className={`text-lg font-bold mb-3 group-hover:text-blue-600 transition-colors ${isDark ? "text-white" : "text-gray-900"}`}>{feature.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>{feature.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Live Signal Preview ===== */}
      <section className="py-6 sm:py-10 px-3 sm:px-4 bg-dark-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-3 sm:mb-5">
            <div className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full border border-green-500/20 mb-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
              </span>
              {t("liveSignalsBadge")}
            </div>
            <h2 className="text-base sm:text-xl md:text-2xl font-extrabold text-white mb-0.5">{t("liveSignalsTitle")}</h2>
            <p className="text-gray-400 text-[10px] sm:text-xs max-w-xs mx-auto">{t("liveSignalsDesc")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 max-w-4xl mx-auto items-center">
            {signals.length === 0 && (
              <div className="col-span-full text-center py-6 text-gray-500 text-xs animate-pulse">⏳ Fetching live signals...</div>
            )}
            {signals.map((signal: any, i: number) => (
              <div key={i} className={`w-full bg-white/5 backdrop-blur-xl border rounded-lg p-2.5 sm:p-4 transition-all duration-500 ${signal.pair === "XAU/USD" ? "border-yellow-500/30 hover:shadow-yellow-500/10 hover:shadow-2xl hover:border-yellow-500/50 md:scale-105" : "border-white/10 hover:border-green-500/30 hover:shadow-green-500/10 hover:shadow-xl"}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center shadow-lg ${signal.pair === "XAU/USD" ? "bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-yellow-500/20" : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20"}`}>
                      <span className="text-[10px] sm:text-sm">{signal.pair === "XAU/USD" ? "🥇" : "📊"}</span>
                    </div>
                    <div>
                      <div className="text-white font-extrabold text-xs sm:text-base leading-tight">{signal.pair}</div>
                      <div className="text-gray-500 text-[9px] sm:text-[10px]">{signal.time}</div>
                    </div>
                  </div>
                  <span className={`signal-badge text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 ${signal.direction === "BUY" ? "signal-buy" : "signal-sell"}`}>{signal.direction}</span>
                </div>

                {/* Price Levels */}
                <div className="space-y-1 mb-2">
                  <div className="flex items-center justify-between bg-white/5 rounded px-2 py-1">
                    <span className="text-gray-400 font-medium text-[9px] sm:text-[10px]">{t("entry")}</span>
                    <span className="text-white trading-price font-bold text-[10px] sm:text-xs">{signal.entry}</span>
                  </div>
                  <div className="flex items-center justify-between bg-green-500/5 border border-green-500/10 rounded px-2 py-1">
                    <span className="text-green-400 font-medium text-[9px] sm:text-[10px]">{t("takeProfit")}</span>
                    <span className="text-green-400 trading-price font-bold text-[10px] sm:text-xs">{signal.tp}</span>
                  </div>
                  <div className="flex items-center justify-between bg-red-500/5 border border-red-500/10 rounded px-2 py-1">
                    <span className="text-red-400 font-medium text-[9px] sm:text-[10px]">{t("stopLoss")}</span>
                    <span className="text-red-400 trading-price font-bold text-[10px] sm:text-xs">{signal.sl}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-white/10 pt-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500 text-[9px]">Profit:</span>
                    <span className="text-green-400 font-bold text-[10px] sm:text-xs trading-price">{signal.profit}</span>
                  </div>
                  <span className={`signal-badge border text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 ${signal.status === "TP Hit" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}`}>{signal.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Testimonials Section ===== */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className={`inline-block text-sm font-semibold px-4 py-1.5 rounded-full mb-4 ${isDark ? "bg-yellow-900/30 text-yellow-400" : "bg-yellow-50 text-yellow-600"}`}>
              {t("testimonialsBadge")}
            </div>
            <h2 className={`section-title mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{t("testimonialsTitle")}</h2>
            <p className="section-subtitle">{t("testimonialsSubtitle")}</p>
          </div>

          {(() => {
            const baseTexts = [
              "Best forex signals I've ever used. The win rate is insane! I've made over $5,000 in just 2 months.",
              "The education courses changed my life. I went from complete beginner to profitable trader in 3 months.",
              "Professional analysis and amazing support team. They respond within minutes on Telegram.",
              "Signals are very accurate. Made $3,200 last month following their strategy.",
              "Tokmat Academy is the most trusted forex education platform. Highly recommended!",
              "Excellent risk management guidance. My account is now consistently profitable.",
              "Live signals helped me pass my funded account challenge in 2 weeks!",
              "Best investment I made. The premium plan pays for itself in a week.",
              "Very detailed analysis. I learn something new every day.",
              "Support team is fantastic. Always ready to help with any question.",
            ];
            const names = ["Ahmed R.", "Sarah M.", "Pierre L.", "John D.", "Ali H.", "Emma W.", "Mohammed K.", "David S.", "Fatima A.", "Carlos P.", "Linda T.", "Omar F.", "Sofia R.", "Kenji T.", "Nina P.", "Raj K.", "Elena V.", "Hassan M.", "Yuki S.", "Aisha K."];
            const countries = ["Saudi Arabia", "Malaysia", "France", "USA", "UAE", "UK", "Kuwait", "Canada", "Qatar", "Spain", "Germany", "Egypt", "Italy", "Japan", "Brazil", "India", "Russia", "Morocco", "Korea", "Indonesia"];
            // Khuchra profit figure — round number na, jate realistic lage
            const profits = ["+$5,193", "+$3,847", "+$7,126", "+$2,372", "+$6,534", "+$4,918", "+$8,241", "+$3,057", "+$5,829", "+$9,346", "+$2,874", "+$6,152", "+$4,381", "+$7,793", "+$3,628", "+$5,467", "+$8,912", "+$4,235", "+$6,749", "+$3,916"];
            const allReviews = Array.from({ length: 120 }, (_, i) => ({
              text: baseTexts[i % baseTexts.length],
              name: names[i % names.length],
              country: countries[i % countries.length],
              profit: profits[i % profits.length],
              initial: names[i % names.length].charAt(0),
            }));
            return (
              <>
                <div className="grid md:grid-cols-3 gap-6">
                  {allReviews.slice(0, visibleReviews).map((r, i) => (
                    <div key={i} className="testimonial-card group">
                      <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <svg key={j} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        ))}
                      </div>
                      <p className={`text-sm leading-relaxed mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{r.text}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                            {r.initial}
                          </div>
                          <div>
                            <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{r.name}</div>
                            <div className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{r.country}</div>
                          </div>
                        </div>
                        <span className="text-green-500 font-bold text-sm trading-price">{r.profit}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {visibleReviews < 120 && (
                  <div className="text-center mt-8">
                    <button onClick={() => setVisibleReviews(v => Math.min(v + 3, 120))} className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 text-gray-700 dark:text-gray-300 font-semibold px-8 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors shadow-sm">
                      See More ({visibleReviews}/120)
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">{t("ctaTitle")}</h2>
          <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">{t("ctaDesc")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl">
              {t("joinNow")}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link href="/results" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-white/20 transition-all">
              {t("viewResults")}
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className={`py-16 px-4 ${isDark ? "bg-dark-900" : "bg-gray-900"} text-gray-400`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-xl font-extrabold text-white">Tokmat <span className="text-blue-500">Academy</span></span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{t("footerDesc")}</p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">{t("footerPlatform")}</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  { href: "/signals", label: t("navSignals") },
                  { href: "/results", label: t("navResults") },
                  { href: "/education", label: t("navEducation") },
                  { href: "/news-analysis", label: t("navNews") },
                ].map((link) => (
                  <li key={link.href}><a href={link.href} className="hover:text-white transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">{t("footerCompany")}</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  { href: "/about-us", label: t("navAbout") },
                  { href: "/faq", label: t("navFaq") },
                  { href: "/brokers", label: t("navBrokers") },
                  { href: "/contact", label: t("navContact") },
                ].map((link) => (
                  <li key={link.href}><a href={link.href} className="hover:text-white transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">{t("footerConnect")}</h4>
              <div className="flex items-center gap-3">
                <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center hover:bg-blue-600 transition-colors group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L8.32 13.617l-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/></svg>
                </a>
                <a href="https://youtube.com/@tokmatsecreteducational?si=XGfM-dXS66D40dEy" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center hover:bg-red-600 transition-colors group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-dark-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">&copy; 2024 Tokmat Academy. {t("footerRights")}</p>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-white transition-colors">{t("footerPrivacy")}</a>
              <a href="#" className="hover:text-white transition-colors">{t("footerTerms")}</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}