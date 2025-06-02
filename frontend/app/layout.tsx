import type React from "react"
import { headers } from 'next/headers'
import { cookieToInitialState } from 'wagmi'
import { ThemeProvider } from "@/components/design/theme-provider"
import { Providers } from "@/components/wallet/providers"
import { Toaster } from "@/components/ui/toaster"
import { PageTransition } from "@/components/design/page-transition"
import { CollapsibleSidebar } from "@/components/design/collapsible-sidebar"
import { NetworkSwitcher } from "@/components/network/network-switcher"
import { getWagmiConfig } from "@/config/supported-networks"
import localFont from "next/font/local"
import "./countdown-animation.css"
import "./loading-animation.css"
import "./globals.css"

const clashDisplay = localFont({
  src: "../ClashDisplay.ttf",
  variable: "--font-clash-display",
})

export const metadata = {
  title: "Cookie Jar V3 | Shared Token Pools",
  description: "A platform for creating and managing shared token pools with customizable access rules",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Extract initial state from cookies on the server
  const initialState = cookieToInitialState(
    getWagmiConfig(),
    (await headers()).get('cookie')
  )

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${clashDisplay.variable} font-clash custom-scrollbar`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Providers initialState={initialState}>
            <CollapsibleSidebar />
            <div className="ml-[80px]">
              <PageTransition>{children}</PageTransition>
            </div>
            <NetworkSwitcher />
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
