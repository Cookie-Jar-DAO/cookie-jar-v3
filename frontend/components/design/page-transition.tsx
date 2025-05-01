"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"

interface PageTransitionProps {
  children: ReactNode
  noTopMargin?: boolean
}

export function PageTransition({ children, noTopMargin = false }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.5,
      }}
      className={`min-h-screen ${noTopMargin ? "mt-0 pt-0" : ""}`}
    >
      {children}
    </motion.div>
  )
}
