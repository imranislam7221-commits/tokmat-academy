export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-gray-800 text-white">
      <nav className="bg-gray-900 border-b border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-200">Master Gmail</span>
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="p-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="bg-gray-800 rounded-xl p-6 shadow">
            <h3 className="text-semibold text-gray-300 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-white" id="total-users">0</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 shadow">
            <h3 className="text-semibold text-gray-300 mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-white" id="total-revenue">$0</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 shadow">
            <h3 className="text-semibold text-gray-300 mb-2">Active Wallets</h3>
            <p className="text-3xl font-bold text-white" id="active-wallets">0</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="bg-gray-800 rounded-xl p-6 shadow">
            <h3 className="text-semibold text-gray-300 mb-4">User Management</h3>
            <ul className="space-y-3 text-gray-300">
              <li>View all registered users</li>
              <li>Suspend/activate accounts</li>
              <li>Reset user passwords</li>
              <li>Adjust user balances</li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow">
            <h3 className="text-semibold text-gray-300 mb-4">Media & Paywall</h3>
            <ul className="space-y-3 text-gray-300">
              <li>Upload premium videos/photos</li>
              <li>Set individual pricing</li>
              <li>Toggle free/paid status</li>
              <li>View unlocked content stats</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-gray-800 rounded-xl p-6 shadow">
          <h3 className="text-semibold text-gray-300 mb-4">Broker Affiliate Manager</h3>
          <p className="text-gray-400">Manage broker banners and affiliate links</p>
        </div>
      </div>
    </main>
  )
}