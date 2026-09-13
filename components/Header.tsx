"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "@/components/ThemeProvider"
import { t, locales, type Locale } from "@/lib/translations"

function getLocaleFromURL(): Locale {
  if (typeof window === "undefined") return "en"
  const params = new URLSearchParams(window.location.search)
  const loc = params.get("locale") || "en"
  return (locales.find(l => l.code === loc) ? loc : "en") as Locale
}

function getNavLinks(locale: Locale) {
  return [
    { id: 1, href: "/", label: t(locale, "navHome") },
    { id: 2, href: "/signals", label: t(locale, "navSignals") },
    { id: 3, href: "/results", label: t(locale, "navResults") },
    { id: 4, href: "/videos", label: t(locale, "navVideos") },
    { id: 5, href: "/news-analysis", label: t(locale, "navNews") },
    { id: 6, href: "/education", label: t(locale, "navEducation") },
    { id: 7, href: "/about-us", label: t(locale, "navAbout") },
    { id: 8, href: "/faq", label: t(locale, "navFaq") },
    { id: 9, href: "/contact", label: t(locale, "navContact") },
    { id: 10, href: "/brokers", label: t(locale, "navBrokers") },
  ]
}

export function Header({ locale: initialLocale }: { locale: string }) {
  const { theme } = useTheme()
  const [currentLocale, setCurrentLocale] = useState<Locale>(initialLocale as Locale)
  const direction = currentLocale === "ar" ? "rtl" : "ltr"
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const navigationLinks = getNavLinks(currentLocale)
  const isDark = theme === "dark"
  const [user, setUser] = useState<{email:string; role:string; firstName?:string} | null>(null)

  useEffect(() => {
    setCurrentLocale(getLocaleFromURL())
    // Real session check — server theke user ane (HttpOnly cookie)
    fetch("/api/auth")
      .then(r => r.json())
      .then(j => { if (j.ok && j.user) setUser({ email: j.user.email, role: j.user.role, firstName: j.user.firstName }) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const updateLocaleInURL = (lang: Locale) => {
    const url = new URL(window.location.href)
    url.searchParams.set("locale", lang)
    window.history.pushState({}, "", url.pathname + url.search)
    setLangOpen(false)
    window.location.reload()
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen
          ? isDark
            ? "bg-dark-900/95 backdrop-blur-xl shadow-elevated border-b border-dark-700"
            : "bg-white/95 backdrop-blur-xl shadow-elevated border-b border-gray-100"
          : "bg-transparent border-b border-transparent"
      }`}
      dir={direction}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className={`text-xl sm:text-2xl font-extrabold tracking-tight ${!scrolled ? "text-white" : isDark ? "text-white" : "text-gray-900"}`}>
                Tokmat <span className={!scrolled ? "text-blue-400" : "text-blue-600"}>Academy</span>
              </span>
              <span className={`text-[10px] font-medium tracking-wider uppercase hidden sm:block leading-none ${!scrolled ? "text-white/60" : "text-gray-400"}`}>
                Forex Education
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-0.5 flex-nowrap">
            {navigationLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                rel="noopener noreferrer"
                className={`text-[12px] font-medium px-2 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap ${!scrolled ? "text-white/80 hover:text-white hover:bg-white/10" : isDark ? "text-gray-300 hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 flex-nowrap">
            {/* Live Indicator */}
            <div className={`hidden md:flex items-center gap-2 border rounded-full px-3 py-1.5 backdrop-blur-sm transition-colors ${
                !scrolled
                  ? "bg-white/10 border-white/20"
                  : isDark ? "bg-green-900/30 border-green-700" : "bg-green-50 border-green-200"
              }`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className={`text-xs font-semibold ${!scrolled ? "text-white" : isDark ? "text-green-400" : "text-green-700"}`}>LIVE</span>
            </div>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className={`flex items-center gap-1.5 rounded-lg px-2 sm:px-3 py-2 text-sm font-medium transition-all backdrop-blur-sm border ${
                  !scrolled
                    ? "bg-white/10 hover:bg-white/15 text-white border-white/10"
                    : isDark ? "bg-dark-700 hover:bg-dark-600 text-gray-300 border-dark-600" : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-transparent"
                }`}
              >
                <span className="text-xs font-bold">{locales.find(l => l.code === currentLocale)?.flag}</span>
                <svg className={`w-3 h-3 transition-transform ${langOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className={`absolute right-0 mt-2 w-52 rounded-xl shadow-elevated border py-2 z-50 animate-fade-in ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"}`}>
                    {locales.map((loc) => (
                      <button
                        key={loc.code}
                        onClick={() => updateLocaleInURL(loc.code)}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                          loc.code === currentLocale
                            ? isDark ? "bg-blue-900/30 text-blue-400 font-semibold" : "bg-blue-50 text-blue-700 font-semibold"
                            : isDark ? "text-gray-300 hover:bg-dark-700" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{loc.flag}</span>
                          <span>{loc.label}</span>
                        </span>
                        {loc.code === currentLocale && (
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* CTA / Auth Button */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link href={user.role === "admin" ? "/admin" : "/dashboard"} className={`!px-4 sm:!px-5 !py-2 !text-sm !rounded-lg font-bold transition-all ${user.role==="admin" ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg" : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"}`}>
                  {user.role === "admin" ? "Admin Panel" : "Dashboard"}
                </Link>
                <button
                  onClick={async () => { try { await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) }) } catch {}; setUser(null); window.location.href="/"; }}
                  className={`!px-3 !py-2 !text-sm !rounded-lg font-semibold border transition-all ${isDark ? "border-white/20 text-white hover:bg-white/10" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/register" className={`hidden sm:inline-flex !px-4 sm:!px-5 !py-2 !text-sm !rounded-lg font-semibold transition-all ${isDark ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "btn-primary"}`}>
                {t(currentLocale, "navJoinFree")}
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`xl:hidden p-2 rounded-lg transition-colors backdrop-blur-sm ${
                !scrolled
                  ? "hover:bg-white/10 text-white"
                  : isDark ? "hover:bg-dark-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {mobileOpen ? (
                <svg className={`w-6 h-6 ${!scrolled ? "text-white" : isDark ? "text-gray-300" : "text-gray-700"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className={`w-6 h-6 ${!scrolled ? "text-white" : isDark ? "text-gray-300" : "text-gray-700"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className={`xl:hidden border-t py-4 animate-fade-in shadow-lg ${isDark ? "bg-dark-900 border-dark-700" : "bg-white border-gray-100"}`}>
            <div className="flex flex-col gap-1">
              {navigationLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 font-medium text-[13px] md:text-sm rounded-lg transition-colors ${isDark ? "text-gray-300 hover:bg-blue-900/20 hover:text-blue-400" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
                >
                  {link.label}
                </Link>
              ))}
              <div className={`border-t mt-2 pt-2 px-4 ${isDark ? "border-dark-700" : "border-gray-100"}`}>
                {user ? (
                  <>
                    <Link href={user.role === "admin" ? "/admin" : "/dashboard"} className={`w-full text-center !py-3 block rounded-xl font-bold ${user.role==="admin" ? "bg-red-600 text-white" : "btn-primary"}`}>
                      {user.role === "admin" ? "Admin Panel" : "Dashboard"}
                    </Link>
                    <button onClick={async () => { try { await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) }) } catch {}; setUser(null); window.location.href="/"; }} className={`w-full mt-2 text-center !py-2.5 block rounded-xl font-semibold border ${isDark ? "border-white/20 text-white" : "border-gray-200 text-gray-700"}`}>
                      Logout
                    </button>
                  </>
                ) : (
                  <Link href="/register" className="btn-primary w-full text-center !py-3 block">
                    {t(currentLocale, "navJoinFree")}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}