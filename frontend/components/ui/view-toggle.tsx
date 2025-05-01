"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

interface ViewToggleProps extends React.HTMLAttributes<HTMLDivElement> {
  views: { id: string; label: string }[]
  activeView: string
  onViewChange: (view: string) => void
}

export function ViewToggle({ views, activeView, onViewChange, className, ...props }: ViewToggleProps) {
  return (
    <div
      className={cn("inline-flex h-10 items-center justify-center rounded-full bg-[#2b1d0e] p-1 text-white", className)}
      {...props}
    >
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all",
            activeView === view.id
              ? "bg-[#ff5e14] text-white shadow-sm"
              : "text-white/70 hover:bg-white/10 hover:text-white",
          )}
        >
          {view.label}
        </button>
      ))}
    </div>
  )
}
