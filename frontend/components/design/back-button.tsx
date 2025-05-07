"use client"

import type React from "react"

import { useRouter, usePathname } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils/utils"
import { Button } from "@/components/ui/button"
import { ConnectButton } from "@rainbow-me/rainbowkit"

interface BackButtonProps {
  className?: string
  showWalletInfo?: boolean
  children?: React.ReactNode
}

export function BackButton({ className = "", showWalletInfo = false, children }: BackButtonProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Don't show on home page
  if (pathname === "/") return null

  return (
    <div
      className={cn(
        "flex items-center justify-between bg-transparent rounded-xl py-1 px-4 shadow-sm border border-gray-700",
        className,
      )}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          router.back()
        }}
        className="flex items-center gap-2 text-white font-medium p-2 -m-2"
      >
        <div className="bg-[#C3FF00] rounded-full h-8 w-8 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </div>
        <span>Go Back</span>
      </button>

      {children || (
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
            const ready = mounted && authenticationStatus !== "loading"
            const connected =
              ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated")

            if (!connected) {
              return null // Don't show network buttons if not connected
            }

            if (chain?.unsupported) {
              return (
                <Button onClick={openChainModal} variant="destructive" size="sm" className="ml-auto">
                  Wrong network
                </Button>
              )
            }

            return (
              <div className="flex items-center gap-2 ml-auto">
                <Button onClick={openAccountModal} variant="outline" size="sm" className="flex items-center gap-1">
                  {chain.hasIcon && (
                    <div className="w-4 h-4">
                      {chain.iconUrl && (
                        <img
                          alt={chain.name ?? "Chain icon"}
                          src={chain.iconUrl || "/placeholder.svg"}
                          className="w-4 h-4"
                        />
                      )}
                    </div>
                  )}
                  {chain.name}
                </Button>

                <Button onClick={openChainModal} variant="outline" size="sm" className="flex items-center gap-1">
                  Change Networks
                </Button>
              </div>
            )
          }}
        </ConnectButton.Custom>
      )}
    </div>
  )
}
