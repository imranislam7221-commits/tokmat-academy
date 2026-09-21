"use client"
import { useState, useEffect } from "react"

import { useTheme } from "@/components/ThemeProvider"
import { t as translate, type Locale } from "@/lib/translations"
import { useSiteSettings } from "@/lib/useSiteSettings"

export default function ContactPage() {
  
  const [locale, setLocale] = useState<Locale>("en")
  useEffect(() => { const p = new URLSearchParams(window.location.search); setLocale((p.get("locale") || "en") as Locale); }, [])
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const t = (key: string) => translate(locale, key)
  const { telegramLink, supportEmail } = useSiteSettings()

  // Contact form state — DB te save hoy, admin panel e dekha jay
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [sending, setSending] = useState(false)
  const [sentMsg, setSentMsg] = useState("")

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSentMsg("")
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setSentMsg("error|Please fill all fields")
      return
    }
    setSending(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const j = await res.json()
      if (j.ok) {
        setSentMsg("ok|Message sent! We'll reply within 1 hour.")
        setForm({ name: "", email: "", message: "" })
      } else {
        setSentMsg("error|" + (j.error || "Failed to send"))
      }
    } catch {
      setSentMsg("error|Server error. Try Telegram instead.")
    } finally {
      setSending(false)
    }
  }

  return (
    <main className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-dark-950" : "bg-gray-50"}`}>
      <section className="bg-gradient-to-br from-dark-950 via-dark-900 to-blue-950 text-white py-14 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">{t("contactTitle")}</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">{t("contactSubtitle")}</p>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className={`rounded-xl p-6 border ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"}`}>
              <h3 className={`font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{t("getInTouch")}</h3>
              <div className="space-y-4">
                <a href={telegramLink} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isDark ? "bg-blue-900/20 hover:bg-blue-900/30" : "bg-blue-50 hover:bg-blue-100"}`}>
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L8.32 13.617l-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/></svg>
                  <div>
                    <div className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Telegram</div>
                    <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{telegramLink.replace("https://t.me", "").replace("https://", "")}</div>
                  </div>
                </a>
                <a href={`mailto:${supportEmail}`} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isDark ? "bg-dark-700/50 hover:bg-dark-700" : "bg-gray-50 hover:bg-gray-100"}`}>
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <div>
                    <div className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Email</div>
                    <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{supportEmail}</div>
                  </div>
                </a>
                <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? "bg-dark-700/50" : "bg-gray-50"}`}>
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <div>
                    <div className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{t("responseTime")}</div>
                    <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{t("withinOneHour")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={`rounded-xl p-6 border ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"}`}>
            <h3 className={`font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{t("sendMessage")}</h3>
            <form onSubmit={handleSend} className="space-y-4">
              <input type="text" placeholder={t("yourName")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`w-full px-4 py-3 rounded-lg border outline-none transition-all text-sm ${isDark ? "bg-dark-700 border-dark-600 text-white placeholder-gray-500" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"}`} />
              <input type="email" placeholder={t("yourEmail")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`w-full px-4 py-3 rounded-lg border outline-none transition-all text-sm ${isDark ? "bg-dark-700 border-dark-600 text-white placeholder-gray-500" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"}`} />
              <textarea placeholder={t("yourMessage")} rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`w-full px-4 py-3 rounded-lg border outline-none transition-all text-sm resize-none ${isDark ? "bg-dark-700 border-dark-600 text-white placeholder-gray-500" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"}`}></textarea>
              {sentMsg && (
                <div className={`text-sm font-semibold px-3 py-2 rounded-lg ${sentMsg.startsWith("ok") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"} ${isDark ? (sentMsg.startsWith("ok") ? "!bg-green-500/10" : "!bg-red-500/10") : ""}`}>
                  {sentMsg.split("|")[1]}
                </div>
              )}
              <button type="submit" disabled={sending} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                {sending ? "Sending..." : t("sendMsgBtn")}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
