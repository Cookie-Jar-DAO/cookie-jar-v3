"use client"

import type { ReactNode } from "react"
import "@rainbow-me/rainbowkit/styles.css"
import { getDefaultConfig, RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import { mainnet, base, optimism, arbitrum, gnosis, sepolia, baseSepolia } from "wagmi/chains"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { http } from "wagmi"
import { useTheme } from "next-themes"
import { useEffect } from "react"
import { wagmiConfig } from "@/config/supported-networks"

// Define Base Sepolia chain if not already defined in wagmi/chains
//commenting this out because I not certain if it's important or not
// const baseSepoliaConfig = {
//   id: 84532,
//   name: "Base Sepolia",
//   network: "base-sepolia",
//   nativeCurrency: {
//     decimals: 18,
//     name: "Ethereum",
//     symbol: "ETH",
//   },
//   rpcUrls: {
//     public: { http: ["https://sepolia.base.org"] },
//     default: { http: ["https://sepolia.base.org"] },
//   },
//   blockExplorers: {
//     default: { name: "BaseScan", url: "https://sepolia-explorer.base.org" },
//   },
//   testnet: true,
// }

// Define our custom orange color
const orangeColor = "#ff5e14"

const queryClient = new QueryClient()

export function RainbowKitProviderWrapper({ children }: { children: ReactNode }) {
  const { theme } = useTheme()

  // Create custom themes with our orange color
  const customLightTheme = lightTheme({
    accentColor: orangeColor,
    accentColorForeground: "white",
    borderRadius: "medium",
    fontStack: "system",
    overlayBlur: "small",
  })

  const customDarkTheme = darkTheme({
    accentColor: orangeColor,
    accentColorForeground: "white",
    borderRadius: "medium",
    fontStack: "system",
    overlayBlur: "small",
  })

  // Override the connected button colors
  const themeWithCustomColors = {
    ...(theme === "dark" ? customDarkTheme : customLightTheme),
    colors: {
      ...(theme === "dark" ? customDarkTheme.colors : customLightTheme.colors),
      connectButtonBackground: orangeColor,
      connectButtonBackgroundError: "#FF494A",
      connectButtonInnerBackground: orangeColor,
      connectButtonText: "white",
      connectButtonTextError: "white",
    },
  }

  // Increase max listeners to prevent warnings
  useEffect(() => {
    // This helps prevent the MaxListenersExceededWarning
    if (typeof window !== "undefined" && window.process && window.process.env) {
      window.process.setMaxListeners(20)
    }

    return () => {
      // Clean up any event listeners when component unmounts
      if (typeof window !== "undefined" && window.process && window.process.env) {
        window.process.setMaxListeners(10) // Reset to default
      }
    }
  }, [])

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={themeWithCustomColors} coolMode={false}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
