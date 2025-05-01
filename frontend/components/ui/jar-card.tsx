"use client"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CheckCircle, Copy, Shield, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Update the JarCardProps interface to include isAdmin
interface JarCardProps {
  jar: any
  index: number
  indexOfFirstJar: number
  isWhitelisted?: boolean
  hasNFTAccess?: boolean
  isAdmin?: boolean
  onClick: () => void
  className?: string
}

// Update the function parameters to include isAdmin
export function JarCard({
  jar,
  index,
  indexOfFirstJar,
  isWhitelisted,
  hasNFTAccess,
  isAdmin,
  onClick,
  className,
}: JarCardProps) {
  const [copied, setCopied] = useState(false)
  // Extract name and description from metadata
  // The metadata string might contain both name and description
  const metadata = jar.metadata || ""

  // Try to extract name and description if metadata contains a colon
  let jarName = ""
  let jarDescription = ""

  if (metadata.includes(":")) {
    // Split by the first colon to separate name and description
    const colonIndex = metadata.indexOf(":")
    jarName = metadata.substring(0, colonIndex).trim()
    jarDescription = metadata.substring(colonIndex + 1).trim()
  } else {
    // If no colon, use the whole string as name
    jarName = metadata || `Cookie Jar #${indexOfFirstJar + index + 1}`
    jarDescription = "No description available"
  }

  // Truncate description for display
  const truncatedDescription = jarDescription.length > 30 ? `${jarDescription.substring(0, 30)}...` : jarDescription

  return (
    <div
      className={cn(
        "bg-[#222222] rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative group cursor-pointer border border-[#333333] hover:border-[#444444]",
        className,
      )}
      onClick={onClick}
    >
      <div className="p-5">
        {/* Title and badges section */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-white border-b-2 border-[#C3FF00] pb-1 inline-block">{jarName}</h3>

          {/* Icon-only transparent badges with tooltips */}
          <div className="flex flex-col space-y-2">
            {isAdmin && (
              <div className="text-[#C3FF00] relative group">
                <Shield className="h-5 w-5" />
                <div className="absolute right-full top-0 mr-2 px-3 py-1 bg-[#333333] text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  Admin Access
                </div>
              </div>
            )}
            {isWhitelisted && (
              <div className="text-[#C3FF00] relative group">
                <CheckCircle className="h-5 w-5" />
                <div className="absolute right-full top-0 mr-2 px-3 py-1 bg-[#333333] text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  Whitelisted
                </div>
              </div>
            )}
            {jar.accessType === 1 && hasNFTAccess && (
              <div className="text-[#C3FF00] relative group">
                <CheckCircle className="h-5 w-5" />
                <div className="absolute right-full top-0 mr-2 px-3 py-1 bg-[#333333] text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  NFT Access
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Address with copy button */}
        <div className="flex items-center bg-[#1A1A1A] rounded-md p-2 border border-[#333333] mb-3">
          <div className="text-[#999999] text-sm font-mono flex-1 truncate pr-2">{jar.jarAddress}</div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigator.clipboard.writeText(jar.jarAddress)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
            className="p-1 hover:bg-[#333333] rounded-full transition-colors"
          >
            {copied ? <CheckCircle className="h-4 w-4 text-[#C3FF00]" /> : <Copy className="h-4 w-4 text-[#999999]" />}
          </button>
        </div>

        {/* Description with neon green dash */}
        <div className="mb-4">
          <span className="text-[#999999] text-sm">Description</span>
          <span className="text-[#C3FF00] text-sm mx-1">-</span>
          <span className="text-white text-sm">{truncatedDescription}</span>
        </div>

        {/* Info grid with improved styling */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-[#999999] text-xs">Access Type</div>
            <div className="text-white font-medium">{jar.accessType === 0 ? "Whitelist" : "NFT-Gated"}</div>
          </div>

          <div>
            <div className="text-[#999999] text-xs">Created</div>
            <div className="text-white font-medium">
              {new Date(Number(jar.registrationTime) * 1000).toLocaleDateString()}
            </div>
          </div>

          <div>
            <div className="text-[#999999] text-xs">Creator</div>
            <div className="text-white font-medium truncate" title={jar.jarCreator}>
              {jar.jarCreator.substring(0, 6)}...{jar.jarCreator.substring(jar.jarCreator.length - 4)}
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end">
          <Button className="bg-[#C3FF00] hover:bg-[#D4FF33] text-[#111111] rounded-full p-2 h-auto w-auto aspect-square">
            <ArrowRight className="h-5 w-5" />
            <span className="sr-only">Open Jar</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
