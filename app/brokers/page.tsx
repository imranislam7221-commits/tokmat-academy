import { BrokerCard } from "@/components/BrokerCard"
import { use } from "react"

export default function BrokersPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = use(searchParams)
  const locale = params?.locale || "en"
  const brokers = [
    { name: "Exness Global", minDeposit: "$10", leverage: "1:Unlimited", url: "https://exness.com" },
    { name: "XM Markets", minDeposit: "$5", leverage: "1:1000", url: "https://xm.com" },
    { name: "IC Markets", minDeposit: "$200", leverage: "1:500", url: "https://icmarkets.com" },
    { name: "Pepperstone", minDeposit: "$0", leverage: "1:500", url: "https://pepperstone.com" },
  ]

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Trusted Brokers</h1>
        </div>
      </nav>

      <div className="p-4 max-w-7xl mx-auto grid grid-cols-1 gap-6 md:grid-cols-2">
        {brokers.map((broker) => (
          <BrokerCard key={broker.name} {...broker} />
        ))}
      </div>
    </main>
  )
}