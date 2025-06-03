"use client";

import { wagmiConfig } from "@/config/supported-networks";
import {
  darkTheme,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { WagmiProvider } from "wagmi";

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
const orangeColor = "#ff5e14";

const queryClient = new QueryClient();

export function RainbowKitProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const { theme } = useTheme();

  // Create custom themes with our orange color
  const customLightTheme = lightTheme({
    accentColor: orangeColor,
    accentColorForeground: "white",
    borderRadius: "medium",
    fontStack: "system",
    overlayBlur: "small",
  });

  const customDarkTheme = darkTheme({
    accentColor: orangeColor,
    accentColorForeground: "white",
    borderRadius: "medium",
    fontStack: "system",
    overlayBlur: "small",
  });

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
  };

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={themeWithCustomColors} coolMode={false}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
