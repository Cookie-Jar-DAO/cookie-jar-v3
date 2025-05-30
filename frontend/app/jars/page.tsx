"use client"
import { useCookieJarFactory } from "@/hooks/use-cookie-jar-factory"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, ArrowUpRight, Search, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { useAccount, useChainId } from "wagmi"
import { getNetworkName } from "@/lib/utils/network-utils"
import { useState, useEffect, useMemo } from "react"
import { BackButton } from "@/components/design/back-button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { keccak256, toUtf8Bytes } from "ethers"
import { ethers } from "ethers"
import { MemoizedCustomConnectButton } from "@/components/wallet/custom-connect-button"
import { useReadCookieJarHasRole } from "@/generated"
import { Users, ShieldAlert } from "lucide-react"

export default function CookieJarPage() {
  const { cookieJarsData, isLoading, error } = useCookieJarFactory()
  const router = useRouter()
  const { isConnected, address: userAddress } = useAccount()
  const chainId = useChainId()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const jarsPerPage = 9
  const [filterOption, setFilterOption] = useState("all")
  const [whitelistedJars, setWhitelistedJars] = useState<Record<string, boolean>>({})
  const [adminJars, setAdminJars] = useState<Record<string, boolean>>({})
  const [isCheckingWhitelist, setIsCheckingWhitelist] = useState(false)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false)

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
    
    // Apply admin filter if selected
    if (filterOption === "admin") {
      filtered = filtered.filter((jar) => adminJars[jar.jarAddress])
    }

    return filtered
  }, [cookieJarsData, searchTerm, filterOption, whitelistedJars, adminJars])

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

  // Check role status (whitelist and admin) for each jar
  useEffect(() => {
    const checkRoleStatus = async () => {
      if (!userAddress || cookieJarsData.length === 0) return

      setIsCheckingWhitelist(true)
      setIsCheckingAdmin(true)
      
      const whitelistStatuses: Record<string, boolean> = { ...whitelistedJars }
      const adminStatuses: Record<string, boolean> = { ...adminJars }

      // Define role constants
      const JAR_WHITELISTED = keccak256(toUtf8Bytes("JAR_WHITELISTED")) as `0x${string}`
      const JAR_OWNER_ROLE = keccak256(toUtf8Bytes("JAR_OWNER")) as `0x${string}`

      // Create a provider
      const provider = window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null
      if (!provider) {
        setIsCheckingWhitelist(false)
        setIsCheckingAdmin(false)
        return
      }

      // Check each jar
      for (const jar of cookieJarsData) {
        try {
          // Create a contract instance
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
            ],
            provider,
          )

          // Check whitelist role
          const hasWhitelistRole = await contract.hasRole(JAR_WHITELISTED, userAddress)
          whitelistStatuses[jar.jarAddress] = hasWhitelistRole
          
          // Check admin role
          const hasAdminRole = await contract.hasRole(JAR_OWNER_ROLE, userAddress)
          adminStatuses[jar.jarAddress] = hasAdminRole
          
        } catch (error) {
          console.error(`Error checking roles for ${jar.jarAddress}:`, error)
          whitelistStatuses[jar.jarAddress] = false
          adminStatuses[jar.jarAddress] = false
        }
      }

      setWhitelistedJars(whitelistStatuses)
      setAdminJars(adminStatuses)
      setIsCheckingWhitelist(false)
      setIsCheckingAdmin(false)
    }

    checkRoleStatus()
  }, [cookieJarsData, userAddress])

  const navigateToJar = (address: string) => {
    router.push(`/jar/${address}`)
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] py-10">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-bold text-[#3c2a14] mb-4">Connect Your Wallet</h2>
          <p className="text-lg text-[#4a3520] mb-6">Please connect your wallet to view Cookie Jars.</p>
          <MemoizedCustomConnectButton className="w-full mx-auto mt-4" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-6 bg-[#2b1d0e] min-h-screen">
      <div className="mb-6">
        <BackButton />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">Cookie Jars on {getNetworkName(chainId)}</h1>
          <p className="text-xl text-[#a89a8c] mt-2">To view jars on another network, change to that network.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="w-40">
              <Select value={filterOption} onValueChange={setFilterOption}>
                <SelectTrigger className="bg-white border-[#f0e6d8] text-[#3c2a14] focus-visible:ring-[#ff5e14]">
                  <SelectValue placeholder="Filter jars" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jars</SelectItem>
                  <SelectItem value="whitelisted">Whitelisted</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#a89a8c]" />
              <Input
                placeholder="Search jars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-[#f0e6d8] text-[#3c2a14] focus-visible:ring-[#ff5e14]"
              />
            </div>
          </div>
          <Button onClick={() => router.push("/create")} className="bg-[#ff5e14] hover:bg-[#e54d00] text-white">
            Create New Jar
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error.message}</p>
        </div>
      )}

      {isLoading && cookieJarsData.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {filteredJars.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-[#4a3520]">No jars found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentJars.map((jar, index) => {
                const indexOfLastJar = currentPage * jarsPerPage
                const indexOfFirstJar = indexOfLastJar - jarsPerPage
                const isWhitelisted = whitelistedJars[jar.jarAddress]
                const isAdmin = adminJars[jar.jarAddress]

                return (
                  <Card
                    key={jar.jarAddress}
                    className="jar-card bg-white border-none shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-full before:h-1 before:bg-[#ff5e14]"
                  >
                    {isWhitelisted && (
                      <Badge 
                        variant="outline"
                        className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-[#e6f7e6] text-[#2e7d32] border-[#2e7d32] px-3 py-1"
                      >
                        <Users className="h-3 w-3 mr-1" />
                        <span className="text-xs">Whitelisted</span>
                      </Badge>
                    )}
                    {isAdmin && (
                      <Badge 
                        variant="outline"
                        className="absolute top-2 right-8 z-10 flex items-center gap-1 bg-[#fce4ec] text-[#c2185b] border-[#c2185b] px-3 py-1"
                      >
                        <ShieldAlert className="h-3 w-3 mr-1" />
                        <span className="text-xs">Admin</span>
                      </Badge>
                    )}
                    <div className="absolute top-0 right-0 w-8 h-8 bg-[#ff5e14] transform rotate-45 translate-x-4 -translate-y-4"></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl font-bold text-[#3c2a14]">
                        {jar.metadata || `Cookie Jar #${indexOfFirstJar + index + 1}`}
                      </CardTitle>
                      <CardDescription className="text-sm text-[#a89a8c] truncate">{jar.jarAddress}</CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[#8b7355] font-medium">Access:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[#3c2a14]">{jar.accessType === 0 ? "Whitelist" : "NFT-Gated"}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#8b7355] font-medium">Withdrawal Type:</span>
                          <span className="text-[#3c2a14]">
                            {jar.withdrawalOption === 0 ? "Fixed" : "Variable"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#8b7355] font-medium">Currency:</span>
                          <span className="text-[#3c2a14] truncate max-w-[180px] text-right">
                            {jar.currency === "0x0000000000000000000000000000000000000003" ? "ETH" : jar.currency}
                          </span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="flex justify-end pt-4 border-t border-[#f0e6d8]">
                      <Button
                        onClick={() => navigateToJar(jar.jarAddress)}
                        className="bg-[#ff5e14] text-white hover:bg-white hover:text-[#ff5e14] hover:border-[#ff5e14] border transition-all"
                      >
                        <ArrowUpRight className="h-4 w-4 mr-2" /> Open the jar
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Pagination controls */}
          {filteredJars.length > jarsPerPage && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-[#f0e6d8] text-[#8b7355] hover:bg-[#fff7ec] hover:text-[#ff5e14]"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center space-x-1">
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                    className={
                      currentPage === i + 1
                        ? "bg-[#ff5e14] text-white hover:bg-[#e54d00]"
                        : "border-[#f0e6d8] text-[#8b7355] hover:bg-[#fff7ec] hover:text-[#ff5e14]"
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
                className="border-[#f0e6d8] text-[#8b7355] hover:bg-[#fff7ec] hover:text-[#ff5e14]"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {isLoading && cookieJarsData.length > 0 && (
        <div className="flex items-center justify-center mt-8">
          <RefreshCw className="h-5 w-5 mr-2 animate-spin text-[#ff5e14]" />
          <span className="text-[#4a3520]">Loading more cookie jars...</span>
        </div>
      )}

      <p className="text-sm text-[#ff5e14] mt-8 font-medium">
        Total jars loaded: {filteredJars.length}
        {filterOption === "whitelisted" && ` (${filteredJars.length} whitelisted)`}
        {filterOption === "admin" && ` (${filteredJars.length} admin)`}
      </p>
    </div>
  )
}
