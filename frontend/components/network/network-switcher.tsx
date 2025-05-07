"use client"

import { useState, useEffect } from "react"
import { useAccount, useChainId } from "wagmi"
import { Button } from "@/components/ui/button"
import { useChainModal } from "@rainbow-me/rainbowkit"
import { supportedChains } from "@/config/supported-networks"

export function NetworkSwitcher() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const [mounted, setMounted] = useState(false)
  const { openChainModal } = useChainModal()
  const [isUnsupportedNetwork, setIsUnsupportedNetwork] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if the current chain is supported
  useEffect(() => {
    if (!isConnected || !chainId) return

    // Check if the current chainId is in our supported chains
    const isSupported = supportedChains.some((chain) => chain.id === chainId)
    setIsUnsupportedNetwork(!isSupported)

    console.log("Current chainId:", chainId)
    console.log("Is supported network:", isSupported)
    console.log(
      "Supported chains:",
      supportedChains.map((chain) => ({ id: chain.id, name: chain.name })),
    )
  }, [chainId, isConnected])

  // Handle window.ethereum provider changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return

    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = Number.parseInt(chainIdHex, 16)
      console.log("Chain changed to:", newChainId)

      // Check if the new chain is supported
      const isSupported = supportedChains.some((chain) => chain.id === newChainId)
      setIsUnsupportedNetwork(!isSupported)
    }

    window.ethereum.on("chainChanged", handleChainChanged)

    // Initial check with provider
    const checkProviderChain = async () => {
      try {
        const chainIdHex = await window.ethereum.request({ method: "eth_chainId" })
        const providerChainId = Number.parseInt(chainIdHex as string, 16)
        console.log("Provider chainId:", providerChainId)

        // Check if the provider chain is supported
        const isSupported = supportedChains.some((chain) => chain.id === providerChainId)
        setIsUnsupportedNetwork(!isSupported)
      } catch (error) {
        console.error("Error checking provider chain:", error)
      }
    }

    checkProviderChain()

    return () => {
      window.ethereum.removeListener("chainChanged", handleChainChanged)
    }
  }, [isConnected])

  if (!mounted || !isConnected || !isUnsupportedNetwork) {
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
