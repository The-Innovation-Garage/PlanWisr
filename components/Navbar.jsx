"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Moon, Sun, ChevronRight, User, Settings, LogOut, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Crown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useUserStore } from "@/store/store"
import Image from "next/image"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  // User state from store
  const { isLogin, fullName, lastName, IsPro, Projects } = useUserStore()
  const { SetIsLogin, aiLimit, SetAiLimit, SetFullName, SetUsername, SetEmail, SetUserId, SetProjects } = useUserStore()

  // Scroll effect for navbar background
  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Verify user token on mount
  useEffect(() => {
    verifyToken()
  }, [])

  const verifyToken = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const res = await fetch(`/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      console.log("Token verification response:", data)

      if (data.type === "success") {
        SetIsLogin(true)
        SetFullName(data.user.name)
        console.log(data.user._id)
        SetUserId(data.user._id)
        SetEmail(data.user.email)
        SetProjects(data.projects || 0) // Set projects count if available
        let limit = data.user.aiLimit || 0
        console.log(limit, data.user.aiLimit)
        SetAiLimit(limit) // Default AI limit if not set
      } else {
        SetIsLogin(false)
      }
    } catch (error) {
      SetIsLogin(false)
      console.error("Token verification failed", error)
    }
  }

  // Theme toggle handler
  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [theme, setTheme])

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token")
    SetIsLogin(false)
    SetFullName("")
    SetUserId("")
    SetEmail("")
    toast.success("Logged out successfully")
    router.push("/")
  }

  // Close mobile menu on link click
  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false)
  }

  // Extract main navigation links for reuse
  const NavLinks = (
    <>
      <Link href="/" onClick={handleMobileLinkClick} className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        Home
      </Link>
      <Link href="/projects" onClick={handleMobileLinkClick} className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        Projects
      </Link>
      <Link href="/#pricing" onClick={handleMobileLinkClick} className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        Pricing
      </Link>
      <Link href="/#faq" onClick={handleMobileLinkClick} className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        FAQ
      </Link>
    </>
  )

  return (
    <header
      aria-label="Primary Navigation"
      className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${isScrolled ? "bg-background/80 shadow-sm" : "bg-transparent"
        }`}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-primary">
          <Link href="/" className="flex items-center gap-2" aria-label="Go to homepage">
            <Image className="rounded-full" src="/icon.png" alt="Effinova Logo" width={32} height={32} />
            <span className="text-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">PlanWisr</span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex gap-8" role="navigation" aria-label="Primary desktop navigation">
          {NavLinks}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Notifications Dropdown */}
            {isLogin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="View notifications" title="Notifications">
                    <Bell className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60" align="end" forceMount>
                  <p className="px-4 py-2 font-semibold">Notifications</p>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Theme toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle dark/light mode" className="rounded-full">
              {mounted && theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* User Menu or Auth buttons */}
            {isLogin ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                    aria-label="User menu"
                    title={fullName}
                  >
                    <div className="relative h-8 w-8">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{fullName ? fullName.charAt(0) : "U"}</AvatarFallback>
                      </Avatar>
                      {IsPro && (
                        <>
                          {/* Premium ring effect */}
                          <div
                            className="absolute inset-0 rounded-full animate-pulse"
                            style={{
                              background: 'conic-gradient(from 0deg, #4f46e5, #9333ea, #4f46e5)',
                              padding: '2px',
                              borderRadius: '50%'
                            }}
                          >
                            <div className="w-full h-full rounded-full bg-background"></div>
                          </div>
                        </>
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center gap-2 p-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{fullName ? fullName.charAt(0) : "U"}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex flex-col space-y-1 flex-1">
                      <p className="font-medium">{fullName}</p>

                      {/* AI Credits Progress */}
                      <div className="flex flex-col space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">AI Credits</span>
                          <span className="text-muted-foreground">{aiLimit}/10</span>
                        </div>
                        <div className="h-1 w-full bg-secondary rounded-full">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${(aiLimit / 10) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Projects Progress */}
                      <div className="flex flex-col space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Projects</span>
                          <span className={`text-muted-foreground ${Projects >= 5 ? 'text-orange-500 font-medium' : ''}`}>
                            {Projects}/5
                          </span>
                        </div>
                        <div className="h-1 w-full bg-secondary rounded-full">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${Projects >= 5
                                ? 'bg-orange-500'
                                : Projects >= 4
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                            style={{ width: `${Math.min((Projects / 5) * 100, 100)}%` }}
                          />
                        </div>
                        {Projects >= 5 && (
                          <p className="text-xs text-orange-500 font-medium">Project limit reached</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 w-full">
                      <User className="w-4 h-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2 w-full">
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Log in
                </Link>
                <Button className="rounded-full bg-primary hover:bg-primary/90">
                  <Link href="/signup" className="flex items-center gap-1 px-3 py-1 text-white">
                    Get Started <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="md:hidden"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-lg shadow-lg"
          >
            <div className="flex flex-col p-4 gap-4">{NavLinks}</div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}