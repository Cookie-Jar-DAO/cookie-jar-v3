"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, User, LogOut, ExternalLink, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomConnectButton } from "@/components/wallet/custom-connect-button"
import { useAccount, useDisconnect } from "wagmi"
import { useRouter } from "next/navigation"
import { shortenAddress } from "@/lib/utils/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCookieJarData } from "@/hooks/use-cookie-jar-registry"
import { useAdminStatus } from "@/hooks/use-admin-status"
import { useWagmi } from "@/hooks/wallet/use-wagmi"

// Helper function to get network name from chainId
const getNetworkName = (chainId: number): string => {
  switch (chainId) {
    case 8453:
      return "Base"
    case 84532:
      return "Base Sepolia"
    case 10:
      return "Optimism"
    case 42161:
      return "Arbitrum One"
    case 100:
      return "Gnosis Chain"
    default:
      return "Unknown Network"
  }
}

// Helper function to get explorer URL from chainId and address
const getExplorerUrl = (chainId: number, address: string): string => {
  switch (chainId) {
    case 84532:
      return `https://sepolia-explorer.base.org/address/${address}`
    case 8453:
      return `https://basescan.org/address/${address}`
    case 10:
      return `https://optimistic.etherscan.io/address/${address}`
    case 42161:
      return `https://arbiscan.io/address/${address}`
    case 100:
      return `https://gnosisscan.io/address/${address}`
    default:
      return "#"
  }
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { chainId } = useWagmi()
  const router = useRouter()
  const { cookieJarsData } = useCookieJarData()
  const jarAddresses = cookieJarsData.map((jar) => jar.jarAddress)
  const { adminJars } = useAdminStatus(jarAddresses)

  // Get network name based on chainId
  const networkName = getNetworkName(chainId)

  // Get explorer URL
  const explorerUrl = address ? getExplorerUrl(chainId, address) : "#"

  // Count jars created by the user
  const createdJars = cookieJarsData.filter(
    (jar) => jar.jarCreator && address && jar.jarCreator.toLowerCase() === address.toLowerCase(),
  ).length

  // Count admin jars
  const adminJarsCount = Object.values(adminJars).filter(Boolean).length

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleProfileClick = () => {
    if (isConnected) {
      router.push("/profile")
    } else {
      // Could show a toast notification here that user needs to connect wallet first
      console.log("Please connect your wallet first")
    }
  }

  const copyToClipboard = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text)
      // You could add a toast notification here
    }
  }

  if (!mounted) return null

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Fixed height container to prevent layout shifts */}
      <div className="h-[80px] flex items-center">
        <div
          className={`w-full transition-colors duration-300 ${
            scrolled ? "bg-[#1F1F1F]/90" : "bg-transparent"
          } backdrop-blur-sm`}
        >
          <div className="w-full px-2 md:px-4 flex items-center justify-between h-[80px]">
            {/* Left side - Logo and project name */}
            <div className="flex items-center">
              <div className="flex items-center gap-3 bg-[#393939] rounded-full py-2 px-4 border border-[#555555]">
                <div className="w-8 h-8 rounded-full bg-[#393939] flex items-center justify-center overflow-hidden border border-primary">
                  <Image
                    src="/logo.png"
                    alt="Cookie Jar Logo"
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <span className="text-lg font-medium text-white">Cookie Jar V3</span>
              </div>
            </div>

            {/* Center - Navigation */}
            <nav className="hidden md:flex items-center gap-6 bg-[#393939]/80 backdrop-blur-sm rounded-full py-3 px-6 border border-[#555555]">
              <Link href="/jars" className="text-sm font-medium text-white hover:text-primary transition-colors">
                EXPLORE
              </Link>
              <Link href="/create" className="text-sm font-medium text-white hover:text-primary transition-colors">
                CREATE
              </Link>
              <Link href="/docs" className="text-sm font-medium text-white hover:text-primary transition-colors">
                DOCS
              </Link>
            </nav>

            {/* Right side - Wallet connection and Profile */}
            <div className="hidden md:flex items-center gap-3">
              <div className="bg-[#393939] rounded-full py-2 px-4 border border-[#555555]">
                <CustomConnectButton />
              </div>

              {isConnected && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-[#393939] rounded-full w-10 h-10 flex items-center justify-center border border-[#555555] hover:bg-[#4a4a4a] transition-colors"
                    >
                      <User className="h-5 w-5 text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={10}
                    className="w-64 bg-[#2A2A2A] border border-[#444444] text-white"
                  >
                    {/* Stats section */}
                    <div className="p-3 bg-[#1F1F1F] rounded-t-md">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[#393939] p-2 rounded-md text-center">
                          <div className="text-xl font-bold text-white">{createdJars}</div>
                          <div className="text-xs text-[#AAAAAA]">Jars Created</div>
                        </div>
                        <div className="bg-[#393939] p-2 rounded-md text-center">
                          <div className="text-xl font-bold text-white">{adminJarsCount}</div>
                          <div className="text-xs text-[#AAAAAA]">Admin Jars</div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <DropdownMenuItem
                      className="flex items-center gap-2 py-3 hover:bg-[#393939] cursor-pointer"
                      onClick={() => router.push("/profile")}
                    >
                      <User className="h-4 w-4 text-[#AAAAAA]" />
                      <span>Profile</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-[#444444]" />

                    <div className="px-2 py-2">
                      <div className="flex items-center justify-between bg-[#1F1F1F] rounded-md p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#AAAAAA]">Address:</span>
                          <span className="text-sm">{shortenAddress(address || "", 6)}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(address || "")}
                          className="p-1 hover:bg-[#393939] rounded-full transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5 text-[#AAAAAA]" />
                        </button>
                      </div>
                    </div>

                    <div className="px-2 py-2">
                      <div className="flex items-center justify-between bg-[#1F1F1F] rounded-md p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#AAAAAA]">Network:</span>
                          <span className="text-sm">{networkName}</span>
                        </div>
                        <a
                          href={explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-[#393939] rounded-full transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5 text-[#AAAAAA]" />
                        </a>
                      </div>
                    </div>

                    <DropdownMenuSeparator className="bg-[#444444]" />

                    <DropdownMenuItem
                      className="flex items-center gap-2 py-3 hover:bg-[#393939] cursor-pointer text-red-400"
                      onClick={() => disconnect()}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Disconnect</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden z-10 bg-[#393939] rounded-full border border-[#555555]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="absolute inset-x-0 top-[80px] z-50 bg-[#1F1F1F]/95 backdrop-blur-sm border-b border-[#555555] md:hidden">
          <nav className="w-full px-2 flex flex-col gap-6 p-6">
            <Link
              href="/jars"
              className="text-xl font-medium text-white hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              EXPLORE
            </Link>
            <Link
              href="/create"
              className="text-xl font-medium text-white hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              CREATE
            </Link>
            <Link
              href="/docs"
              className="text-xl font-medium text-white hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              DOCS
            </Link>
            <div className="flex items-center justify-between py-2">
              <CustomConnectButton />

              {isConnected && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    handleProfileClick()
                    setIsMenuOpen(false)
                  }}
                  className="bg-[#393939] rounded-full w-10 h-10 flex items-center justify-center border border-[#555555] hover:bg-[#4a4a4a] transition-colors ml-3"
                >
                  <User className="h-5 w-5 text-white" />
                </Button>
              )}
            </div>

            {isConnected && (
              <div className="bg-[#2A2A2A] rounded-lg border border-[#444444] p-4">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-[#393939] p-2 rounded-md text-center">
                    <div className="text-xl font-bold text-white">{createdJars}</div>
                    <div className="text-xs text-[#AAAAAA]">Jars Created</div>
                  </div>
                  <div className="bg-[#393939] p-2 rounded-md text-center">
                    <div className="text-xl font-bold text-white">{adminJarsCount}</div>
                    <div className="text-xs text-[#AAAAAA]">Admin Jars</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-[#1F1F1F] rounded-md p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#AAAAAA]">Address:</span>
                      <span className="text-sm">{shortenAddress(address || "", 6)}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(address || "")}
                      className="p-1 hover:bg-[#393939] rounded-full transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5 text-[#AAAAAA]" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-[#1F1F1F] rounded-md p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#AAAAAA]">Network:</span>
                      <span className="text-sm">{networkName}</span>
                    </div>
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-[#393939] rounded-full transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-[#AAAAAA]" />
                    </a>
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full bg-[#393939] hover:bg-[#4a4a4a] text-red-400 mt-2"
                    onClick={() => {
                      disconnect()
                      setIsMenuOpen(false)
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
