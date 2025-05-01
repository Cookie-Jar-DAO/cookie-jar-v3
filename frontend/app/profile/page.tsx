"use client"

import { useEffect, useState, useMemo } from "react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { useCookieJarData } from "@/hooks/use-cookie-jar-registry"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowUpRight,
  Copy,
  ExternalLink,
  User,
  Clock,
  Cookie,
  Search,
  CheckCircle,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { shortenAddress } from "@/lib/utils/utils"
import { BackButton } from "@/components/design/back-button"
import { useAdminStatus } from "@/hooks/use-admin-status"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { keccak256, toUtf8Bytes } from "ethers"
import { ethers } from "ethers"
import { CustomTooltip } from "@/components/ui/custom-tooltip"

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const { cookieJarsData, isLoading, error } = useCookieJarData()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterOption, setFilterOption] = useState("admin")
  const [whitelistedJars, setWhitelistedJars] = useState<Record<string, boolean>>({})
  const [isCheckingWhitelist, setIsCheckingWhitelist] = useState(false)
  const [nftAccessJars, setNftAccessJars] = useState<Record<string, boolean>>({})
  const [isCheckingNFT, setIsCheckingNFT] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const jarsPerPage = 9

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect to home if not connected
  useEffect(() => {
    if (mounted && !isConnected) {
      router.push("/")
    }
  }, [mounted, isConnected, router])

  // Extract jar addresses for the admin check
  const jarAddresses = useMemo(() => cookieJarsData.map((jar) => jar.jarAddress), [cookieJarsData])
  const { adminJars, isCheckingAdmin } = useAdminStatus(jarAddresses)

  // Check whitelist and NFT access status
  useEffect(() => {
    const checkJarAccess = async () => {
      if (!address || cookieJarsData.length === 0) return

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

                const hasRole = await contract.hasRole(JAR_WHITELISTED, address)
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
                          const balance = await erc1155Contract.balanceOf(address, 0)
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
                          const balance = await erc721Contract.balanceOf(address)
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

    if (address && cookieJarsData.length > 0) {
      checkJarAccess()
    }
  }, [address, cookieJarsData])

  // Filter jars based on search term and filter option
  const filteredJars = useMemo(() => {
    let filtered = cookieJarsData.filter(
      (jar) =>
        jar.metadata?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jar.jarAddress.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Apply filter options
    switch (filterOption) {
      case "admin":
        filtered = filtered.filter((jar) => adminJars[jar.jarAddress] === true)
        break
      case "whitelisted":
        filtered = filtered.filter((jar) => whitelistedJars[jar.jarAddress] === true)
        break
      case "nftaccess":
        filtered = filtered.filter((jar) => nftAccessJars[jar.jarAddress] === true)
        break
      case "created":
        filtered = filtered.filter(
          (jar) => jar.jarCreator && address && jar.jarCreator.toLowerCase() === address.toLowerCase(),
        )
        break
      // "all" case doesn't need filtering
    }

    return filtered
  }, [cookieJarsData, searchTerm, filterOption, adminJars, whitelistedJars, nftAccessJars, address])

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

  // Count jars created by the user
  const createdJars = cookieJarsData.filter(
    (jar) => jar.jarCreator && address && jar.jarCreator.toLowerCase() === address.toLowerCase(),
  )

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  if (!mounted || !isConnected) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#1F1F1F]">
      {/* Hero section with profile info */}
      <div className="relative bg-gradient-to-b from-[#2A2A2A] to-[#1F1F1F] pt-6 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <BackButton />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Profile</h1>
              <div className="flex items-center gap-2 text-[#AAAAAA]">
                <span>{address ? shortenAddress(address, 10) : "Not Connected"}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => address && copyToClipboard(address)}
                  className="h-7 w-7 text-[#AAAAAA] hover:text-white hover:bg-[#ffffff20]"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-[#AAAAAA] hover:text-white hover:bg-[#ffffff20]"
                  asChild
                >
                  <a
                    href={`https://sepolia-explorer.base.org/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {/* Stats cards */}
              <div className="bg-[#ffffff15] backdrop-blur-sm rounded-lg px-6 py-4 text-center">
                <div className="text-3xl font-bold text-white">{createdJars.length}</div>
                <div className="text-[#AAAAAA] text-sm">Jars Created</div>
              </div>

              <div className="bg-[#ffffff15] backdrop-blur-sm rounded-lg px-6 py-4 text-center">
                <div className="text-3xl font-bold text-white">{Object.values(adminJars).filter(Boolean).length}</div>
                <div className="text-[#AAAAAA] text-sm">Admin Jars</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="bg-[#393939] backdrop-blur-sm rounded-xl border border-[#444444] shadow-xl overflow-hidden">
          {/* Tabs navigation */}
          <Tabs defaultValue="my-jars" className="w-full">
            <div className="border-b border-[#444444]">
              <TabsList className="bg-transparent w-full flex justify-start p-0 h-auto">
                <TabsTrigger
                  value="my-jars"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#C3FF00] data-[state=active]:text-[#C3FF00] rounded-none px-6 py-4 text-white hover:bg-transparent hover:text-white focus:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 flex items-center"
                >
                  <Cookie className="h-4 w-4 mr-2" />
                  My Jars
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#C3FF00] data-[state=active]:text-[#C3FF00] rounded-none px-6 py-4 text-white hover:bg-transparent hover:text-white focus:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 flex items-center"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Recent Activity
                </TabsTrigger>
              </TabsList>
            </div>

            {/* My Jars Tab Content */}
            <TabsContent value="my-jars" className="p-6">
              {/* Search and Filter Controls */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-[#2A2A2A] p-4 rounded-lg">
                <div className="relative w-full md:w-[300px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#AAAAAA]" />
                  <Input
                    placeholder="Search jars..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-[#393939] border-[#444444] text-white focus-visible:ring-[#C3FF00] placeholder:text-[#AAAAAA]"
                  />
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  <Select value={filterOption} onValueChange={setFilterOption}>
                    <SelectTrigger className="w-[200px] bg-[#393939] border-[#444444] text-white focus-visible:ring-[#C3FF00]">
                      <SelectValue placeholder="Filter jars" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#393939] border-[#444444] text-white">
                      <SelectItem value="admin">{isCheckingAdmin ? "Checking Admin..." : "Admin Jars"}</SelectItem>
                      <SelectItem value="whitelisted">
                        {isCheckingWhitelist ? "Checking Whitelist..." : "Whitelisted Jars"}
                      </SelectItem>
                      <SelectItem value="nftaccess">
                        {isCheckingNFT ? "Checking NFT Access..." : "NFT Access Jars"}
                      </SelectItem>
                      <SelectItem value="created">Created by Me</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={() => router.push("/create")}
                    className="bg-[#C3FF00] hover:bg-[#A3DF00] text-[#1F1F1F] font-medium"
                  >
                    Create New Jar
                  </Button>
                </div>
              </div>

              {/* Status indicators */}
              {(isLoading || isCheckingAdmin || isCheckingWhitelist || isCheckingNFT) && (
                <div className="flex items-center justify-center bg-[#2A2A2A] p-3 rounded-lg mb-6">
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin text-[#C3FF00]" />
                  <span className="text-white">Loading jar information...</span>
                </div>
              )}

              {/* Jars grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading || isCheckingAdmin || isCheckingWhitelist || isCheckingNFT ? (
                  // Loading skeletons
                  Array(9)
                    .fill(0)
                    .map((_, index) => (
                      <Card key={index} className="border-none shadow-md bg-[#2A2A2A]">
                        <CardHeader className="pb-2">
                          <Skeleton className="h-6 w-3/4 mb-2 bg-[#444444]" />
                          <Skeleton className="h-4 w-1/2 bg-[#444444]" />
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <Skeleton className="h-4 w-full bg-[#444444]" />
                            <Skeleton className="h-4 w-full bg-[#444444]" />
                            <Skeleton className="h-4 w-2/3 bg-[#444444]" />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Skeleton className="h-10 w-full bg-[#444444]" />
                        </CardFooter>
                      </Card>
                    ))
                ) : filteredJars.length > 0 ? (
                  // User's jars using the jar-card style
                  currentJars.map((jar, index) => (
                    <div
                      key={jar.jarAddress}
                      className="bg-[#2A2A2A] rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-visible relative group cursor-default border border-[#444444]"
                    >
                      {/* Removed the green gradient line */}

                      <div className="p-5">
                        {/* Title and badges section */}
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-white/80 font-semibold text-lg leading-tight pr-2 border-b border-[#C3FF00] pb-1 inline-block">
                            {jar.metadata
                              ?.split(":")?.[0]
                              ?.replace(/\[.*?\]/g, "")
                              .trim() || `Cookie Jar #${index + 1}`}
                          </h3>

                          {/* Icon-only transparent badges with tooltips */}
                          <div className="flex flex-row gap-2">
                            {adminJars[jar.jarAddress] && (
                              <CustomTooltip
                                content="Admin Access"
                                position="top"
                                tooltipClassName="bg-[#2A2A2A]/90 border border-[#444444] text-white text-xs font-medium shadow-xl"
                              >
                                <div className="text-white/50 hover:text-white/80 transition-colors">
                                  <Shield className="h-5 w-5" />
                                </div>
                              </CustomTooltip>
                            )}
                            {whitelistedJars[jar.jarAddress] && (
                              <CustomTooltip
                                content="Whitelisted User"
                                position="top"
                                tooltipClassName="bg-[#2A2A2A]/90 border border-[#444444] text-white text-xs font-medium shadow-xl"
                              >
                                <div className="text-white/50 hover:text-white/80 transition-colors">
                                  <CheckCircle className="h-5 w-5" />
                                </div>
                              </CustomTooltip>
                            )}
                            {jar.accessType === 1 && nftAccessJars[jar.jarAddress] && (
                              <CustomTooltip
                                content="NFT Access"
                                position="top"
                                tooltipClassName="bg-[#2A2A2A]/90 border border-[#444444] text-white text-xs font-medium shadow-xl"
                              >
                                <div className="text-white/50 hover:text-white/80 transition-colors">
                                  <CheckCircle className="h-5 w-5" />
                                </div>
                              </CustomTooltip>
                            )}
                            {jar.jarCreator && address && jar.jarCreator.toLowerCase() === address.toLowerCase() && (
                              <CustomTooltip
                                content="Creator"
                                position="top"
                                tooltipClassName="bg-[#2A2A2A]/90 border border-[#444444] text-white text-xs font-medium shadow-xl"
                              >
                                <div className="text-white/50 hover:text-white/80 transition-colors">
                                  <User className="h-5 w-5" />
                                </div>
                              </CustomTooltip>
                            )}
                          </div>
                        </div>

                        {/* Address with improved styling and copy button */}
                        <div className="text-[#AAAAAA] text-xs mb-3 truncate px-2 py-1 bg-[#1F1F1F] rounded-md border border-[#444444] flex items-center justify-between">
                          <span className="truncate">{jar.jarAddress}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(jar.jarAddress)
                            }}
                            className="ml-2 p-1 hover:bg-[#333333] rounded-full transition-colors"
                          >
                            <Copy className="h-3.5 w-3.5 text-[#AAAAAA]" />
                          </button>
                        </div>

                        {/* Description with tooltip - enhanced styling */}
                        <div className="mb-4 relative group">
                          <div className="flex items-start">
                            <span className="text-[#AAAAAA] text-xs font-medium mr-1 mt-0.5">Description:</span>
                            <div className="text-white text-sm relative group/tooltip">
                              {jar.metadata?.split(":")?.[1]?.substring(0, 30) || "No description available"}
                              {jar.metadata?.split(":")?.[1]?.length > 30 && "..."}

                              {/* Tooltip with improved styling */}
                              <div className="absolute z-[9999] left-0 top-full mt-1 bg-[#1F1F1F] text-white text-xs p-3 rounded-md shadow-lg max-w-xs w-max invisible opacity-0 group-hover/tooltip:visible group-hover/tooltip:opacity-100 transition-all duration-200">
                                {jar.metadata?.split(":")?.[1] || "No description available"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Info grid with improved styling */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 p-3 bg-[#1F1F1F] rounded-lg border border-[#444444]">
                          <div>
                            <span className="text-[#AAAAAA] text-xs block">Access Type</span>
                            <span className="text-white text-sm font-medium">
                              {jar.accessType === 0 ? "Whitelist" : "NFT-Gated"}
                            </span>
                          </div>

                          <div>
                            <span className="text-[#AAAAAA] text-xs block">Created</span>
                            <span className="text-white text-sm font-medium">
                              {new Date(Number(jar.registrationTime) * 1000).toLocaleDateString()}
                            </span>
                          </div>

                          <div>
                            <span className="text-[#AAAAAA] text-xs block">Currency</span>
                            <span className="text-white text-sm font-medium">
                              {jar.currency === "0x0000000000000000000000000000000000000003" ? "ETH (Native)" : "ERC20"}
                            </span>
                          </div>

                          <div>
                            <span className="text-[#AAAAAA] text-xs block">Withdrawal</span>
                            <span className="text-white text-sm font-medium">
                              {jar.withdrawalOption === 0 ? "Fixed" : "Variable"}
                            </span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-[#444444] my-3"></div>

                        {/* Action button - changed text and enhanced styling */}
                        <div className="flex justify-end">
                          <Button
                            className="bg-[#C3FF00] text-[#1F1F1F] hover:bg-[#A3DF00] transition-all text-sm px-4 py-1 h-9 shadow-md hover:shadow-lg font-medium"
                            onClick={() => router.push(`/jar/${jar.jarAddress}`)}
                          >
                            <ArrowUpRight className="h-3.5 w-3.5 mr-1.5" />
                            {adminJars[jar.jarAddress] ? "Manage Jar" : "View Jar"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // No jars found with current filter - improved empty state
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-[#2A2A2A] rounded-lg border border-[#444444]">
                    <div className="w-20 h-20 rounded-full bg-[#C3FF00]/10 flex items-center justify-center mb-4">
                      <Cookie className="h-10 w-10 text-[#C3FF00]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Jars Found</h3>
                    <p className="text-[#AAAAAA] max-w-md mb-6">
                      {filterOption === "created"
                        ? "You haven't created any Cookie Jars yet. Create your first jar to see it here."
                        : `No jars found with the current filter. Try changing the filter or create a new jar.`}
                    </p>
                    <Button
                      onClick={() => router.push("/create")}
                      className="bg-[#C3FF00] text-[#1F1F1F] hover:bg-[#A3DF00] font-medium"
                    >
                      Create New Jar
                    </Button>
                  </div>
                )}
              </div>

              {/* Pagination controls */}
              {filteredJars.length > jarsPerPage && (
                <div className="flex justify-center items-center mt-8 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(i + 1)}
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
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
            </TabsContent>

            {/* Activity Tab Content */}
            <TabsContent value="activity" className="p-6">
              <div className="bg-[#2A2A2A] rounded-lg border border-[#444444] p-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#C3FF00]/10 flex items-center justify-center mb-4">
                    <Clock className="h-10 w-10 text-[#C3FF00]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Transaction History</h3>
                  <p className="text-[#AAAAAA] max-w-md">
                    Your recent transactions with Cookie Jars will appear here. Create or interact with jars to see your
                    activity.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
