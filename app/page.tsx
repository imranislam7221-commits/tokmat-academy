"use client"

import { useEffect, use, useState } from "react"

export default function Home({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = use(searchParams)
  const locale = params?.locale || "en"
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    window.history.pushState({}, "", `?locale=${locale}`)
  }, [locale])

  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        heroBadge: "🔥 Trusted by 10,000+ Traders Worldwide",
        heroTitle1: "Master",
        heroTitle2: "Forex Trading",
        heroSubtitle: "Real-time signals, professional education, and proven strategies to grow your wealth.",
        getStarted: "Start Trading Free",
        watchDemo: "Watch Demo",
        statsTraders: "Active Traders",
        statsSignals: "Signals Sent",
        statsWinRate: "Win Rate",
        statsCountries: "Countries",
        whyTitle: "Why Traders Choose Us",
        whySubtitle: "Everything you need to succeed in the forex market",
        signalsTitle: "Live Forex Signals",
        signalsDesc: "Get real-time buy/sell signals with entry, SL & TP levels from expert analysts.",
        educationTitle: "Trading Education",
        educationDesc: "Step-by-step video courses from beginner to advanced strategies.",
        resultsTitle: "Verified Results",
        resultsDesc: "Transparent track record with monthly performance reports.",
        supportTitle: "24/7 Expert Support",
        supportDesc: "Our team is always online to guide your trading decisions.",
        ctaTitle: "Ready to Start Earning?",
        ctaDesc: "Join thousands of successful traders. Start with a free account today.",
        joinNow: "Join Now — It's Free",
        footerDesc: "International Forex Education & Trading Platform",
        footerRights: "All rights reserved.",
      },
      fr: {
        heroBadge: "🔥 Approuvé par 10 000+ traders",
        heroTitle1: "Maîtrisez",
        heroTitle2: "le Trading Forex",
        heroSubtitle: "Signaux en direct, formation professionnelle et stratégies éprouvées.",
        getStarted: "Commencer Gratuitement",
        watchDemo: "Voir la Démo",
        statsTraders: "Traders Actifs",
        statsSignals: "Signaux Envoyés",
        statsWinRate: "Taux de Réussite",
        statsCountries: "Pays",
        whyTitle: "Pourquoi Nous Choisir",
        whySubtitle: "Tout ce dont vous avez besoin pour réussir",
        signalsTitle: "Signaux Forex Live",
        signalsDesc: "Signaux d'achat/vente en temps réel avec niveaux d'entrée, SL et TP.",
        educationTitle: "Formation Trading",
        educationDesc: "Cours vidéo étape par étape du débutant à l'avancé.",
        resultsTitle: "Résultats Vérifiés",
        resultsDesc: "Traçabilité transparente avec rapports mensuels.",
        supportTitle: "Support 24/7",
        supportDesc: "Notre équipe est toujours prête à vous guider.",
        ctaTitle: "Prêt à Commencer?",
        ctaDesc: "Rejoignez des milliers de traders performants.",
        joinNow: "Rejoindre — C'est Gratuit",
        footerDesc: "Plateforme Internationale d'Éducation Forex",
        footerRights: "Tous droits réservés.",
      },
      ms: {
        heroBadge: "🔥 Dipercayai oleh 10,000+ Pedagang",
        heroTitle1: "Kuasai",
        heroTitle2: "Trading Forex",
        heroSubtitle: "Sinyal langsung, pendidikan profesional, dan strategi terbukti.",
        getStarted: "Mulakan Percuma",
        watchDemo: "Tonton Demo",
        statsTraders: "Pedagang Aktif",
        statsSignals: "Sinyal Dihantar",
        statsWinRate: "Kadar Kemenangan",
        statsCountries: "Negara",
        whyTitle: "Mengapa Pilih Kami",
        whySubtitle: "Segala yang anda perlukan untuk berjaya",
        signalsTitle: "Sinyal Forex Live",
        signalsDesc: "Sinyal beli/jual masa nyata dengan paras SL dan TP.",
        educationTitle: "Pendidikan Trading",
        educationDesc: "Kursus video langkah demi langkah dari pemula ke pakar.",
        resultsTitle: "Hasil Disahkan",
        resultsDesc: "Rekod telus dengan laporan prestasi bulanan.",
        supportTitle: "Sokongan 24/7",
        supportDesc: "Pasukan kami sentiasa sedia membimbing anda.",
        ctaTitle: "Bersedia Untuk Mula?",
        ctaDesc: "Sertai ribuan pedagang berjaya.",
        joinNow: "Sertai Sekarang — Percuma",
        footerDesc: "Platform Pendidikan Forex Antarabangsa",
        footerRights: "Hak cipta terpelihara.",
      },
      ar: {
        heroBadge: "🔥 موثوق من قبل 10,000+ متداول",
        heroTitle1: "أتقن",
        heroTitle2: "تجارة الفوركس",
        heroSubtitle: "إشارات فورية وتعليم احترافي واستراتيجيات مثبتة.",
        getStarted: "ابدأ مجاناً",
        watchDemo: "شاهد العرض",
        statsTraders: "متداولون نشطون",
        statsSignals: "إشارات مرسلة",
        statsWinRate: "نسبة الفوز",
        statsCountries: "دولة",
        whyTitle: "لماذا تختارنا",
        whySubtitle: "كل ما تحتاجه للنجاح في سوق الفوركس",
        signalsTitle: "إشارات الفوركس المباشرة",
        signalsDesc: "إشارات شراء/بيع فورية مع مستويات الدخول والوقف.",
        educationTitle: "تعليم التداول",
        educationDesc: "دروس فيديو خطوة بخطوة من المبتدئ إلى المتقدم.",
        resultsTitle: "نتائج موثقة",
        resultsDesc: "سجل شفاف مع تقارير أداء شهرية.",
        supportTitle: "دعم 24/7",
        supportDesc: "فريقنا متاح دائماً لإرشادك.",
        ctaTitle: "مستعد للبدء؟",
        ctaDesc: "انضم لآلاف المتداولين الناجحين.",
        joinNow: "انضم الآن — مجاناً",
        footerDesc: "منصة تعليم الفوركس الدولية",
        footerRights: "جميع الحقوق محفوظة.",
      },
    }
    return translations[locale as keyof typeof translations]?.[key] || key
  }

  // Mini chart SVG for decoration
  const MiniChart = ({ color, className }: { color: string; className?: string }) => (
    <svg className={className} viewBox="0 0 200 60" fill="none">
      <path
        d="M0 40 Q20 35 40 30 T80 20 T120 15 T160 8 T200 5"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M0 40 Q20 35 40 30 T80 20 T120 15 T160 8 T200 5 V60 H0 Z"
        fill={`${color}15`}
      />
    </svg>
  )

  return (
    <main className="min-h-screen bg-white">
      {/* ===== Hero Section ===== */}
      <section className="hero-bg relative min-h-[90vh] flex items-center pt-20 noise-overlay">
        {/* Floating decorations */}
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

              {/* Trust indicators */}
              <div className="flex items-center gap-6">
                <div className="flex -space-x-3">
                  {["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"].map((c, i) => (
                    <div key={i} className={`w-9 h-9 rounded-full ${c} border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-400">
                  <span className="text-white font-semibold">10,000+</span> traders trust us
                </div>
              </div>
            </div>

            {/* Right - Trading Card */}
            <div className={`relative transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              <div className="trading-card max-w-md mx-auto">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-bold">EUR/USD</div>
                      <div className="text-gray-400 text-xs">Euro / US Dollar</div>
                    </div>
                  </div>
                  <span className="signal-buy">BUY</span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-3xl font-bold text-white trading-price">1.0876</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-green-400 text-sm font-semibold">+0.32%</span>
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </div>
                </div>

                {/* Mini Chart */}
                <div className="bg-dark-800/50 rounded-xl p-4 mb-6">
                  <MiniChart color="#22c55e" className="w-full h-12" />
                </div>

                {/* Signal Details */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Entry", value: "1.0850", color: "text-blue-400" },
                    { label: "Stop Loss", value: "1.0810", color: "text-red-400" },
                    { label: "Take Profit", value: "1.0920", color: "text-green-400" },
                  ].map((item, i) => (
                    <div key={i} className="bg-dark-800/50 rounded-lg p-3 text-center">
                      <div className="text-gray-500 text-xs mb-1">{item.label}</div>
                      <div className={`${item.color} font-bold text-sm trading-price`}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Stats Section ===== */}
      <section className="relative -mt-16 z-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-elevated border border-gray-100 p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "10K+", label: t("statsTraders"), color: "from-blue-500 to-blue-600", icon: "👥" },
                { value: "50K+", label: t("statsSignals"), color: "from-green-500 to-emerald-600", icon: "📡" },
                { value: "85%", label: t("statsWinRate"), color: "from-purple-500 to-purple-600", icon: "🎯" },
                { value: "30+", label: t("statsCountries"), color: "from-orange-500 to-orange-600", icon: "🌍" },
              ].map((stat, i) => (
                <div key={i} className="text-center group cursor-default">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className={`text-2xl md:text-3xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-500 text-sm font-medium mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features Section ===== */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-50 text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Features
            </div>
            <h2 className="section-title text-gray-900 mb-4">{t("whyTitle")}</h2>
            <p className="section-subtitle">{t("whySubtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: (
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                title: t("signalsTitle"),
                desc: t("signalsDesc"),
                gradient: "from-blue-500 to-blue-600",
                glow: "shadow-blue-500/20 hover:shadow-blue-500/40",
                accent: "bg-blue-50 text-blue-600",
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                title: t("educationTitle"),
                desc: t("educationDesc"),
                gradient: "from-purple-500 to-purple-600",
                glow: "shadow-purple-500/20 hover:shadow-purple-500/40",
                accent: "bg-purple-50 text-purple-600",
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: t("resultsTitle"),
                desc: t("resultsDesc"),
                gradient: "from-green-500 to-green-600",
                glow: "shadow-green-500/20 hover:shadow-green-500/40",
                accent: "bg-green-50 text-green-600",
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
                title: t("supportTitle"),
                desc: t("supportDesc"),
                gradient: "from-orange-500 to-orange-600",
                glow: "shadow-orange-500/20 hover:shadow-orange-500/40",
                accent: "bg-orange-50 text-orange-600",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`feature-card group shadow-card ${feature.glow} hover:shadow-xl`}
                style={{ ["--card-color" as string]: feature.gradient.includes("blue") ? "#3b82f6" : feature.gradient.includes("purple") ? "#8b5cf6" : feature.gradient.includes("green") ? "#22c55e" : "#f97316" }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Live Signal Preview ===== */}
      <section className="py-24 px-4 bg-dark-950 relative overflow-hidden">
        {/* Background grid */}
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
                Live Signals
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Real-Time Trading Signals</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">Professional analysis delivered directly to your Telegram</p>
          </div>

          {/* Signal Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { pair: "EUR/USD", direction: "BUY", entry: "1.0850", tp: "1.0920", sl: "1.0810", profit: "+0.64%", status: "TP Hit", statusColor: "bg-green-500/20 text-green-400 border-green-500/30" },
              { pair: "GBP/JPY", direction: "SELL", entry: "188.500", tp: "187.800", sl: "189.100", profit: "+0.37%", status: "Running", statusColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
              { pair: "XAU/USD", direction: "BUY", entry: "2345.00", tp: "2375.00", sl: "2330.00", profit: "+1.28%", status: "TP Hit", statusColor: "bg-green-500/20 text-green-400 border-green-500/30" },
            ].map((signal, i) => (
              <div key={i} className="trading-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-white font-bold text-lg">{signal.pair}</div>
                  </div>
                  <span className={`signal-badge ${signal.direction === "BUY" ? "signal-buy" : "signal-sell"}`}>
                    {signal.direction}
                  </span>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Entry</span>
                    <span className="text-white trading-price font-medium">{signal.entry}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Take Profit</span>
                    <span className="text-green-400 trading-price font-medium">{signal.tp}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Stop Loss</span>
                    <span className="text-red-400 trading-price font-medium">{signal.sl}</span>
                  </div>
                </div>
                <div className="border-t border-dark-700/50 pt-4 flex items-center justify-between">
                  <span className="text-green-400 font-bold trading-price">{signal.profit}</span>
                  <span className={`signal-badge border ${signal.statusColor}`}>{signal.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="py-24 px-4 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">{t("ctaTitle")}</h2>
          <p className="text-blue-100/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto">{t("ctaDesc")}</p>
          <a href="/register" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-10 py-5 rounded-xl text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl">
            {t("joinNow")}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-dark-950 text-gray-400 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-xl font-extrabold text-white">Tokmat<span className="text-blue-500">Academy</span></span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{t("footerDesc")}</p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2.5 text-sm">
                {["Signals", "Results", "Education", "News"].map((link) => (
                  <li key={link}>
                    <a href={`/${link.toLowerCase()}`} className="hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm">
                {["About Us", "FAQ", "Brokers", "Contact"].map((link) => (
                  <li key={link}>
                    <a href={`/${link.toLowerCase().replace(" ", "-")}`} className="hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <div className="flex items-center gap-3">
                <a href="https://t.me/tokmatacademy" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center hover:bg-blue-600 transition-colors group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L8.32 13.617l-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center hover:bg-blue-400 transition-colors group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.195A4.916 4.916 0 0016.616 2c-2.737 0-4.952 2.225-4.952 4.97 0 .39.044.765.127 1.124C7.728 7.87 4.1 5.89 1.671 2.905a4.962 4.962 0 00-.672 2.5c0 1.724.877 3.244 2.21 4.135a4.9 4.9 0 01-2.244-.62v.062c0 2.4 1.705 4.392 3.97 4.84a4.935 4.935 0 01-2.238.084c.63 1.97 2.46 3.405 4.628 3.445A9.868 9.868 0 010 19.54a13.94 13.94 0 007.548 2.212c9.057 0 14.002-7.515 14.002-14.002 0-.213-.005-.425-.014-.636A10.012 10.012 0 0024 4.557z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center hover:bg-pink-600 transition-colors group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-dark-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">&copy; 2024 Tokmat Academy. {t("footerRights")}</p>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
