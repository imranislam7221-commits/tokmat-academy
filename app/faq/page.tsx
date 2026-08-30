export default function FaqPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h1>
        
        <div className="bg-white rounded-xl shadow p-6">
          <div className="mb-4 border-b border-gray-200">
            <button className="w-full text-left py-3 text-gray-700 font-medium hover:text-blue-600 transition-colors">
              How do I register?
            </button>
          </div>
          <div className="mb-4 border-b border-gray-200">
            <button className="w-full text-left py-3 text-gray-700 font-medium hover:text-blue-600 transition-colors">
              What payment methods do you accept?
            </button>
          </div>
          <div className="mb-4 border-b border-gray-200">
            <button className="w-full text-left py-3 text-gray-700 font-medium hover:text-blue-600 transition-colors">
              How do I access premium content?
            </button>
          </div>
          <div>
            <button className="w-full text-left py-3 text-gray-700 font-medium hover:text-blue-600 transition-colors">
              Can I use the platform from Bangladesh?
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}