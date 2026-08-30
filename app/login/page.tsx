import { useEffect } from "react"

const ADMIN_EMAIL = "admin@tokmatacademy.com"

export default function LoginPage({ searchParams }: { searchParams: URLSearchParams }) {
  const locale = searchParams.get("locale") || "en"
  const email = searchParams.get("email") || ""
  const redirectTo = email === ADMIN_EMAIL ? "/admin" : "/dashboard"

  useEffect(() => {
    window.history.pushState({}, "", `?locale=${locale}`)
  }, [locale])

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Login to Tokmat Academy</h2>
        
        {/* Show admin notice */}
        {email === ADMIN_EMAIL && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p className="font-medium">Super Admin Login Detected</p>
            <p className="text-sm">
              Logging in with this email will grant you full Admin Dashboard access.
            </p>
          </div>
        )}

        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.target as HTMLFormElement)
          const loginEmail = formData.get("email") as string
          const searchUrl = new URL(`/login?locale=${locale}&email=`, window.location.origin)
          searchUrl.searchParams.set("email", loginEmail)
          window.location.href = searchUrl.toString()
        }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input 
              type="email" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { /* handle input */ }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full">
            Sign In
          </button>
          <p className="text-center text-sm text-gray-500">
            <a href="/register?locale={locale}" className="font-medium text-blue-600 hover:underline">
              Create an account
            </a>
          </p>
        </form>
      </div>
    </main>

    <script>
      // Auto-redirect based on email
      document.addEventListener('DOMContentLoaded', () => {
        const urlParams = new URLSearchParams(window.location.search)
        const locale = urlParams.get('locale') || 'en'
        const email = urlParams.get('email')
        const adminEmail = 'admin@tokmatacademy.com'
        
        // Update language in URL if changed
        const localeSelect = document.querySelectorAll(`[data-locale]`)
        if (localeSelect) {
          localeSelect.forEach(el => {
            el.addEventListener('click', () => {
              window.location.href = `/${locale}`
            })
          })
        }
        
        if (email === adminEmail) {
          setTimeout(() => {
            window.location.href = `/admin?locale=${locale}`
          }, 1500)
        } else if (email) {
          setTimeout(() => {
            window.location.href = `/dashboard?locale=${locale}`
          }, 1500)
        }
      })
    </script>
  )
}