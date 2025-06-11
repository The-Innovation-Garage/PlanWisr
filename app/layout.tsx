import type React from "react"
import "@/styles/globals.css"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import FeedbackWidget from "@/components/FeedbackWidget" // Fix the import path

import './globals.css'
import { Navbar } from "@/components/Navbar"
import { Toaster } from "react-hot-toast"
import Script from "next/script"
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
      <Script
      src="https://app.pocketsflow.com/pocketsflow-popup.js"
      data-subdomain="psychocoder"
    ></Script>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Toaster/>
          <Navbar/>
          {/* <FeedbackWidget/> */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}