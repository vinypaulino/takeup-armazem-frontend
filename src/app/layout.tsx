import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>FreeLance Cotton - Sistema de Gestão de Armazém</title>
        <link rel="icon" href="/images/logo-freelance-cotton.jpeg" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <footer className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="text-center">
              <p className="text-gray-500 text-sm">Paulino&apos;s Consultoria de Sistemas</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
