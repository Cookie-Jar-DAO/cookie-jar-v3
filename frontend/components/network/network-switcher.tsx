"use client"

import { useState, useEffect } from "react"
import { useAccount, useChainId, useConfig } from "wagmi"
import { Button } from "@/components/ui/button"
import { useChainModal } from "@rainbow-me/rainbowkit"
import { supportedChains } from "@/config/supported-networks"

export function NetworkSwitcher() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const [mounted, setMounted] = useState(false)
  const config = useConfig()
  const { openChainModal } = useChainModal()

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

  // Get the actual connected chain from the browser's ethereum provider
  const [actualChainId, setActualChainId] = useState<number | null>(null)

  // Effect to get the actual chain ID from the browser's ethereum provider
  useEffect(() => {
    const getActualChainId = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Get the actual chainId from the ethereum provider
          const id = (await window.ethereum.request({ method: "eth_chainId" })) as string
          const parsedId = Number.parseInt(id, 16)
          setActualChainId(parsedId)
          console.log("Actual chainId from provider:", parsedId)
        } catch (error) {
          console.error("Error getting chainId from provider:", error)
        }
      }
    }

    getActualChainId()

    // Set up listener for chain changes
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("chainChanged", (chainId: string) => {
        const parsedId = Number.parseInt(chainId, 16)
        setActualChainId(parsedId)
        console.log("Chain changed to:", parsedId)
      })
    }

    return () => {
      // Clean up listeners
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener("chainChanged", () => {})
      }
    }
  }, [])

  // Check if wagmi's chainId is showing Sepolia (11155111) but the actual chainId is different
  // This would indicate a fallback mechanism is active
  const isFallbackActive =
    chainId === (11155111 as unknown as number) && actualChainId !== null && actualChainId !== 11155111

  // Check if the actual chain is supported
  const isActualChainSupported = actualChainId ? supportedChains.some((chain) => chain.id === actualChainId) : false

  // Debug logs
  console.log("Wagmi chainId:", chainId)
  console.log("Actual chainId:", actualChainId)
  console.log("Is fallback active:", isFallbackActive)
  console.log("Is actual chain supported:", isActualChainSupported)
  console.log(
    "Supported chains:",
    supportedChains.map((chain) => ({ id: chain.id, name: chain.name })),
  )

  if (!mounted) return null

  // Show network switcher when:
  // 1. User is connected AND
  // 2. Either the fallback is active OR the actual chain is not supported
  if (!isConnected || (!isFallbackActive && isActualChainSupported)) {
    return null
  }

  // At this point we know the user is connected and on an unsupported network

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

          <h3 className="text-xl font-bold text-white mb-2">Unsupported Network</h3>
          <p className="text-[#e0e0e0] mb-6">
            The network you're currently connected to is not supported by Cookie Jar. Please switch to a supported
            network to continue.
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={openChainModal}
              className="w-full bg-[#C3FF00] hover:bg-[#d4ff33] text-[#222222] font-medium"
            >
              Switch to a Supported Network
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
