"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSiteSettings } from "@/lib/useSiteSettings"

// Floating Live Chat widget — sob page e dan pashe niche.
// Click korle 2 ta option: ✈️ Telegram (existing link) | 💬 Live Chat (website chat).
// Live Chat e message DB te save hoy, admin panel er "Live Chat" section theke reply ashe.
// Panel khule thakle 4s e poll kore — notun admin reply sathe sathe dekhabe.

interface ChatMsg {
  id: number
  sender_type: "user" | "admin"
  sender_name?: string
  message: string
  created_at: string
}

function getGuestId(): string {
  try {
    const existing = localStorage.getItem("tokmat_guest_id")
    if (existing) return existing
    const id: string = typeof crypto !== "undefined" && (crypto as any).randomUUID
      ? String((crypto as any).randomUUID())
      : `g${Date.now()}${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem("tokmat_guest_id", id)
    return id
  } catch {
    return ""
  }
}

export function FloatingChat() {
  const { chatTelegramLink: tgLink } = useSiteSettings()
  const [menuOpen, setMenuOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [msgs, setMsgs] = useState<ChatMsg[]>([])
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [myName, setMyName] = useState("")
  const [askingName, setAskingName] = useState(false)
  const guestIdRef = useRef("")
  const scrollRef = useRef<HTMLDivElement | null>(null)

  // Guest id + saved name + login status (ekbar)
  useEffect(() => {
    guestIdRef.current = getGuestId()
    try {
      const saved = localStorage.getItem("tokmat_chat_name") || ""
      if (saved) setMyName(saved)
      else setAskingName(true)
    } catch {}
    fetch("/api/auth", { cache: "no-store", credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && j.user && j.user.firstName) {
          setMyName(j.user.firstName)
          setAskingName(false)
        }
      })
      .catch(() => {})
  }, [])

  const load = useCallback(async () => {
    const gid = guestIdRef.current
    if (!gid) return
    try {
      const res = await fetch(`/api/chat?guestId=${encodeURIComponent(gid)}`, {
        cache: "no-store",
        credentials: "include",
      })
      const j = await res.json()
      if (j.ok && Array.isArray(j.messages)) setMsgs(j.messages)
    } catch {}
  }, [])

  // Panel khule thakle poll — admin reply sathe sathe ashbe
  useEffect(() => {
    if (!panelOpen) return
    setLoading(true)
    load().finally(() => setLoading(false))
    const iv = setInterval(load, 4000)
    return () => clearInterval(iv)
  }, [panelOpen, load])

  // Notun message ashle auto scroll
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [msgs, panelOpen])

  const send = async () => {
    const message = text.trim()
    if (!message || sending) return
    setSending(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message, guestId: guestIdRef.current, name: myName }),
      })
      const j = await res.json()
      if (j.ok) {
        setText("")
        load()
      } else if (j.error) {
        const el = document.createElement("div")
        el.textContent = j.error
        el.className = "fixed bottom-6 right-6 bg-red-600 text-white px-4 py-2 rounded-xl shadow-xl z-[70] text-sm font-bold"
        document.body.appendChild(el)
        setTimeout(() => el.remove(), 3000)
      }
    } catch {} finally {
      setSending(false)
    }
  }

  const saveName = () => {
    const n = myName.trim().slice(0, 60)
    try {
      localStorage.setItem("tokmat_chat_name", n)
    } catch {}
    setAskingName(false)
  }

  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark")

  return (
    <>
      {/* Floating button */}
      {!panelOpen && (
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Live Chat"
          className="fixed bottom-8 right-5 z-50 group flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm pl-3 pr-4 py-3 rounded-full shadow-2xl shadow-green-500/40 hover:shadow-green-500/60 hover:scale-105 transition-all duration-300"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Live Chat
        </button>
      )}

      {/* Option menu: Telegram | Live Chat */}
      {menuOpen && !panelOpen && (
        <div className="fixed bottom-24 right-5 z-50 w-56 rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden animate-in">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2.5 text-xs font-bold">
            Chat with us
          </div>
          <button
            onClick={() => {
              setMenuOpen(false)
              setPanelOpen(true)
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-green-50 transition-colors"
          >
            <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-base">💬</span>
            Live Chat
            <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">FAST</span>
          </button>
          <a
            href={tgLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-sky-50 transition-colors border-t border-gray-100"
          >
            <span className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-base">✈️</span>
            Telegram
            <svg className="w-3.5 h-3.5 ml-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}

      {/* Chat panel */}
      {panelOpen && (
        <div className={`fixed bottom-8 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-96 h-[28rem] max-h-[70vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${isDark ? "bg-dark-900 border-dark-700" : "bg-white border-gray-200"}`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <div>
                <div className="font-bold text-sm leading-tight">Live Chat</div>
                <div className="text-[11px] text-green-100">We usually reply in a few minutes</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <a
                href={tgLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Continue on Telegram"
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                ✈️
              </a>
              <button
                onClick={() => { setPanelOpen(false); setMenuOpen(false) }}
                aria-label="Close chat"
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-lg leading-none transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          {/* Name ask (guest, first time) */}
          {askingName && (
            <div className={`px-4 py-2.5 border-b flex items-center gap-2 ${isDark ? "border-dark-700 bg-dark-800" : "border-gray-100 bg-gray-50"}`}>
              <input
                value={myName}
                onChange={(e) => setMyName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveName() }}
                placeholder="Your name (optional)"
                maxLength={60}
                className={`flex-1 text-sm px-3 py-1.5 rounded-lg border outline-none ${isDark ? "bg-dark-900 border-dark-600 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900"}`}
              />
              <button onClick={saveName} className="text-xs font-bold text-green-600 hover:text-green-700 px-1">Save</button>
              <button onClick={() => setAskingName(false)} className={`text-xs font-bold px-1 ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>Skip</button>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className={`flex-1 overflow-y-auto px-4 py-3 space-y-2.5 ${isDark ? "bg-dark-950" : "bg-gray-50"}`}>
            {loading && msgs.length === 0 ? (
              <div className={`text-xs text-center pt-8 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Loading chat...</div>
            ) : msgs.length === 0 ? (
              <div className={`text-xs text-center pt-8 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Say hi 👋 — how can we help you today?
              </div>
            ) : (
              msgs.map((m) => (
                <div key={m.id} className={`flex ${m.sender_type === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.sender_type === "user"
                      ? "bg-green-600 text-white rounded-br-md"
                      : isDark
                        ? "bg-dark-800 text-gray-200 border border-dark-700 rounded-bl-md"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                  }`}>
                    {m.sender_type === "admin" && (
                      <div className="text-[10px] font-bold text-green-600 mb-0.5">Support</div>
                    )}
                    <span className="whitespace-pre-wrap break-words">{m.message}</span>
                    <div className={`text-[10px] mt-1 text-right ${m.sender_type === "user" ? "text-green-100" : isDark ? "text-gray-500" : "text-gray-400"}`}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Telegram alternative */}
          <a
            href={tgLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-[11px] text-center py-1.5 font-semibold border-t ${isDark ? "text-sky-400 border-dark-700 bg-dark-900 hover:bg-dark-800" : "text-sky-600 border-gray-100 bg-gray-50 hover:bg-sky-50"}`}
          >
            ✈️ Prefer Telegram? Continue there instead →
          </a>

          {/* Input */}
          <div className={`px-3 py-2.5 flex items-center gap-2 border-t ${isDark ? "border-dark-700 bg-dark-900" : "border-gray-100 bg-white"}`}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Type a message..."
              maxLength={2000}
              className={`flex-1 text-sm px-3.5 py-2.5 rounded-full border outline-none focus:border-green-500 transition-colors ${isDark ? "bg-dark-800 border-dark-600 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900"}`}
            />
            <button
              onClick={send}
              disabled={sending || !text.trim()}
              aria-label="Send"
              className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors flex-shrink-0"
            >
              <svg className="w-4.5 h-4.5" width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
