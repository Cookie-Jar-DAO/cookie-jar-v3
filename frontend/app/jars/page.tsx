"use client"
import { useCookieJarData } from "@/hooks/use-cookie-jar-registry"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Search, ChevronLeft, ChevronRight, ArrowLeft, List, Grid, ArrowUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { useState, useEffect, useMemo, useRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { keccak256, toUtf8Bytes } from "ethers"
import { ethers } from "ethers"
import { JarCard } from "@/components/ui/jar-card"
import { ListJarCard } from "@/components/ui/list-jar-card"
import { useAdminStatus } from "@/hooks/use-admin-status"
import { MemoizedCustomConnectButton } from "@/components/wallet/custom-connect-button"
import { useIsMobile } from "@/hooks/design/use-mobile"
import { cn } from "@/lib/utils"

// Add a custom scroll-to-top button specifically for the jars page
function JarsPageScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const isMobile = useIsMobile()

  // Check if device is mobile and show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  // Set the top scroll listener
  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility)
    return () => {
      window.removeEventListener("scroll", toggleVisibility)
    }
  }, [])

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed z-[60] p-3 rounded-full bg-[#c3ff00] text-[#1F1F1F] shadow-lg transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none",
        isMobile ? "bottom-6 right-4" : "bottom-6 right-6",
      )}
      aria-label="Scroll to top"
      id="jars-scroll-to-top-button"
    >
      <ArrowUp className="h-6 w-6" />
    </button>
  )
}

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
  const isMobile = useIsMobile()
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Load view mode preference from localStorage on initial render
  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      const savedViewMode = localStorage.getItem("cookieJarViewMode")
      if (savedViewMode === "list" || savedViewMode === "grid") {
        // On mobile, always use list view regardless of saved preference
        if (isMobile) {
          setViewMode("list")
        } else {
          setViewMode(savedViewMode)
        }
      }
    }
  }, [isMobile])

  // Save view mode preference to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && !isMobile) {
      localStorage.setItem("cookieJarViewMode", viewMode)
    }
  }, [viewMode, isMobile])

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
    // On mobile, we'll ignore the change and keep the default view
    if (!isMobile) {
      setViewMode(mode)
      // localStorage is already updated via the useEffect
    }
  }

  // Toggle advanced filters visibility on mobile
  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] py-10">
        <div className="bg-[#2A2A2A] border border-[#444444] p-8 rounded-xl shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-lg text-[#AAAAAA] mb-6">Please connect your wallet to view Cookie Jars.</p>
          <MemoizedCustomConnectButton className="w-full mx-auto mt-4" />
        </div>
      </div>
    )
  }

  // Mobile view toggle buttons
  const ViewToggleButtons = () =>
    !isMobile && (
      <div className="flex border border-[#444444] rounded-md overflow-hidden">
        <button
          onClick={() => handleViewModeChange("list")}
          className={`p-2 flex items-center justify-center ${
            viewMode === "list" ? "bg-[#C3FF00] text-[#1F1F1F]" : "bg-[#333333] text-white"
          }`}
          aria-label="List view"
        >
          <List className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleViewModeChange("grid")}
          className={`p-2 flex items-center justify-center ${
            viewMode === "grid" ? "bg-[#C3FF00] text-[#1F1F1F]" : "bg-[#333333] text-white"
          }`}
          aria-label="Grid view"
        >
          <Grid className="h-5 w-5" />
        </button>
      </div>
    )

  return (
    <div className="bg-[#121212] min-h-screen flex flex-col">
      {/* Fixed header that shows/hides on scroll */}
      <div
        ref={headerRef}
        className={`sticky top-0 left-0 right-0 z-40 bg-[#121212] transition-transform duration-300 ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 py-5 md:py-8">
          <div className="flex flex-col space-y-4 md:space-y-6">
            {/* Top section with title and back button */}
            <div className="flex items-start">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  router.replace("/")
                }}
                className="bg-[#C3FF00] rounded-full h-8 w-8 md:h-10 md:w-10 flex items-center justify-center mr-3 md:mr-4 self-start mt-1"
              >
                <ArrowLeft className="w-4 h-4 md:w-6 md:h-6 text-gray-800" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl md:text-4xl font-bold text-white">
                  <span className="text-[#C3FF00]">Explore</span> Cookie Jars
                </h1>
                <p className="text-sm md:text-base text-[#999999] mt-1">
                  View all deployed cookie jars and their details
                </p>
              </div>

              {/* Create Jar button on mobile - positioned at top right */}
              {isMobile && (
                <button
                  className="cssbuttons-io-button-jars flex-shrink-0 h-10 px-4 min-w-[90px]"
                  onClick={() => router.push("/create")}
                >
                  <span className="text-sm whitespace-nowrap mr-1">CREATE--</span>
                  <div className="icon">
                    <svg height="16" width="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 0h24v24H0z" fill="none"></path>
                      <path
                        d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </div>
                </button>
              )}
            </div>

            {/* Controls section */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              {/* Left side - jars counter on desktop, search and view toggle on mobile */}
              <div className="flex items-center gap-3 md:gap-4 w-full">
                {/* Total jars counter - visible on all screen sizes */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <span className="text-xs text-[#999999] mb-1">Total jars</span>
                  <div className="w-12 h-12 md:w-16 md:h-16 border border-[#C3FF00] rounded-md flex items-center justify-center bg-[#222222]">
                    <span className="text-xl md:text-2xl font-bold text-white">
                      <CounterBox value={cookieJarsData.length} />
                    </span>
                  </div>
                </div>

                {/* Mobile-only controls */}
                {isMobile && (
                  <div className="flex items-center gap-2 w-full">
                    {/* Search on mobile */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#999999]" />
                      <Input
                        placeholder="Search jars..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 bg-[#333333] border-[#444444] text-white focus-visible:ring-[#C3FF00] placeholder:text-[#999999]"
                      />
                    </div>

                    {/* Filter toggle button on mobile */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleFilters}
                      className="h-12 w-12 border-[#444444] bg-[#333333] text-white flex-shrink-0"
                      aria-expanded={isFilterOpen}
                      aria-controls="mobile-filters"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`${isFilterOpen ? "text-[#C3FF00]" : "text-white"}`}
                      >
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                      </svg>
                    </Button>
                  </div>
                )}
              </div>

              {/* Mobile filters dropdown - conditionally rendered */}
              {isMobile && isFilterOpen && (
                <div
                  id="mobile-filters"
                  className="p-4 bg-[#222222] rounded-lg border border-[#444444] shadow-lg space-y-3"
                >
                  <Select value={filterOption} onValueChange={setFilterOption}>
                    <SelectTrigger className="w-full bg-[#333333] border-[#444444] text-white focus-visible:ring-[#C3FF00]">
                      <SelectValue placeholder="Filter jars" />
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
                </div>
              )}

              {/* Desktop controls - hidden on mobile */}
              {!isMobile && (
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
              )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} className="h-36 md:h-48 w-full rounded-lg bg-[#2A2A2A]" />
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
                {isMobile || viewMode === "list" ? (
                  <div className="space-y-3 md:space-y-4">
                    {currentJars.map((jar, index) => {
                      const indexOfLastJar = currentPage * jarsPerPage
                      const indexOfFirstJar = indexOfLastJar - jarsPerPage
                      const isWhitelisted = whitelistedJars[jar.jarAddress]
                      const hasNFTAccess = nftAccessJars[jar.jarAddress]
                      const isAdmin = !!adminJars[jar.jarAddress]

                      return (
                        <ListJarCard
                          key={jar.jarAddress}
                          jar={jar}
                          index={index}
                          indexOfFirstJar={indexOfFirstJar}
                          isWhitelisted={isWhitelisted}
                          hasNFTAccess={hasNFTAccess}
                          isAdmin={isAdmin}
                          onClick={() => navigateToJar(jar.jarAddress)}
                        />
                      )
                    })}
                  </div>
                ) : (
                  // Grid view - only shown on desktop
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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

            {/* Pagination controls - simplified for mobile */}
            {filteredJars.length > jarsPerPage && (
              <div className="flex justify-center items-center mt-6 md:mt-8 space-x-1 md:space-x-2">
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
                      ? "bg-gray-500 text-white border-none h-8 w-8 p-0"
                      : "bg-[#2A2A2A] text-white border-[#444444] hover:bg-[#333333] h-8 w-8 p-0"
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Show fewer page numbers on mobile */}
                <div className="flex items-center space-x-1">
                  {[...Array(isMobile ? Math.min(5, totalPages) : totalPages)].map((_, i) => {
                    // For mobile with many pages, show first, last, current and neighbors
                    if (isMobile && totalPages > 5) {
                      const showFirstPage = i === 0
                      const showLastPage = i === 4
                      const middlePages = [currentPage - 1, currentPage, currentPage + 1].filter(
                        (page) => page > 1 && page < totalPages,
                      )
                      const showMiddlePage = i > 0 && i < 4 && middlePages[i - 1]

                      if (showFirstPage) {
                        return (
                          <Button
                            key={0}
                            variant={currentPage === 1 ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setCurrentPage(1)
                              window.scrollTo(0, 0)
                            }}
                            className={
                              currentPage === 1
                                ? "bg-[#C3FF00] text-[#1F1F1F] border-none hover:bg-[#A3DF00] font-medium h-8 w-8 p-0"
                                : "bg-[#2A2A2A] text-white border-[#444444] hover:bg-[#333333] h-8 w-8 p-0"
                            }
                          >
                            1
                          </Button>
                        )
                      } else if (showLastPage) {
                        return (
                          <Button
                            key={totalPages - 1}
                            variant={currentPage === totalPages ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setCurrentPage(totalPages)
                              window.scrollTo(0, 0)
                            }}
                            className={
                              currentPage === totalPages
                                ? "bg-[#C3FF00] text-[#1F1F1F] border-none hover:bg-[#A3DF00] font-medium h-8 w-8 p-0"
                                : "bg-[#2A2A2A] text-white border-[#444444] hover:bg-[#333333] h-8 w-8 p-0"
                            }
                          >
                            {totalPages}
                          </Button>
                        )
                      } else {
                        return (
                          <span key={i} className="text-[#777777] px-1">
                            …
                          </span>
                        )
                      }
                    } else {
                      // Default pagination for desktop or when pages <= 5
                      return (
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
                              ? "bg-[#C3FF00] text-[#1F1F1F] border-none hover:bg-[#A3DF00] font-medium h-8 w-8 p-0 md:h-9 md:w-9 md:p-0"
                              : "bg-[#2A2A2A] text-white border-[#444444] hover:bg-[#333333] h-8 w-8 p-0 md:h-9 md:w-9 md:p-0"
                          }
                        >
                          {i + 1}
                        </Button>
                      )
                    }
                  })}
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
                      ? "bg-gray-500 text-white border-none h-8 w-8 p-0"
                      : "bg-[#2A2A2A] text-white border-[#444444] hover:bg-[#333333] h-8 w-8 p-0"
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
      {/* Custom scroll-to-top button for jars page */}
      <JarsPageScrollToTop />
    </div>
  )
}
