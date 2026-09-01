"use client"
import { useState, useEffect } from "react"

import { BrokerCard } from "@/components/BrokerCard"
import { useTheme } from "@/components/ThemeProvider"
import { t as translate, type Locale } from "@/lib/translations"

export default function BrokersPage() {
  
  const [locale, setLocale] = useState<Locale>("en")
  useEffect(() => { const p = new URLSearchParams(window.location.search); setLocale((p.get("locale") || "en") as Locale); }, [])
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const t = (key: string) => translate(locale, key)

  const brokers = [
    { name: "Exness Global", minDeposit: "$10", leverage: "1:Unlimited", url: "https://exness.com" },
    { name: "XM Markets", minDeposit: "$5", leverage: "1:1000", url: "https://xm.com" },
    { name: "IC Markets", minDeposit: "$200", leverage: "1:500", url: "https://icmarkets.com" },
    { name: "Pepperstone", minDeposit: "$0", leverage: "1:500", url: "https://pepperstone.com" },
  ]

  return (
    <main className={`min-h-screen px-4 py-12 transition-colors duration-300 ${isDark ? "bg-dark-950" : "bg-gray-50"}`}>
      <section className="bg-gradient-to-br from-dark-950 via-dark-900 to-blue-950 text-white py-14 px-4 -mx-4 -mt-12 mb-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">{t("brokers")}</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">{t("brokerPartners")}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-6 md:grid-cols-2">
        {brokers.map((broker) => (
          <BrokerCard key={broker.name} {...broker} />
        ))}
      </div>
    </main>
  )
}
