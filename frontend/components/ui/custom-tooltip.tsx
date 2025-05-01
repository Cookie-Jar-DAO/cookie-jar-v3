"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

interface CustomTooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  className?: string
  tooltipClassName?: string
  position?: "top" | "bottom" | "left" | "right"
  maxWidth?: string
}

export function CustomTooltip({
  content,
  children,
  className,
  tooltipClassName,
  position = "top",
  maxWidth = "max-w-xs",
}: CustomTooltipProps) {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }

  return (
    <div className={cn("relative group/tooltip inline-flex", className)}>
      {children}
      <div
        className={cn(
          "absolute z-[9999] invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 bg-[#393939] text-white p-2 rounded-md shadow-lg w-max border border-[#555555]",
          maxWidth,
          positionClasses[position],
          tooltipClassName,
        )}
      >
        <div className="relative">
          {content}
          {/* Arrow for tooltip */}
          {position === "top" && (
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-t-[6px] border-l-[6px] border-r-[6px] border-t-[#393939] border-l-transparent border-r-transparent" />
          )}
          {position === "bottom" && (
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 border-b-[6px] border-l-[6px] border-r-[6px] border-b-[#393939] border-l-transparent border-r-transparent" />
          )}
          {position === "left" && (
            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 border-l-[6px] border-t-[6px] border-b-[6px] border-l-[#393939] border-t-transparent border-b-transparent" />
          )}
          {position === "right" && (
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 border-r-[6px] border-t-[6px] border-b-[6px] border-r-[#393939] border-t-transparent border-b-transparent" />
          )}
        </div>
      </div>
    </div>
  )
}
