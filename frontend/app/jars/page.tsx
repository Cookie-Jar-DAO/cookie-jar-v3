"use client"
import { useCookieJarData } from "@/hooks/use-cookie-jar-registry"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Copy,
  Shield,
  ArrowLeft,
  ArrowRight,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { useState, useEffect, useMemo, useRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { keccak256, toUtf8Bytes } from "ethers"
import { ethers } from "ethers"
import { JarCard } from "@/components/ui/jar-card"
import { useAdminStatus } from "@/hooks/use-admin-status"

// Add this new component inside the file, before the main CookieJarPage component
function CounterBox({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const duration = 2000 // Animation duration in milliseconds

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0)
      return
    }

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // Animation function
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smoother animation
      const easeOutQuad = (t: number) => t * (2 - t)
      const easedProgress = easeOutQuad(progress)

      // Calculate current value
      const currentValue = Math.floor(easedProgress * value)
      setDisplayValue(currentValue)

      // Continue animation if not complete
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Ensure we end with the exact target value
        setDisplayValue(value)
      }
    }

    // Start animation
    animationRef.current = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value])

  return displayValue
}

export default function CookieJarPage() {
  const { cookieJarsData, isLoading, error } = useCookieJarData()
  const router = useRouter()
  const { isConnected, address: userAddress } = useAccount()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const jarsPerPage = 20
  const [filterOption, setFilterOption] = useState("all")
  const [whitelistedJars, setWhitelistedJars] = useState<Record<string, boolean>>({})
  const [isCheckingWhitelist, setIsCheckingWhitelist] = useState(false)
  const [nftAccessJars, setNftAccessJars] = useState<Record<string, boolean>>({})
  const [isCheckingNFT, setIsCheckingNFT] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [headerVisible, setHeaderVisible] = useState(true)
  const lastScrollY = useRef(0)
  const headerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [displayValue, setDisplayValue] = useState(0)
  const [copied, setCopied] = useState(false)

  // Load view mode preference from localStorage on initial render
  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      const savedViewMode = localStorage.getItem("cookieJarViewMode")
      if (savedViewMode === "list" || savedViewMode === "grid") {
        setViewMode(savedViewMode)
      }
    }
  }, [])

  // Save view mode preference to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cookieJarViewMode", viewMode)
    }
  }, [viewMode])

  // Extract jar addresses for the admin check
  const jarAddresses = useMemo(() => cookieJarsData.map((jar) => jar.jarAddress), [cookieJarsData])
  const { adminJars, isCheckingAdmin } = useAdminStatus(jarAddresses)

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // When scrolling down and past threshold, hide header
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setHeaderVisible(false)
      }
      // When scrolling up, show header immediately
      else if (currentScrollY < lastScrollY.current) {
        setHeaderVisible(true)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Filter jars based on search term and filter option
  const filteredJars = useMemo(() => {
    let filtered = cookieJarsData.filter(
      (jar) =>
        jar.metadata?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jar.jarAddress.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Apply whitelist filter if selected
    if (filterOption === "whitelisted") {
      filtered = filtered.filter((jar) => whitelistedJars[jar.jarAddress])
    }

    // Apply NFT access filter if selected
    if (filterOption === "nftaccess") {
      filtered = filtered.filter((jar) => nftAccessJars[jar.jarAddress])
    }

    // Apply admin filter if selected
    if (filterOption === "admin") {
      filtered = filtered.filter((jar) => adminJars[jar.jarAddress])
    }

    return filtered
  }, [cookieJarsData, searchTerm, filterOption, whitelistedJars, nftAccessJars, adminJars, userAddress])

  // Calculate pagination
  const { currentJars, totalPages } = useMemo(() => {
    const indexOfLastJar = currentPage * jarsPerPage
    const indexOfFirstJar = indexOfLastJar - jarsPerPage
    return {
      currentJars: filteredJars.slice(indexOfFirstJar, indexOfLastJar),
      totalPages: Math.ceil(filteredJars.length / jarsPerPage),
    }
  }, [filteredJars, currentPage, jarsPerPage])

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterOption])

  // Add this combined, optimized useEffect instead:
  useEffect(() => {
    const checkJarAccess = async () => {
      if (!userAddress || cookieJarsData.length === 0) return

      setIsCheckingWhitelist(true)
      setIsCheckingNFT(true)

      // Create a provider
      const provider = window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null
      if (!provider) {
        setIsCheckingWhitelist(false)
        setIsCheckingNFT(false)
        return
      }

      try {
        // Prepare data for batch processing
        const JAR_WHITELISTED = keccak256(toUtf8Bytes("JAR_WHITELISTED")) as `0x${string}`
        const whitelistStatuses: Record<string, boolean> = {}
        const nftStatuses: Record<string, boolean> = {}

        // Process in batches to avoid rate limiting
        const batchSize = 10
        for (let i = 0; i < cookieJarsData.length; i += batchSize) {
          const batch = cookieJarsData.slice(i, i + batchSize)

          // Create multicall-like promises for all checks at once
          const promises = batch.flatMap((jar) => [
            // Whitelist check
            (async () => {
              try {
                const contract = new ethers.Contract(
                  jar.jarAddress,
                  [
                    {
                      inputs: [
                        { name: "role", type: "bytes32" },
                        { name: "account", type: "address" },
                      ],
                      name: "hasRole",
                      outputs: [{ name: "", type: "bool" }],
                      stateMutability: "view",
                      type: "function",
                    },
                    {
                      inputs: [],
                      name: "accessType",
                      outputs: [{ name: "", type: "uint8" }],
                      stateMutability: "view",
                      type: "function",
                    },
                  ],
                  provider,
                )

                const hasRole = await contract.hasRole(JAR_WHITELISTED, userAddress)
                whitelistStatuses[jar.jarAddress] = hasRole

                // Check NFT access only if jar is NFT-gated (accessType === 1)
                const accessType = await contract.accessType()
                if (Number(accessType) === 1) {
                  // Get NFT gates directly
                  let index = 0
                  let hasMoreGates = true
                  let hasNftAccess = false

                  while (hasMoreGates && index < 5 && !hasNftAccess) {
                    // Limit to 5 gates for performance
                    try {
                      const gateContract = new ethers.Contract(
                        jar.jarAddress,
                        [
                          {
                            inputs: [{ name: "", type: "uint256" }],
                            name: "nftGates",
                            outputs: [
                              { name: "nftAddress", type: "address" },
                              { name: "nftType", type: "uint8" },
                            ],
                            stateMutability: "view",
                            type: "function",
                          },
                        ],
                        provider,
                      )

                      const gate = await gateContract.nftGates(index)
                      if (gate && gate.nftAddress !== "0x0000000000000000000000000000000000000000") {
                        // Check if user owns this NFT
                        const nftAddress = gate.nftAddress
                        const nftType = Number(gate.nftType)

                        if (nftType === 1) {
                          // ERC1155
                          const erc1155Contract = new ethers.Contract(
                            nftAddress,
                            ["function balanceOf(address account, uint256 id) view returns (uint256)"],
                            provider,
                          )
                          const balance = await erc1155Contract.balanceOf(userAddress, 0)
                          if (balance > 0) {
                            hasNftAccess = true
                          }
                        } else {
                          // ERC721 or other
                          const erc721Contract = new ethers.Contract(
                            nftAddress,
                            ["function balanceOf(address owner) view returns (uint256)"],
                            provider,
                          )
                          const balance = await erc721Contract.balanceOf(userAddress)
                          if (balance > 0) {
                            hasNftAccess = true
                          }
                        }
                      }
                      index++
                    } catch (error) {
                      hasMoreGates = false
                    }
                  }

                  nftStatuses[jar.jarAddress] = hasNftAccess
                } else {
                  nftStatuses[jar.jarAddress] = false
                }
              } catch (error) {
                console.error(`Error checking access for ${jar.jarAddress}:`, error)
                whitelistStatuses[jar.jarAddress] = false
                nftStatuses[jar.jarAddress] = false
              }
            })(),
          ])

          // Wait for all promises in this batch
          await Promise.all(promises)

          // Small delay between batches to avoid rate limiting
          if (i + batchSize < cookieJarsData.length) {
            await new Promise((resolve) => setTimeout(resolve, 50))
          }
        }

        // Update state with all results at once
        setWhitelistedJars(whitelistStatuses)
        setNftAccessJars(nftStatuses)
      } catch (error) {
        console.error("Error checking jar access:", error)
      } finally {
        setIsCheckingWhitelist(false)
        setIsCheckingNFT(false)
      }
    }

    if (userAddress && cookieJarsData.length > 0) {
      checkJarAccess()
    }
  }, [userAddress, cookieJarsData])

  const navigateToJar = (address: string) => {
    router.push(`/jar/${address}`)
  }

  // Handle view mode change
  const handleViewModeChange = (mode: "list" | "grid") => {
    setViewMode(mode)
    // localStorage is already updated via the useEffect
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] py-10">
        <div className="bg-[#2A2A2A] border border-[#444444] p-8 rounded-xl shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-lg text-[#AAAAAA] mb-6">Please connect your wallet to view Cookie Jars.</p>
          <div className="flex flex-col items-center gap-4">
            <p className="text-[#AAAAAA]">Return to the home page to connect your wallet.</p>
            <Button
              onClick={() => router.push("/")}
              className="bg-[#C3FF00] hover:bg-[#A3DF00] text-[#1F1F1F] font-medium"
            >
              Go to Home Page
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#121212] min-h-screen flex flex-col">
      {/* Fixed header that shows/hides on scroll */}
      <div
        ref={headerRef}
        className={`sticky top-0 left-0 right-0 z-40 bg-[#121212] transition-transform duration-300 ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-[#C3FF00] rounded-full h-10 w-10 flex items-center justify-center mr-4 self-start mt-1.5"
              >
                <ArrowLeft className="w-6 h-6 text-gray-800" />
              </button>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                <div>
                  <h1 className="text-4xl font-bold text-white">
                    <span className="text-[#C3FF00]">Explore</span> Cookie Jars
                  </h1>
                  <p className="text-[#999999] mt-1">View all deployed cookie jars and their details</p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Total jars counter */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-[#999999] mb-1">Total jars</span>
                    <div className="w-16 h-16 border border-[#C3FF00] rounded-md flex items-center justify-center bg-[#222222]">
                      <span className="text-2xl font-bold text-white">
                        <CounterBox value={cookieJarsData.length} />
                      </span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-3">
                    <Select value={viewMode} onValueChange={(value) => handleViewModeChange(value as "list" | "grid")}>
                      <SelectTrigger className="w-[160px] bg-[#333333] border-[#444444] text-white focus-visible:ring-[#C3FF00]">
                        <SelectValue placeholder="List View" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#333333] border-[#444444] text-white">
                        <SelectItem value="list">List View</SelectItem>
                        <SelectItem value="grid">Grid View</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterOption} onValueChange={setFilterOption}>
                      <SelectTrigger className="w-[160px] bg-[#333333] border-[#444444] text-white focus-visible:ring-[#C3FF00]">
                        <SelectValue placeholder="All Jars" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#333333] border-[#444444] text-white">
                        <SelectItem value="all">All Jars</SelectItem>
                        <SelectItem value="whitelisted">
                          {isCheckingWhitelist ? "Checking Whitelist..." : "Whitelisted"}
                        </SelectItem>
                        <SelectItem value="nftaccess">
                          {isCheckingNFT ? "Checking NFT Access..." : "NFT Access"}
                        </SelectItem>
                        <SelectItem value="admin">{isCheckingAdmin ? "Checking Admin..." : "Admin"}</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="relative w-[300px]">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#999999]" />
                      <Input
                        placeholder="Search jars..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-[#333333] border-[#444444] text-white focus-visible:ring-[#C3FF00] placeholder:text-[#999999]"
                      />
                    </div>

                    <button className="cssbuttons-io-button-jars" onClick={() => router.push("/create")}>
                      CREATE JAR
                      <div className="icon">
                        <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M0 0h24v24H0z" fill="none"></path>
                          <path
                            d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                            fill="currentColor"
                          ></path>
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div
        ref={contentRef}
        className={`flex-1 container mx-auto px-4 pb-6 overflow-y-auto content-with-sticky-header ${
          headerVisible ? "" : "header-hidden"
        }`}
      >
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded mb-4">
            <p>Error: {error.message}</p>
          </div>
        )}

        {isLoading && cookieJarsData.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} className="h-48 w-full rounded-lg bg-[#2A2A2A]" />
            ))}
          </div>
        ) : (
          <>
            {filteredJars.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-white">No jars found matching your search.</p>
              </div>
            ) : (
              <>
                {viewMode === "list" ? (
                  <div className="space-y-4">
                    {currentJars.map((jar, index) => {
                      const indexOfLastJar = currentPage * jarsPerPage
                      const indexOfFirstJar = indexOfLastJar - jarsPerPage
                      const isWhitelisted = whitelistedJars[jar.jarAddress]
                      const hasNFTAccess = nftAccessJars[jar.jarAddress]
                      const isAdmin = !!adminJars[jar.jarAddress]

                      // Extract name and description from metadata
                      const metadata = jar.metadata || ""
                      let jarName = ""
                      let jarDescription = "No description available"

                      if (metadata.includes(":")) {
                        const colonIndex = metadata.indexOf(":")
                        jarName = metadata.substring(0, colonIndex).trim()
                        jarDescription = metadata.substring(colonIndex + 1).trim()
                      } else {
                        jarName = metadata || `Cookie Jar #${indexOfFirstJar + index + 1}`
                      }

                      return (
                        <div
                          key={jar.jarAddress}
                          className="bg-[#222222] rounded-lg overflow-hidden border border-[#333333] hover:border-[#444444] transition-all duration-300"
                        >
                          <div className="p-6">
                            <div className="flex flex-col space-y-4">
                              {/* Jar Name with underline */}
                              <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-white border-b-2 border-[#C3FF00] pb-1 inline-block">
                                  {jarName}
                                </h3>
                                <div className="flex space-x-2">
                                  {isAdmin && (
                                    <div className="text-[#C3FF00] relative group">
                                      <Shield className="h-5 w-5" />
                                      <div className="absolute top-full right-0 mt-1 px-3 py-1 bg-[#333333] text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                                        Admin Access
                                      </div>
                                    </div>
                                  )}
                                  {isWhitelisted && (
                                    <div className="text-[#C3FF00] relative group">
                                      <CheckCircle className="h-5 w-5" />
                                      <div className="absolute top-full right-0 mt-1 px-3 py-1 bg-[#333333] text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                                        Whitelisted
                                      </div>
                                    </div>
                                  )}
                                  {jar.accessType === 1 && hasNFTAccess && (
                                    <div className="text-[#C3FF00] relative group">
                                      <CheckCircle className="h-5 w-5" />
                                      <div className="absolute top-full right-0 mt-1 px-3 py-1 bg-[#333333] text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                                        NFT Access
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Address with copy button */}
                              <div className="flex items-center bg-[#1A1A1A] rounded-md p-2 border border-[#333333]">
                                <div className="text-[#999999] text-sm font-mono flex-1 truncate pr-2">
                                  {jar.jarAddress}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigator.clipboard.writeText(jar.jarAddress)
                                    setCopied(true)
                                    setTimeout(() => setCopied(false), 2000)
                                  }}
                                  className="p-1 hover:bg-[#333333] rounded-full transition-colors"
                                >
                                  {copied ? (
                                    <CheckCircle className="h-4 w-4 text-[#C3FF00]" />
                                  ) : (
                                    <Copy className="h-4 w-4 text-[#999999]" />
                                  )}
                                </button>
                              </div>

                              {/* Description with neon green dash */}
                              <div>
                                <span className="text-[#999999] text-sm">Description</span>
                                <span className="text-[#C3FF00] text-sm mx-1">-</span>
                                <span className="text-white text-sm">{jarDescription}</span>
                              </div>

                              {/* Metadata and action button */}
                              <div className="flex justify-between items-center pt-2">
                                <div className="grid grid-cols-3 gap-6">
                                  <div>
                                    <div className="text-[#999999] text-xs">Access Type</div>
                                    <div className="text-white font-medium">
                                      {jar.accessType === 0 ? "Whitelist" : "NFT-Gated"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[#999999] text-xs">Created</div>
                                    <div className="text-white font-medium">
                                      {new Date(Number(jar.registrationTime) * 1000).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[#999999] text-xs">Creator</div>
                                    <div className="text-white font-medium truncate" title={jar.jarCreator}>
                                      {jar.jarCreator.substring(0, 6)}...
                                      {jar.jarCreator.substring(jar.jarCreator.length - 4)}
                                    </div>
                                  </div>
                                </div>

                                <Button
                                  onClick={() => navigateToJar(jar.jarAddress)}
                                  className="bg-[#C3FF00] hover:bg-[#D4FF33] text-[#1F1F1F] p-2 aspect-square rounded-full"
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
                    })}
                  </div>
                ) : (
                  // Grid view with the same professional style as list view
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentJars.map((jar, index) => {
                      const indexOfLastJar = currentPage * jarsPerPage
                      const indexOfFirstJar = indexOfLastJar - jarsPerPage
                      const isWhitelisted = whitelistedJars[jar.jarAddress]
                      const hasNFTAccess = nftAccessJars[jar.jarAddress]
                      const isAdmin = !!adminJars[jar.jarAddress]

                      return (
                        <JarCard
                          key={jar.jarAddress}
                          jar={jar}
                          index={index}
                          indexOfFirstJar={indexOfFirstJar}
                          isWhitelisted={isWhitelisted}
                          hasNFTAccess={hasNFTAccess}
                          isAdmin={isAdmin}
                          onClick={() => navigateToJar(jar.jarAddress)}
                          className="hover:shadow-lg"
                        />
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {/* Pagination controls */}
            {filteredJars.length > jarsPerPage && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                    window.scrollTo(0, 0)
                  }}
                  disabled={currentPage === 1}
                  className={
                    currentPage === 1
                      ? "bg-gray-500 text-white border-none"
                      : "bg-[#2A2A2A] text-white border-[#444444] hover:bg-[#333333]"
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center space-x-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setCurrentPage(i + 1)
                        window.scrollTo(0, 0)
                      }}
                      className={
                        currentPage === i + 1
                          ? "bg-[#C3FF00] text-[#1F1F1F] border-none hover:bg-[#A3DF00] font-medium"
                          : "bg-[#2A2A2A] text-white border-[#444444] hover:bg-[#333333]"
                      }
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    window.scrollTo(0, 0)
                  }}
                  disabled={currentPage === totalPages}
                  className={
                    currentPage === totalPages
                      ? "bg-gray-500 text-white border-none"
                      : "bg-[#2A2A2A] text-white border-[#444444] hover:bg-[#333333]"
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {isLoading && cookieJarsData.length > 0 && (
          <div className="flex items-center justify-center mt-8">
            <RefreshCw className="h-5 w-5 mr-2 animate-spin text-[#C3FF00]" />
            <span className="text-[#AAAAAA]">Loading more cookie jars...</span>
          </div>
        )}
      </div>
    </div>
  )
}
