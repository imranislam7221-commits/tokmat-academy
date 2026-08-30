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