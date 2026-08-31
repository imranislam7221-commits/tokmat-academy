"use client"

import { use, useState, useEffect } from "react"
import { useTheme } from "@/components/ThemeProvider"
import { t as translate, type Locale } from "@/lib/translations"

export default function RegisterPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = use(searchParams)
  const locale = (params?.locale || "en") as Locale
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const t = (key: string) => translate(locale, key)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const getPasswordStrength = (pw: string): { score: number; label: string; color: string } => {
    let score = 0
    if (pw.length >= 6) score++
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    if (score <= 1) return { score, label: t("weak"), color: "bg-red-500" }
    if (score <= 2) return { score, label: t("fair"), color: "bg-orange-500" }
    if (score <= 3) return { score, label: t("good"), color: "bg-yellow-500" }
    if (score <= 4) return { score, label: t("strong"), color: "bg-green-500" }
    return { score, label: t("veryStrong"), color: "bg-emerald-500" }
  }

  const passwordStrength = getPasswordStrength(password)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!firstName.trim()) newErrors.firstName = t("requiredField")
    if (!lastName.trim()) newErrors.lastName = t("requiredField")
    if (!email.trim()) newErrors.email = t("requiredField")
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = t("invalidEmail")
    if (!password) newErrors.password = t("requiredField")
    else if (password.length < 6) newErrors.password = t("passwordMinLength")
    if (!confirmPassword) newErrors.confirmPassword = t("requiredField")
    else if (password !== confirmPassword) newErrors.confirmPassword = t("passwordMismatch")
    if (!agreed) newErrors.agreed = t("mustAgree")
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      alert(`${firstName} ${lastName} - Account created! (${email})`)
    }, 1500)
  }

  return (
    <main className={`min-h-screen flex items-center justify-center px-4 py-12 transition-colors ${isDark ? "bg-dark-950" : "bg-gray-50"}`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className={`text-2xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>Tokmat <span className="text-blue-600">Academy</span></span>
          </a>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{t("registerTitle")}</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{t("registerSubtitle")}</p>
        </div>

        <div className={`rounded-2xl p-8 shadow-elevated border transition-colors ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100"}`}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{t("firstName")}</label>
                <input type="text" value={firstName} onChange={(e) => { setFirstName(e.target.value); setErrors(p => ({ ...p, firstName: "" })) }} placeholder={locale === "hi" ? "इमरान" : "John"}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm ${errors.firstName ? "border-red-400 bg-red-50" : isDark ? "bg-dark-700 border-dark-600 text-white placeholder-gray-500" : "border-gray-200"}`} />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{t("lastName")}</label>
                <input type="text" value={lastName} onChange={(e) => { setLastName(e.target.value); setErrors(p => ({ ...p, lastName: "" })) }} placeholder={locale === "hi" ? "खान" : "Doe"}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm ${errors.lastName ? "border-red-400 bg-red-50" : isDark ? "bg-dark-700 border-dark-600 text-white placeholder-gray-500" : "border-gray-200"}`} />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{t("email")}</label>
              <div className="relative">
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })) }} placeholder="you@gmail.com"
                  className={`w-full px-4 py-3 pl-10 rounded-xl border outline-none transition-all text-sm ${errors.email ? "border-red-400 bg-red-50" : isDark ? "bg-dark-700 border-dark-600 text-white placeholder-gray-500" : "border-gray-200"}`} />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{t("password")}</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })) }} placeholder="••••••••"
                  className={`w-full px-4 py-3 pl-10 pr-10 rounded-xl border outline-none transition-all text-sm ${errors.password ? "border-red-400 bg-red-50" : isDark ? "bg-dark-700 border-dark-600 text-white placeholder-gray-500" : "border-gray-200"}`} />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>{t("passwordStrength")}</span>
                    <span className={`text-xs font-semibold ${passwordStrength.score <= 1 ? "text-red-500" : passwordStrength.score <= 2 ? "text-orange-500" : passwordStrength.score <= 3 ? "text-yellow-600" : "text-green-600"}`}>{passwordStrength.label}</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-dark-700" : "bg-gray-100"}`}>
                    <div className={`h-full rounded-full transition-all duration-500 ${passwordStrength.color}`} style={{ width: `${(passwordStrength.score / 5) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{t("confirmPassword")}</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: "" })) }} placeholder="••••••••"
                  className={`w-full px-4 py-3 pl-10 pr-10 rounded-xl border outline-none transition-all text-sm ${errors.confirmPassword ? "border-red-400 bg-red-50" : confirmPassword && password === confirmPassword ? "border-green-400 bg-green-50" : isDark ? "bg-dark-700 border-dark-600 text-white placeholder-gray-500" : "border-gray-200"}`} />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showConfirmPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              {confirmPassword && password === confirmPassword && !errors.confirmPassword && (
                <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  {t("passwordsMatch")}
                </p>
              )}
            </div>

            <div className={`flex items-start gap-2 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              <input type="checkbox" checked={agreed} onChange={() => { setAgreed(!agreed); setErrors(p => ({ ...p, agreed: "" })) }} className="rounded border-gray-300 mt-0.5 text-blue-600 focus:ring-blue-200" />
              <span>{t("agreeTerms")} <a href="#" className="text-blue-600 hover:underline">{t("termsOfService")}</a> {t("and")} <a href="#" className="text-blue-600 hover:underline">{t("privacyPolicy")}</a></span>
            </div>
            {errors.agreed && <p className="text-red-500 text-xs">{errors.agreed}</p>}

            <button type="submit" disabled={submitting}
              className={`w-full font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 ${submitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"} text-white`}>
              {submitting ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>{t("creatingAccount")}</>
              ) : (
                <>{t("createAccount")} <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className={`flex-1 h-px ${isDark ? "bg-dark-600" : "bg-gray-200"}`} />
            <span className={`text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>{t("or")}</span>
            <div className={`flex-1 h-px ${isDark ? "bg-dark-600" : "bg-gray-200"}`} />
          </div>

          <button className={`w-full flex items-center justify-center gap-3 border font-medium py-3 rounded-xl transition-all text-sm ${isDark ? "bg-dark-700 border-dark-600 text-gray-300 hover:bg-dark-600" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            {t("continueWithGoogle")}
          </button>

          <div className="mt-6 text-center text-sm">
            <span className={isDark ? "text-gray-400" : "text-gray-500"}>{t("alreadyHaveAccount")}</span> <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">{t("signIn")}</a>
          </div>
        </div>
      </div>
    </main>
  )
}