"use client"

import { useSiteSettings } from "@/lib/useSiteSettings"
import { useTheme } from "@/components/ThemeProvider"

// Broker affiliate CTA — link ek jaygay (admin panel → Broker Link), ei component sob jaygay reuse hoy.
// compact = signal card er niche choto link; default = boro banner.
// broker_link khali thakle kichu render hoy na (CTA off).

export function BrokerCTA({ compact = false }: { compact?: boolean }) {
  const { brokerLink, brokerName } = useSiteSettings()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  if (!brokerLink) return null
  const name = brokerName || "our partner broker"

  if (compact) {
    return (
      <a
        href={brokerLink}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`mt-3 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg border transition-colors ${
          isDark
            ? "text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
            : "text-blue-600 border-blue-200 hover:bg-blue-50"
        }`}
      >
        Trade this with {name}
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </a>
    )
  }

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 ${
        isDark
          ? "bg-dark-800 border-dark-700"
          : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
      }`}
    >
      <div className="flex-1">
        <div className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-1">Recommended Broker</div>
        <h3 className={`text-lg font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>
          Trade these signals with {name}
        </h3>
        <p className={`text-sm mt-1 leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Free account in 2 minutes — low spreads, fast withdrawals. We may earn a commission from this link.
        </p>
      </div>
      <a
        href={brokerLink}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm whitespace-nowrap transition-colors shadow-lg shadow-blue-500/20"
      >
        Open Free Account
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </a>
    </div>
  )
}
