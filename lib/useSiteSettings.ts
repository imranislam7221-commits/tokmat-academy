"use client"

import { useEffect, useState } from "react"

// Site settings hook — client component gulo ekh theke telegram link, site name etc. nibe.
// Ekta request e /api/settings theke sob settings ane, cache kore across components share kore.

let cached: Record<string, string> = {}
let inflight: Promise<Record<string, string>> | null = null

async function loadSettings(): Promise<Record<string, string>> {
  if (Object.keys(cached).length > 0) return cached
  if (!inflight) {
    inflight = fetch("/api/settings")
      .then((r) => r.json())
      .then((j) => {
        cached = j.ok && j.settings ? j.settings : {}
        return cached
      })
      .catch(() => ({}) as Record<string, string>)
  }
  return inflight
}

export function useSiteSettings() {
  const [telegramLink, setTelegramLink] = useState("https://t.me/TokmatSignal")
  const [chatTelegramLink, setChatTelegramLink] = useState("https://t.me/tokmatgoldhuntar")
  const [siteName, setSiteName] = useState("Tokmat Academy")
  const [supportEmail, setSupportEmail] = useState("maasum1231@gmail.com")
  const [maxFreeSignals, setMaxFreeSignals] = useState(3)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    loadSettings().then((s) => {
      if (s.telegram_link) setTelegramLink(s.telegram_link)
      if (s.chat_telegram_link) setChatTelegramLink(s.chat_telegram_link)
      if (s.site_name) setSiteName(s.site_name)
      if (s.support_email) setSupportEmail(s.support_email)
      if (s.max_free_signals) setMaxFreeSignals(Number(s.max_free_signals) || 3)
      setLoaded(true)
    })
  }, [])

  return { telegramLink, chatTelegramLink, siteName, supportEmail, maxFreeSignals, loaded }
}
