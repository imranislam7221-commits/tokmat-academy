import { ThemeProvider } from "@/components/ThemeProvider"
import { Header } from "@/components/Header"
import "./globals.css"

export const metadata = {
  title: "Tokmat Academy - Forex Education Platform",
  description: "International Forex Education & Trading Platform",
}

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale?: string }> }) {
  const { locale = "en" } = await params
  
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gray-50 min-h-screen transition-colors duration-300">
        <ThemeProvider>
          <Header locale={locale} />
          <main className="pt-20">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}