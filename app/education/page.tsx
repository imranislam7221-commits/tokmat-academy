import { useEffect } from "react"

export default function EducationPage({ searchParams }: { searchParams: URLSearchParams }) {
  const locale = searchParams.get("locale") || "en"
  
  useEffect(() => {
    window.history.pushState({}, "", `?locale=${locale}`)
  }, [locale])

  // Translation dictionary
  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        appName: "Tokmat Academy",
        education: "Education",
        freeTier: "Free Tier",
        premiumTier: "Premium Tier",
        buyNow: "Buy Now",
        unlockPremium: "Unlock Premium",
        oncePayment: "Once payment is confirmed, permanent access is granted automatically.",
        freeMaterials: "Basic educational materials, introductory Forex videos, market updates, and foundational text guides open to all registered users.",
        premiumVideos: "Premium educational videos and photos uploaded by the Admin. These assets require payment to unlock.",
        monthlyAccess: "$49 Monthly Access",
        lifetime: "$199 Lifetime",
        unlockPremiumButton: "Unlock Premium",
      },
      "en-GB": {
        appName: "Tokmat Academy",
        education: "Education",
        freeTier: "Free Tier",
        premiumTier: "Premium Tier",
        buyNow: "Buy Now",
        unlockPremium: "Unlock Premium",
        oncePayment: "Once payment is confirmed, permanent access is granted automatically.",
        freeMaterials: "Basic educational materials, introductory Forex videos, market updates, and foundational text guides open to all registered users.",
        premiumVideos: "Premium educational videos and photos uploaded by the Admin. These assets require payment to unlock.",
        monthlyAccess: "$49 Monthly Access",
        lifetime: "$199 Lifetime",
        unlockPremiumButton: "Unlock Premium",
      },
      fr: {
        appName: "Tokmat Academy",
        education: "Éducation",
        freeTier: "Niveau gratuit",
        premiumTier: "Niveau premium",
        buyNow: "Acheter",
        unlockPremium: "Débloquer",
        oncePayment: "Une fois le paiement confirmé, l'accès permanent est accordé automatiquement.",
        freeMaterials: "Matériaux éducatifs de base, vidéos d'introduction Forex, mises à jour du marché et guides textuels fondamentaux ouverts à tous les utilisateurs enregistrés.",
        premiumVideos: "Vidéos et photos éducatives premium téléchargées par l'administrateur. Ces actifs nécessitent un paiement pour débloquer.",
        monthlyAccess: "Accès mensuel 49 $",
        lifetime: "199 $ à vie",
        unlockPremiumButton: "Débloquer",
      },
      ms: {
        appName: "Tokmat Academy",
        education: "Pendidikan",
        freeTier: "Tingkat Percuma",
        premiumTier: "Tingkat Premium",
        buyNow: "Belilah",
        unlockPremium: "Buka",
        oncePayment: "Setiap pembayaran dikonfirmasi, akses perpetual diberikan secara automatik.",
        freeMaterials: " bahan pendidikan asas, video Forex pengenalan, matawang pautan, dan panduan teks asas terbuka kepada pengguna bergabung.",
        premiumVideos: "Videi dan imej pendidikan premium diurus oleh Admin. Aset ini perlu bayaran untuk membuka.",
        monthlyAccess: "$49 Bulanan",
        lifetime: "$199 Seumur hidup",
        unlockPremiumButton: "Buka Premium",
      },
      ar: {
        appName: "Tokmat Academy",
        education: "التعليم",
        freeTier: "المستوى المجاني",
        premiumTier: "المستوى المميز",
        buyNow: "اشتري الآن",
        unlockPremium: "فك القفل",
        oncePayment: "بمجرد تأكيد الدفع، يتم منح الوصول الدائم تلقائياً.",
        freeMaterials: "مواد تعليمية أساسية، فيديوهات introductive Forex, تحديثات السوق، ومرشدات نصية foundations مفتوحة لجميع المستخدمين المسجلين.",
        premiumVideos: "فيديوهات وصور تعليمية Premiumuploaded by the Admin. These assets require payment to unlock.",
        monthlyAccess: "اشتراك شهري 49 $",
        lifetime: "199 $ للحياة",
        unlockPremiumButton: "فك القفل",
      },
    }
    return translations[locale as keyof typeof translations]?.[key] || key
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{t("education")}</h1>
        </div>
      </nav>

      <div className="p-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Free Tier Content */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-3">{t("freeTier")}</h3>
            <p className="text-gray-600 mb-4">{t("freeMaterials")}</p>
            <ul className="space-y-2 text-gray-700">
              <li>Forex Basics Course</li>
              <li>Market Analysis Fundamentals</li>
              <li>Risk Management Guide</li>
              <li>Technical Analysis Intro</li>
            </ul>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {t("unlockPremiumButton")}
            </button>
          </div>

          {/* Premium Tier Content */}
          <div className="bg-gray-800 rounded-xl p-6 shadow text-white">
            <h3 className="text-lg font-bold text-gray-300 mb-3">{t("premiumTier")}</h3>
            <p className="text-gray-400 mb-4">{t("premiumVideos")}</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-gray-700 rounded text-center">
                <div className="text-2xl font-bold text-yellow-500">{t("monthlyAccess")}</div>
                <div>{t("monthlyAccess").includes("$") ? "Monthly Access" : "Accès mensuel"}</div>
              </div>
              <div className="p-3 bg-gray-700 rounded text-center">
                <div className="text-2xl font-bold text-yellow-500">{t("lifetime")}</div>
                <div>{t("lifetime").includes("$") ? "lifetime" : "à vie"}</div>
              </div>
            </div>
            <button className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-500 mb-4">
              {t("unlockPremiumButton")}
            </button>
            <p className="text-xs text-gray-400">{t("oncePayment")}</p>
          </div>
        </div>
      </div>
    </main>
  )
}