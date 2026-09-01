"use client"

import { useTheme } from "@/components/ThemeProvider"

interface BrokerCardProps {
  name: string
  minDeposit: string | number
  leverage: string
  url: string
}

export function BrokerCard({ name, minDeposit, leverage, url }: BrokerCardProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className={`rounded-xl p-6 shadow hover:transform hover:translate-y-2 hover:transition-all duration-300 border transition-colors ${isDark ? "bg-dark-800 border-dark-700 hover:border-blue-500/30" : "bg-white border-gray-100 hover:border-blue-200"}`}>
      <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{name}</h3>
      <div className={`grid grid-cols-2 gap-4 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
        <div>
          <span className="font-medium">Minimum Deposit</span>
          <span className="block">{minDeposit}</span>
        </div>
        <div>
          <span className="font-medium">Maximum Leverage</span>
          <span className="block">{leverage}</span>
        </div>
      </div>
      <div className="mt-4">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold inline-block"
        >
          Visit Broker
        </a>
      </div>
    </div>
  )
}
