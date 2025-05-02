import type React from "react"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-[#1D1D1D]">
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#1D1D1D] p-4 flex items-center">
        <Link
          href="/"
          className="flex items-center text-white hover:text-gray-300 bg-[#333333] rounded-full px-4 py-2 shadow-md ml-[80px]"
        >
          <div className="bg-[#555555] rounded-full p-2">
            <ChevronLeft className="h-5 w-5 text-white" />
          </div>
          <span className="ml-2 font-medium">Go Back</span>
        </Link>
      </div>
      <div className="pt-20 bg-[#1D1D1D]">{children}</div>
    </div>
  )
}
