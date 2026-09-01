"use client"
import { useState, useEffect } from "react"

import { useTheme } from "@/components/ThemeProvider"
import { t as translate, type Locale } from "@/lib/translations"

export default function FAQPage() {
  
  const [locale, setLocale] = useState<Locale>("en")
  useEffect(() => { const p = new URLSearchParams(window.location.search); setLocale((p.get("locale") || "en") as Locale); }, [])
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const t = (key: string) => translate(locale, key)
  const [open, setOpen] = useState<number | null>(null)

  const faqs = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
    { q: t("faq4Q"), a: t("faq4A") },
    { q: t("faq5Q"), a: t("faq5A") },
    { q: t("faq6Q"), a: t("faq6A") },
    { q: t("faq7Q"), a: t("faq7A") },
    { q: t("faq8Q"), a: t("faq8A") },
  ]

  return (
    <main className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-dark-950" : "bg-gray-50"}`}>
      <section className="bg-gradient-to-br from-dark-950 via-dark-900 to-blue-950 text-white py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-block bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">{t("faqBadge")}</div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">{t("faqTitle")}</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">{t("faqSubtitle")}</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className={`rounded-xl border overflow-hidden transition-all ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"} ${open === i ? (isDark ? "shadow-lg shadow-blue-500/5 border-blue-500/30" : "shadow-lg shadow-blue-500/5 border-blue-200") : ""}`}>
              <button onClick={() => setOpen(open === i ? null : i)} className={`w-full flex items-center justify-between p-5 text-left transition-colors ${isDark ? "hover:bg-dark-700/50" : "hover:bg-gray-50"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${open === i ? "bg-blue-100 text-blue-600" : isDark ? "bg-dark-700 text-gray-400" : "bg-gray-100 text-gray-500"}`}>{i + 1}</div>
                  <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{faq.q}</span>
                </div>
                <svg className={`w-5 h-5 flex-shrink-0 ml-4 transition-transform duration-300 ${open === i ? "rotate-180 text-blue-500" : isDark ? "text-gray-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`accordion-content ${open === i ? "open" : ""}`}>
                <div className={`px-5 pb-5 text-sm leading-relaxed ml-11 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{faq.a}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-12 rounded-2xl p-8 text-center border ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"}`}>
          <span className="text-4xl mb-4 block">💬</span>
          <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{t("stillHaveQuestions")}</h3>
          <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{t("supportAvailable")}</p>
          <a href="https://t.me/tokmatacademy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L8.32 13.617l-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/></svg>
            {t("contactOnTelegram")}
          </a>
        </div>
      </section>
    </main>
  )
}
