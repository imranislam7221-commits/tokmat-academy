"use client"

import { useEffect, useState, useRef } from "react"
import { useTheme } from "@/components/ThemeProvider"
import { t as translate, type Locale } from "@/lib/translations"

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true)
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return
    let startTime = 0
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [isVisible, end, duration])

  return <div ref={ref}>{count.toLocaleString()}{suffix}</div>
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en")
  const [mounted, setMounted] = useState(false)
  
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const t = (key: string) => translate(locale, key)

  // Live market data state
  const [signals, setSignals] = useState([
    { pair: "XAU/USD", direction: "BUY", entry: "2345.00", tp: "2375.00", sl: "2330.00", profit: "+1.28%", status: "TP Hit", time: "09:45 AM" },
  ])
  const [marketData, setMarketData] = useState([
    { symbol: "GOLD", price: "2,435.50", change: "+0.24%", up: true },
    { symbol: "TSLA", price: "363.60", change: "+0.17%", up: true },
    { symbol: "NVDA", price: "218.04", change: "+0.18%", up: true },
    { symbol: "AAPL", price: "316.52", change: "+0.16%", up: true },
    { symbol: "GOOGL", price: "337.49", change: "+0.21%", up: true },
    { symbol: "EUR/USD", price: "1.0850", change: "+0.08%", up: true },
    { symbol: "GBP/USD", price: "1.2720", change: "+0.12%", up: true },
    { symbol: "BTC/USD", price: "67,850", change: "+0.19%", up: true },
    { symbol: "USD/JPY", price: "149.85", change: "-0.15%", up: false },
    { symbol: "AMZN", price: "192.40", change: "+0.29%", up: true },
    { symbol: "MSFT", price: "445.30", change: "+0.12%", up: true },
    { symbol: "ETH/USD", price: "3,450", change: "+0.44%", up: true },
    { symbol: "USD/CHF", price: "0.8750", change: "-0.11%", up: false },
    { symbol: "AUD/USD", price: "0.6520", change: "+0.15%", up: true },
  ])

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
    const interval = setInterval(fetchMarket, 30000)
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
      <section className="hero-bg relative min-h-[90vh] flex items-center pt-0 noise-overlay">
        <div className="absolute top-32 left-[5%] w-20 h-20 border border-blue-500/10 rounded-2xl rotate-12 animate-float opacity-40"></div>
        <div className="absolute top-48 right-[10%] w-16 h-16 border border-green-500/10 rounded-xl -rotate-6 animate-float opacity-30" style={{animationDelay: "1s"}}></div>
        <div className="absolute bottom-32 left-[15%] w-24 h-24 border border-purple-500/10 rounded-3xl rotate-45 animate-float opacity-20" style={{animationDelay: "2s"}}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className={`transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
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
                <a href="/register" className="btn-accent !rounded-xl text-center">
                  {t("getStarted")}
                  <svg className="inline w-5 h-5 ml-2 -mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <a href="#features" className="btn-outline !rounded-xl text-center">
                  <svg className="inline w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {t("watchDemo")}
                </a>
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

            {/* Right - CTA */}
            <div className={`transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} flex items-center justify-center`}>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center max-w-md w-full">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{t("ctaTitle")}</h2>
                <p className="text-blue-200/70 text-lg mb-8">{t("ctaDesc")}</p>
                <a href="/register" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl">
                  {t("joinNow")}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
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
                { end: 50000, suffix: "+", label: t("statsSignals"), color: "from-green-500 to-emerald-600", icon: "📡" },
                { end: 85, suffix: "%", label: t("statsWinRate"), color: "from-purple-500 to-purple-600", icon: "🎯" },
                { end: 30, suffix: "+", label: t("statsCountries"), color: "from-orange-500 to-orange-600", icon: "🌍" },
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

      {/* ===== Pricing Plans Section ===== */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-5xl font-extrabold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{t("seeOurPlans")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className={`rounded-2xl overflow-hidden border backdrop-blur-xl transition-all hover:shadow-xl hover:scale-105 ${isDark ? "bg-white/5 border-white/10" : "bg-white/60 border-white/30"}`}>
              <div className="bg-red-600 text-white text-center py-4">
                <h3 className="text-2xl font-extrabold">{t("planFree")}</h3>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-lg">•</span>
                    <span className={`text-center flex-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{t("plan2to4")} {t("planSignalsPerMonth")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-lg">•</span>
                    <span className={`text-center flex-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{t("plan900to1500")} {t("planPointsTarget")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-lg">•</span>
                    <span className={`text-center flex-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{t("planBasicSetup")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-lg">•</span>
                    <span className={`text-center flex-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{t("planAllBrokers")}</span>
                  </div>
                </div>
                <a href="/register" className="block w-full mt-8 border-2 border-red-600 text-red-600 font-bold py-3 rounded-full text-center hover:bg-red-600 hover:text-white transition-all">
                  {t("joinPlanBtn")}
                </a>
              </div>
            </div>

            {/* Premium Plan */}
            <div className={`rounded-2xl overflow-hidden border-2 border-blue-500/50 relative backdrop-blur-xl transition-all hover:shadow-xl hover:shadow-blue-500/20 hover:scale-105 ${isDark ? "bg-blue-500/10" : "bg-blue-50/60"}`}>
              <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">{t("recommended")}</span>
              <div className="bg-red-600 text-white text-center py-4">
                <h3 className="text-2xl font-extrabold">{t("planPremium")}</h3>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-lg">•</span>
                    <span className={`text-center flex-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{t("plan8to14")} {t("planSignalsPerMonth")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-lg">•</span>
                    <span className={`text-center flex-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{t("plan3000to7000")} {t("planPointsTarget")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-lg">•</span>
                    <span className={`text-center flex-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{t("planAccurate")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-lg">•</span>
                    <span className={`text-center flex-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{t("planAllBrokers")}</span>
                  </div>
                </div>
                <a href="/register" className="block w-full mt-8 bg-blue-600 text-white font-bold py-3 rounded-full text-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                  {t("joinPlanBtn")}
                </a>
              </div>
            </div>

            {/* Supreme Plan */}
            <div className={`rounded-2xl overflow-hidden border backdrop-blur-xl transition-all hover:shadow-xl hover:scale-105 ${isDark ? "bg-white/5 border-white/10" : "bg-white/60 border-white/30"}`}>
              <div className="bg-red-600 text-white text-center py-4">
                <h3 className="text-2xl font-extrabold">{t("planSupreme")}</h3>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-lg">•</span>
                    <span className={`text-center flex-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{t("plan16to25")} {t("planSignalsPerMonth")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-lg">•</span>
                    <span className={`text-center flex-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{t("plan7000to15000")} {t("planPointsTarget")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-lg">•</span>
                    <span className={`text-center flex-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{t("planAccurate")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-lg">•</span>
                    <span className={`text-center flex-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{t("planAllBrokers")}</span>
                  </div>
                </div>
                <a href="/register" className="block w-full mt-8 border-2 border-red-600 text-red-600 font-bold py-3 rounded-full text-center hover:bg-red-600 hover:text-white transition-all">
                  {t("joinPlanBtn")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Limited Offer Countdown Banner ===== */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className={`rounded-2xl overflow-hidden border backdrop-blur-xl transition-all hover:shadow-xl ${isDark ? "bg-white/5 border-white/10" : "bg-white/60 border-white/30"}`}>
            <div className="grid md:grid-cols-2 items-center">
              {/* Left - Offer Text */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 flex items-center gap-4">
                <div className="text-5xl">⏰</div>
                <div>
                  <h3 className="text-white font-extrabold text-2xl">LIMITED OFFER</h3>
                  <p className="text-red-100 text-sm mt-1">Premium Signals Discount Ends Soon!</p>
                </div>
              </div>
              {/* Right - Countdown */}
              <div className="p-8 flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className={`text-3xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>02</div>
                  <div className={`text-xs uppercase ${isDark ? "text-gray-500" : "text-gray-400"}`}>Days</div>
                </div>
                <div className={`text-2xl ${isDark ? "text-gray-600" : "text-gray-300"}`}>:</div>
                <div className="text-center">
                  <div className={`text-3xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>14</div>
                  <div className={`text-xs uppercase ${isDark ? "text-gray-500" : "text-gray-400"}`}>Hours</div>
                </div>
                <div className={`text-2xl ${isDark ? "text-gray-600" : "text-gray-300"}`}>:</div>
                <div className="text-center">
                  <div className={`text-3xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>37</div>
                  <div className={`text-xs uppercase ${isDark ? "text-gray-500" : "text-gray-400"}`}>Mins</div>
                </div>
                <div className={`text-2xl ${isDark ? "text-gray-600" : "text-gray-300"}`}>:</div>
                <div className="text-center">
                  <div className={`text-3xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>52</div>
                  <div className={`text-xs uppercase ${isDark ? "text-gray-500" : "text-gray-400"}`}>Secs</div>
                </div>
                <a href="/register" className="ml-4 bg-red-600 text-white font-bold px-6 py-3 rounded-full hover:bg-red-700 transition-all shadow-lg shadow-red-500/20">
                  {t("joinNow")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              { icon: "📚", title: t("educationTitle"), desc: t("educationDesc"), gradient: "from-purple-500 to-purple-600", glow: "shadow-purple-500/20 hover:shadow-purple-500/40", href: "/education" },
              { icon: "✅", title: t("resultsTitle"), desc: t("resultsDesc"), gradient: "from-green-500 to-green-600", glow: "shadow-green-500/20 hover:shadow-green-500/40", href: "/results" },
              { icon: "🎧", title: t("supportTitle"), desc: t("supportDesc"), gradient: "from-orange-500 to-orange-600", glow: "shadow-orange-500/20 hover:shadow-orange-500/40", href: "/faq" },
            ].map((feature, i) => (
              <a key={i} href={feature.href} className={`group rounded-2xl p-8 backdrop-blur-xl border transition-all hover:shadow-xl hover:scale-105 cursor-pointer ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white/60 border-white/30 hover:bg-white/80"}`}>
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

      {/* ===== Live Market Ticker ===== */}
      <section className="relative z-20 py-4 overflow-hidden bg-dark-950 border-y border-white/5">
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-r from-dark-950 to-transparent"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-l from-dark-950 to-transparent"></div>
          <div className="flex animate-ticker whitespace-nowrap">
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex items-center gap-10 mr-10">
                {marketData.map((item, i) => (
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
        </div>
      </section>

      {/* ===== Live Signal Preview ===== */}
      <section className="py-24 px-4 bg-dark-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-green-500/10 text-green-400 text-sm font-semibold px-4 py-1.5 rounded-full border border-green-500/20 mb-4">
              <span className="inline-flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                {t("liveSignalsBadge")}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("liveSignalsTitle")}</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">{t("liveSignalsDesc")}</p>
          </div>

          <div className="flex justify-center max-w-5xl mx-auto">
            {signals.map((signal, i) => (
              <div key={i} className="trading-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="text-white font-bold text-lg">{signal.pair}</div>
                    <span className="text-xs text-gray-500">{signal.time}</span>
                  </div>
                  <span className={`signal-badge ${signal.direction === "BUY" ? "signal-buy" : "signal-sell"}`}>{signal.direction}</span>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("entry")}</span>
                    <span className="text-white trading-price font-medium">{signal.entry}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("takeProfit")}</span>
                    <span className="text-green-400 trading-price font-medium">{signal.tp}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("stopLoss")}</span>
                    <span className="text-red-400 trading-price font-medium">{signal.sl}</span>
                  </div>
                </div>
                <div className="border-t border-dark-700/50 pt-4 flex items-center justify-between">
                  <span className="text-green-400 font-bold trading-price">{signal.profit}</span>
                  <span className={`signal-badge border ${signal.status === "TP Hit" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}`}>{signal.status}</span>
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

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { textKey: "testimonial1Text", nameKey: "testimonial1Name", countryKey: "testimonial1Country", profitKey: "testimonial1Profit", initial: "A" },
              { textKey: "testimonial2Text", nameKey: "testimonial2Name", countryKey: "testimonial2Country", profitKey: "testimonial2Profit", initial: "S" },
              { textKey: "testimonial3Text", nameKey: "testimonial3Name", countryKey: "testimonial3Country", profitKey: "testimonial3Profit", initial: "P" },
            ].map((item, i) => (
              <div key={i} className="testimonial-card group">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className={`text-sm leading-relaxed mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{t(item.textKey)}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {item.initial}
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{t(item.nameKey)}</div>
                      <div className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{t(item.countryKey)}</div>
                    </div>
                  </div>
                  <span className="text-green-500 font-bold text-sm trading-price">{t(item.profitKey)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">{t("ctaTitle")}</h2>
          <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">{t("ctaDesc")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl">
              {t("joinNow")}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </a>
            <a href="/results" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-white/20 transition-all">
              {t("viewResults")}
            </a>
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
                <a href="https://t.me/tokmatacademy" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center hover:bg-blue-600 transition-colors group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L8.32 13.617l-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/></svg>
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