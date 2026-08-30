export default function ResultsPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Trading Results</h1>
        
        <div className="bg-white rounded-xl p-6 shadow mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Performance</h2>
          <div className="grid grid-cols-2 gap-4 text-gray-600">
            <div>
              <p className="font-medium">Total Trades</p>
              <p className="text-2xl font-bold">47</p>
            </div>
            <div>
              <p className="font-medium">Win Rate</p>
              <p className="text-2xl font-bold">68%</p>
            </div>
            <div>
              <p className="font-medium">Total Profit</p>
              <p className="text-2xl font-bold">$2,450</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Trades</h2>
          <div className="space-y-3 text-gray-700">
            <div>
              <p className="font-medium">EUR/USD - Buy</p>
              <p>Entry: 1.0850 | Target: 1.0875 | Status: Closed Profitable</p>
            </div>
            <div>
              <p className="font-medium">GBP/USD - Sell</p>
              <p>Entry: 1.2650 | Target: 1.2620 | Status: Closed Profitable</p>
            </div>
            <div>
              <p className="font-medium">AUD/USD - Buy</p>
              <p>Entry: 0.6550 | Target: 0.6575 | Status: Open</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}