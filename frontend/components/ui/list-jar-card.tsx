"use client"
import { Button } from "@/components/ui/button"
import type React from "react"
import { useState } from "react"
import { CheckCircle, Info, Copy, Shield, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { CustomTooltip } from "@/components/ui/custom-tooltip"

// Update the ListJarCardProps interface to include isAdmin
interface ListJarCardProps {
  jar: any
  index: number
  indexOfFirstJar: number
  isWhitelisted?: boolean
  hasNFTAccess?: boolean
  isAdmin?: boolean // Add this line
  onClick: () => void
  className?: string
}

// Update the function parameters to include isAdmin
export function ListJarCard({
  jar,
  index,
  indexOfFirstJar,
  isWhitelisted,
  hasNFTAccess,
  isAdmin, // Add this line
  onClick,
  className,
}: ListJarCardProps) {
  const [copied, setCopied] = useState(false)
  // Extract name and description from metadata
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

  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(jar.jarAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        "bg-[#2A2A2A] rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative group cursor-pointer",
        "border-l-4 border-l-[#C3FF00] border border-[#444444]",
        className,
      )}
      onClick={onClick}
    >
      {/* Card Header with subtle gradient */}

      <div className="p-4 md:p-5">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Left column: Title, address, description */}
          <div className="flex-1 min-w-0">
            {/* Title and badges section */}
            <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
              <h3 className="text-white/80 font-semibold text-lg leading-tight mr-2 border-b border-[#C3FF00] pb-1 inline-block">
                {jarName}
              </h3>

              {/* Icon-only transparent badges with tooltips */}
              <div className="flex flex-wrap gap-2">
                {isAdmin && (
                  <CustomTooltip content="You are an admin of this jar" position="left">
                    <div className="text-[#C3FF00]">
                      <Shield className="h-4 w-4" />
                    </div>
                  </CustomTooltip>
                )}
                {isWhitelisted && (
                  <CustomTooltip content="You are whitelisted for this jar" position="left">
                    <div className="text-[#C3FF00]">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </CustomTooltip>
                )}
                {jar.accessType === 1 && hasNFTAccess && (
                  <CustomTooltip content="You have NFT access to this jar" position="left">
                    <div className="text-[#C3FF00]">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </CustomTooltip>
                )}
              </div>
            </div>

            {/* Address with improved styling and copy button */}
            <div className="text-[#AAAAAA] text-xs mb-3 truncate px-2 py-1 bg-[#1F1F1F] rounded-md border border-[#444444] flex items-center justify-between">
              <span className="truncate">{jar.jarAddress}</span>
              <button
                onClick={copyAddress}
                className="ml-2 p-1 hover:bg-[#333333] rounded-full transition-colors"
                aria-label="Copy address"
              >
                {copied ? (
                  <CheckCircle className="h-3.5 w-3.5 text-[#C3FF00]" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-[#AAAAAA]" />
                )}
              </button>
            </div>

            {/* Description with tooltip - positioned to the right */}
            <div className="mb-3 md:mb-0">
              <div className="flex items-start">
                <span className="text-[#AAAAAA] text-xs font-medium mr-1 mt-0.5">Description:</span>
                <CustomTooltip
                  content={<div className="max-w-xs text-white font-medium">{jarDescription}</div>}
                  position="right"
                  maxWidth="max-w-xs"
                >
                  <div className="text-white text-sm flex items-center">
                    {truncatedDescription}
                    {jarDescription.length > 30 && <Info className="h-3 w-3 ml-1 text-[#C3FF00]" />}
                  </div>
                </CustomTooltip>
              </div>
            </div>
          </div>

          {/* Middle column: Additional info */}
          <div className="grid grid-cols-3 gap-4 md:w-[280px] max-w-full self-center">
            <div>
              <span className="text-[#AAAAAA] text-xs block">Access Type</span>
              <span className="text-white text-sm font-medium">{jar.accessType === 0 ? "Whitelist" : "NFT-Gated"}</span>
            </div>

            <div>
              <span className="text-[#AAAAAA] text-xs block">Created</span>
              <span className="text-white text-sm font-medium">
                {new Date(Number(jar.registrationTime) * 1000).toLocaleDateString()}
              </span>
            </div>

            <div>
              <span className="text-[#AAAAAA] text-xs block">Creator</span>
              <span className="text-white text-sm font-medium truncate" title={jar.jarCreator}>
                {jar.jarCreator.substring(0, 6)}...
              </span>
            </div>
          </div>

          {/* Right column: Actions */}
          <div className="flex items-center justify-end md:min-w-[120px]">
            <Button
              className="bg-[#C3FF00] hover:bg-[#A3DF00] text-[#1F1F1F] transition-all p-2 aspect-square shadow-sm hover:shadow-md"
              onClick={onClick}
              aria-label="Open Jar"
            >
              <ArrowRight className="h-5 w-5" />
              <span className="sr-only">Open Jar</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
