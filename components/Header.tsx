"use client"

import { useState, useEffect } from "react"

const navigationLinks = [
  { id: 1, href: "/", label: "Home" },
  { id: 2, href: "/results", label: "Results" },
  { id: 3, href: "/news-analysis", label: "News Analysis" },
  { id: 4, href: "/faq", label: "FAQ" },
  { id: 5, href: "/brokers", label: "Brokers" },
  { id: 6, href: "/education", label: "Education" },
  { id: 7, href: "https://t.me/tokmatacademy", label: "Contact", external: true },
]

const supportedLocales = ["en", "en-GB", "fr", "ms", "ar"]
const localeLabels: Record<string, string> = {
  "en": "EN",
  "en-GB": "EN-GB",
  "fr": "FR",
  "ms": "MS",
  "ar": "عربي",
}
const localeFull: Record<string, string> = {
  "en": "English",
  "en-GB": "English (UK)",
  "fr": "Français",
  "ms": "Melayu",
  "ar": "العربية",
}

export function Header({ locale }: { locale: string }) {
  const direction = locale === "ar" ? "rtl" : "ltr"
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const updateLocaleInURL = (lang: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set("locale", lang)
    window.history.pushState({}, "", url.pathname + url.search)
    setLangOpen(false)
    window.location.reload()
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-elevated border-b border-gray-100"
          : "bg-transparent"
      }`}
      dir={direction}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                Tokmat<span className="text-blue-600">Academy</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase hidden sm:block">
                Forex Education
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigationLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="nav-link text-[13px]"
              >
                {link.label}
                {link.external && (
                  <svg className="inline w-3 h-3 ml-0.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
              </a>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="hidden md:flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-semibold text-green-700">LIVE</span>
            </div>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span>{localeLabels[locale] || "EN"}</span>
                <svg className={`w-3 h-3 transition-transform ${langOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-elevated border border-gray-100 py-2 z-50 animate-fade-in">
                    {supportedLocales.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => updateLocaleInURL(loc)}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-blue-50 transition-colors ${
                          loc === locale ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                        }`}
                      >
                        <span>{localeFull[loc]}</span>
                        {loc === locale && (
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

            {/* CTA Button */}
            <a href="/register" className="hidden sm:inline-flex btn-primary !px-5 !py-2.5 !text-sm !rounded-lg">
              Join Free
            </a>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navigationLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-2 px-4">
                <a href="/register" className="btn-primary w-full text-center !py-3 block">
                  Join Free
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
