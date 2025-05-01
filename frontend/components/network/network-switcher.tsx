"use client"

import { useState, useEffect } from "react"
import { useChainId, useSwitchChain, useConfig, useAccount } from "wagmi"
import { Button } from "@/components/ui/button"

export function NetworkSwitcher() {
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()
  const [mounted, setMounted] = useState(false)
  const config = useConfig()
  const { isConnected } = useAccount() // Add this to check if wallet is connected

  // Base Sepolia chain ID
  const BASE_SEPOLIA_CHAIN_ID = 84532

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Add an effect to watch for chain changes
  useEffect(() => {
    // Set up a watcher for chain changes
    const unwatch = config.subscribe(
      (state) => state.chainId,
      (newChainId: number) => {
        console.log("Chain changed to:", newChainId)
      },
    )

    // Clean up the watcher when component unmounts
    return () => {
      unwatch()
    }
  }, [config])

  if (!mounted) return null

  // Only show network switcher if wallet is connected AND user is not on Base Sepolia
  if (!isConnected || chainId === BASE_SEPOLIA_CHAIN_ID) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-[#222222]/90 backdrop-blur-md p-8 rounded-xl shadow-xl max-w-md w-full border border-[#333333]">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#222222] border-2 border-[#C3FF00] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2Z"
                fill="#C3FF00"
                fillOpacity="0.2"
              />
              <path d="M16 7V13M16 19V25M7 16H13M19 16H25" stroke="#C3FF00" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">Wrong Network Detected</h3>
          <p className="text-[#e0e0e0] mb-6">
            Cookie Jar currently only supports Base Sepolia network. Please switch your network to continue.
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => switchChain({ chainId: BASE_SEPOLIA_CHAIN_ID })}
              disabled={isPending}
              className="w-full bg-[#C3FF00] hover:bg-[#d4ff33] text-[#222222] font-medium"
            >
              {isPending ? "Switching..." : "Switch to Base Sepolia"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
