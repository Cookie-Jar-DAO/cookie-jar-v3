"use client"

import { useRef, useState, useEffect, type ReactNode } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

interface ParallaxHomeLayoutProps {
  children: ReactNode
}

export function ParallaxHomeLayout({ children }: ParallaxHomeLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)
  const { scrollY } = useScroll()

  // Create parallax effect for background
  const backgroundY = useTransform(scrollY, [0, 1000], [0, 300])

  // Convert children to array for rendering
  const childrenArray = Array.isArray(children) ? children : [children]

  // Add scroll event listener to hide/show the scroll indicator
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      // Get the scroll position and document height
      const scrollPosition = window.scrollY + window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Hide indicator when near bottom (within 100px of bottom)
      // Show it when scrolling back up
      if (documentHeight - scrollPosition < 100) {
        setShowScrollIndicator(false)
      } else {
        setShowScrollIndicator(true)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div ref={containerRef} className="relative bg-[#fff8f0] overflow-hidden">
      {/* Subtle parallax background effect */}
      <motion.div className="absolute inset-0 pointer-events-none opacity-10" style={{ y: backgroundY }}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff5e14]/5 to-[#3c2a14]/5"></div>
      </motion.div>

      {/* Render each child as a section */}
      {childrenArray.map((child, index) => (
        <section key={index} className="w-full relative">
          {child}
        </section>
      ))}

      {/* Scroll indicator - only show on first screen and when not at bottom */}
      {showScrollIndicator && (
        <motion.div
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        >
          <motion.div className="w-6 h-10 rounded-full border-2 border-[#ff5e14] flex justify-center p-1">
            <motion.div
              className="w-1 h-2 bg-[#ff5e14] rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
