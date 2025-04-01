import type React from "react"
import "@/styles/globals.css"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"

import './globals.css'
import { Navbar } from "@/components/navbar"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Home - PlanWise",
  description: "Manage your time and tasks effectively with PlanWise.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Navbar/>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}