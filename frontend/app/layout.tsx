import type React from "react"
import { ThemeProvider } from "@/components/design/theme-provider"
import { RainbowKitProviderWrapper } from "@/components/wallet/rainbow-kit-provider"
import { Toaster } from "@/components/ui/toaster"
import { PageTransition } from "@/components/design/page-transition"
import { NetworkSwitcher } from "@/components/network/network-switcher"
import { ScrollToTop } from "@/components/design/scroll-to-top"
import localFont from "next/font/local"
import "./countdown-animation.css"
import "./loading-animation.css"
import "./globals.css"
import Providers from "../lib/Providers"

const clashDisplay = localFont({
  src: "../ClashDisplay.ttf",
  variable: "--font-clash-display",
})

export const metadata = {
  title: "Cookie Jar V3 | Shared Token Pools",
  description: "A platform for creating and managing shared token pools with customizable access rules",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${clashDisplay.variable} font-clash custom-scrollbar`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <RainbowKitProviderWrapper key="rainbow-kit-provider">
            <Providers>
              <div>
                <PageTransition noTopMargin>{children}</PageTransition>
              </div>
              <NetworkSwitcher />
              <ScrollToTop />
              <Toaster />
            </Providers>
          </RainbowKitProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
