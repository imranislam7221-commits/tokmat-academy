import { useEffect } from "react"

export default function UserDashboard({ searchParams }: { searchParams: URLSearchParams }) {
  const locale = searchParams.get("locale") || "en"
  
  useEffect(() => {
    window.history.pushState({}, "", `?locale=${locale}`)
  }, [locale])

  // Translation dictionary
  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        appName: "Tokmat Academy",
        dashboard: "User Dashboard",
        balance: "Balance",
        realTimeCharts: "Real-Time Forex Charts",
        virtualWallet: "Virtual Wallet",
        buySellOrders: "Buy/Sell Orders",
        eurUsd: "EUR/USD",
        gbpUsd: "GBP/USD",
        audUsd: "AUD/USD",
        usdChf: "USD/CHF",
        executeOrder: "Execute Order",
        closeOrder: "Close Order",
        transactionHistory: "Transaction History",
        availableBalance: "Available Balance",
        lockedForPremium: "Locked for Premium",
      },
      "en-GB": {
        appName: "Tokmat Academy",
        dashboard: "User Dashboard",
        balance: "Balance",
        realTimeCharts: "Real-Time Forex Charts",
        virtualWallet: "Virtual Wallet",
        buySellOrders: "Buy/Sell Orders",
        eurUsd: "EUR/USD",
        gbpUsd: "GBP/USD",
        audUsd: "AUD/USD",
        usdChf: "USD/CHF",
        executeOrder: "Execute Order",
        closeOrder: "Close Order",
        transactionHistory: "Transaction History",
        availableBalance: "Available Balance",
        lockedForPremium: "Locked for Premium",
      },
      fr: {
        appName: "Tokmat Academy",
        dashboard: "Tableau de bord",
        balance: "Solde",
        realTimeCharts: "Graphiques Forex en temps réel",
        virtualWallet: "Portefeuille virtuel",
        buySellOrders: "Ordres d'achat/vente",
        eurUsd: "EUR/USD",
        gbpUsd: "GBP/USD",
        audUsd: "AUD/USD",
        usdChf: "USD/CHF",
        executeOrder: "Passer un ordre",
        closeOrder: "Clôturer un ordre",
        transactionHistory: "Historique des transactions",
        availableBalance: "Solde disponible",
        lockedForPremium: "Verrouillé pour Premium",
      },
      ms: {
        appName: "Tokmat Academy",
        dashboard: "Dashboard",
        balance: "Saldo",
        realTimeCharts: "Chart Forex real-time",
        virtualWallet: "Dompet Virtual",
        buySellOrders: "Beli/Jual",
        eurUsd: "EUR/USD",
        gbpUsd: "GBP/USD",
        audUsd: "AUD/USD",
        usdChf: "USD/CHF",
        executeOrder: "Tertak Order",
        closeOrder: "Tutup Order",
        transactionHistory: "Sejarah Transaksi",
        availableBalance: "Saldo Tersedia",
        lockedForPremium: "Dikunci untuk Premium",
      },
      ar: {
        appName: "Tokmat Academy",
        dashboard: "التحكم",
        balance: "الرصيد",
        realTimeCharts: "رسوم بيقية فوركس في الوقت الفعلي",
        virtualWallet: "محفظة افتراضية",
        buySellOrders: "طلبات الشراء/البيع",
        eurUsd: "EUR/USD",
        gbpUsd: "GBP/USD",
        audUsd: "AUD/USD",
        usdChf: "USD/CHF",
        executeOrder: "تنفيذ أمر",
        closeOrder: "إغلاق أمر",
        transactionHistory: "تاريخ المعاملات",
        availableBalance: "الرصيد المتاح",
        lockedForPremium: "مLocked لل Premium",
      },
    }
    return translations[locale as keyof typeof translations]?.[key] || key
  }

  const walletBalance = 1245.50

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{t("dashboard")}</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{t("balance")}: ${walletBalance}</span>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              {t("addFunds")}
            </button>
          </div>
        </div>
      </nav>

      <div className="p-4 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl p-6 mb-8 shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t("realTimeCharts")}</h2>
          <div id="tradingview-widget" className="h-64 w-full rounded-xl bg-gray-100"></div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t("virtualWallet")}</h3>
            <p className="text-gray-600">Track your balances and transaction history</p>
            <ul className="space-y-2 text-gray-700">
              <li>{t("availableBalance")}: ${walletBalance}</li>
              <li>{t("lockedForPremium")}: $0</li>
              <li>Transaction History: 0 entries</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t("buySellOrders")}</h3>
            <div className="space-y-3">
              <div>
                <select className="shadow appearance-none border rounded py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full">
                  <option>{t("eurUsd")}</option>
                  <option>{t("gbpUsd")}</option>
                  <option>{t("audUsd")}</option>
                  <option>{t("usdChf")}</option>
                </select>
                <button className="bg-blue-600 text-white mt-2 py-2 px-4 rounded hover:bg-blue-700 w-full">
                  {t("executeOrder")}
                </button>
              </div>
              <div>
                <select className="shadow appearance-none border rounded py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full">
                  <option>{t("eurUsd")}</option>
                  <option>{t("gbpUsd")}</option>
                  <option>{t("audUsd")}</option>
                  <option>{t("usdChf")}</option>
                </select>
                <button className="bg-red-600 text-white mt-2 py-2 px-4 rounded hover:bg-red-700 w-full">
                  {t("closeOrder")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <script>
      // TradingView Widget Initialization
      new TradingView.widget({
        "autosize": true,
        "symbol": "FX:EURUSD",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "container_id": "tradingview-widget"
      });
    </script>
  )
}