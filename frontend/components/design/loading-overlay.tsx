"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LoadingOverlayProps {
  message?: string
  isOpen: boolean
  onClose?: () => void
}

export function LoadingOverlay({ message = "Processing", isOpen, onClose }: LoadingOverlayProps) {
  // If component is mounted
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-[#333333] rounded-lg p-8 max-w-md w-full flex flex-col items-center">
        {/* Always show the close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-white hover:bg-[#C3FF00]/20 z-10"
          onClick={() => onClose && onClose()}
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="loader">
          <div className="loading-text">
            {message}
            <div className="dots-container">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
          <div className="loading-bar-background">
            <div className="loading-bar">
              <div className="white-bars-container">
                <div className="white-bar"></div>
                <div className="white-bar"></div>
                <div className="white-bar"></div>
                <div className="white-bar"></div>
                <div className="white-bar"></div>
                <div className="white-bar"></div>
                <div className="white-bar"></div>
                <div className="white-bar"></div>
                <div className="white-bar"></div>
                <div className="white-bar"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
