"use client"

import { useEffect, useState } from "react"

// Floating Live Chat button — sob page e dan pashe niche.
// Name "Live Chat" dekhabe, click korle Telegram e open hoy.
// Telegram link site_settings theke ase (admin Settings e change korte parbe),
// na thakle default link use hoy.

export function FloatingChat() {
  const [tgLink, setTgLink] = useState("https://t.me/TokmatSignal")

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && j.settings?.telegram_link) setTgLink(j.settings.telegram_link)
      })
      .catch(() => {})
  }, [])

  return (
    <a
      href={tgLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Live Chat"
      className="fixed bottom-5 right-5 z-50 group flex items-center gap-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm pl-4 pr-5 py-3 rounded-full shadow-2xl shadow-green-500/40 hover:shadow-green-500/60 hover:scale-105 transition-all duration-300"
    >
      {/* Online dot */}
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
      </span>
      {/* Chat icon */}
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      Live Chat
    </a>
  )
}
