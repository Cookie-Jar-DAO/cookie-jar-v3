"use client"

import type React from "react"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  return (
    <div className="w-full bg-[#1D1D1D]">
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#1D1D1D] p-4 flex items-center">
        <button
          onClick={() => router.back()}
          className="flex items-center text-white hover:text-gray-300 bg-[#333333] rounded-full px-3 py-2 shadow-md ml-2 md:ml-[80px] active:scale-95 transition-transform"
          aria-label="Go back to previous page"
        >
          <div className="bg-[#555555] rounded-full p-1.5 md:p-2">
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </div>
          <span className="ml-2 font-medium text-sm md:text-base">Go Back</span>
        </button>
      </div>
      <div className="pt-16 md:pt-20 bg-[#1D1D1D]">{children}</div>
    </div>
  )
}
