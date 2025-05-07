"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  // Check if current page is the jars page or profile page
  const isJarsPage = pathname === "/jars"
  const isProfilePage = pathname === "/profile"

  // Check if device is mobile and show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  // Set the top scroll listener and check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("scroll", toggleVisibility)
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("scroll", toggleVisibility)
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // Don't render the button on jars page, but still call all hooks
  if (isJarsPage) {
    return null
  }

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed z-[999] p-3 rounded-full bg-[#c3ff00] text-[#1F1F1F] shadow-lg transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none",
        isMobile
          ? isProfilePage
            ? "bottom-[20px] right-[20px]" // Adjusted position for profile page
            : "bottom-[100px] right-4"
          : "bottom-6 right-6",
      )}
      aria-label="Scroll to top"
      id="main-scroll-to-top-button"
    >
      <ArrowUp className="h-6 w-6" />
    </button>
  )
}
