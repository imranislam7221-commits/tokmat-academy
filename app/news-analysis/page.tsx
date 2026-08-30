export default function NewsAnalysisPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">News Analysis</h1>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Major News */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-3">High Impact News</h3>
            <ul className="space-y-3 text-gray-600">
              <li>
                <p className="font-medium">CPI Inflation Data (US)</p>
                <p className="text-sm text-gray-500">Tomorrow, 08:30 AM GMT</p>
              </li>
              <li>
                <p className="font-medium">FED Interest Rate Decision</p>
                <p className="text-sm text-gray-500">Next week, 02:00 PM GMT</p>
              </li>
              <li>
                <p className="font-medium">Non-Farm Payrolls</p>
                <p className="text-sm text-gray-500">Next month, 01:30 PM GMT</p>
              </li>
            </ul>
          </div>

          {/* Market Analysis */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Daily Analysis</h3>
            <p className="text-gray-600">
              EUR/USD shows bullish momentum with resistance at 1.0900. GBP/USD faces
              selling pressure near 1.2650 level.
            </p>
            <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              Read Full Analysis
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}