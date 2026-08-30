export function BrokerCard({ name, minDeposit, leverage, url }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow hover:transform hover:translate-y-2 hover:transition-all duration-300 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
      <div className="grid grid-cols-2 gap-4 text-gray-600 text-sm">
        <div>
          <span className="font-medium">Minimum Deposit</span>
          <span>${minDeposit}</span>
        </div>
        <div>
          <span className="font-medium">Maximum Leverage</span>
          <span>{leverage}</span>
        </div>
      </div>
      <div className="mt-4">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Visit Broker
        </a>
      </div>
    </div>
  )
}

export default function BrokersPage() {
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