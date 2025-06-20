"use client"

import Link from "next/link"
import { Github, Twitter } from "lucide-react"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur-sm mt-auto">
      <div className="container flex flex-col gap-6 px-4 py-8 md:px-6"> {/* Reduced py-10 to py-8 */}
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-6"> {/* Reduced gap-8 to gap-6 */}
          <div className="space-y-3"> {/* Reduced space-y-4 to space-y-3 */}
            <div className="flex items-center gap-2 font-bold">
             <Image className="rounded-full" src="/icon.png" alt="PlanWisr Logo" width={32} height={32} />
                         <span className="text-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">PlanWisr</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Simplify how you work. PlanWisr brings your projects, time, and productivity under one roof.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row justify-between items-center border-t border-border/40 pt-6"> {/* Reduced pt-8 to pt-6 */}
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} PlanWisr. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}