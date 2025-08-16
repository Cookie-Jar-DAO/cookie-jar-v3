"use client"

import { useEffect, useState } from "react"
import { useAccount, useChainId } from "wagmi"
import { useRouter } from "next/navigation"
import { useCookieJarData } from "@/hooks/use-cookie-jar-registry"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Copy, ExternalLink, User, Clock, Cookie } from "lucide-react"
import { shortenAddress } from "@/lib/utils/utils"
import { getExplorerAddressUrl, getNetworkName } from "@/lib/utils/network-utils"
import { BackButton } from "@/components/design/back-button"
import { contractAddresses } from "@/config/supported-networks"
import { getNativeCurrency } from '@/config/supported-networks'

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const router = useRouter()
  const { cookieJarsData, isLoading, error } = useCookieJarData()
  const [mounted, setMounted] = useState(false)
  const nativeCurrency = getNativeCurrency(chainId)

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

  // Filter jars created by the current user
  const userJars = cookieJarsData.filter(
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
    <div className="container mx-auto py-10 px-4 space-y-6 bg-[#2b1d0e] min-h-screen">
      <div className="mb-6">
        <BackButton />
      </div>

      {/* Profile Header */}
      <Card className="border-none shadow-lg bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#ff5e14] to-[#ff8e14] text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl md:text-3xl flex items-center">
              <User className="h-6 w-6 mr-2" />
              Profile Dashboard
            </CardTitle>
            <Badge className="bg-white text-[#ff5e14] hover:bg-white">
              {address ? shortenAddress(address, 6) : "Not Connected"}
            </Badge>
          </div>
          <CardDescription className="text-white/90">Manage your Cookie Jars and account settings</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col space-y-2">
              <span className="text-sm text-[#8b7355]">Wallet Address</span>
              <div className="flex items-center">
                <span className="font-medium text-[#3c2a14] mr-2">{address ? shortenAddress(address, 10) : "N/A"}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => address && copyToClipboard(address)}
                  className="h-7 w-7 text-[#ff5e14] hover:text-[#ff5e14] hover:bg-[#fff0e0]"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-[#ff5e14] hover:text-[#ff5e14] hover:bg-[#fff0e0]"
                  asChild
                >
                  <a
                    href={address ? getExplorerAddressUrl(address, chainId) : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <span className="text-sm text-[#8b7355]">Network</span>
              <span className="font-medium text-[#3c2a14]">{getNetworkName(chainId)}</span>
            </div>

            <div className="flex flex-col space-y-2">
              <span className="text-sm text-[#8b7355]">Jars Created</span>
              <span className="font-medium text-[#3c2a14]">{userJars.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="my-jars" className="w-full">
        <TabsList className="mb-6 bg-[#fff8f0] p-1 w-full">
          <TabsTrigger
            value="my-jars"
            className="data-[state=active]:bg-white data-[state=active]:text-[#ff5e14] data-[state=active]:shadow-sm text-[#4a3520] flex-1"
          >
            <Cookie className="h-4 w-4 mr-2" />
            My Jars
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="data-[state=active]:bg-white data-[state=active]:text-[#ff5e14] data-[state=active]:shadow-sm text-[#4a3520] flex-1"
          >
            <Clock className="h-4 w-4 mr-2" />
            Recent Activity
          </TabsTrigger>
        </TabsList>

        {/* My Jars Tab */}
        <TabsContent value="my-jars" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Loading skeletons
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="border-none shadow-md">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))
            ) : userJars.length > 0 ? (
              // User's jars
              userJars.map((jar, index) => (
                <Card
                  key={jar.jarAddress}
                  className="jar-card bg-white border-none shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-full before:h-1 before:bg-[#ff5e14]"
                >
                  <div className="absolute top-0 right-0 w-8 h-8 bg-[#ff5e14] transform rotate-45 translate-x-4 -translate-y-4"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-bold text-[#3c2a14]">
                      {jar.metadata || `Cookie Jar #${index + 1}`}
                    </CardTitle>
                    <CardDescription className="text-sm text-[#a89a8c] truncate">{jar.jarAddress}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[#8b7355] font-medium">Access:</span>
                        <span className="text-[#3c2a14]">{jar.accessType === 0 ? "Whitelist" : "NFT-Gated"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#8b7355] font-medium">Created:</span>
                        <span className="text-[#3c2a14]">
                          {new Date(Number(jar.registrationTime) * 1000).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#8b7355] font-medium">Currency:</span>
                        <span className="text-[#3c2a14]">
                          {jar.currency === "0x0000000000000000000000000000000000000003" ? `${nativeCurrency.symbol} (Native)` : "ERC20"}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-end pt-4 border-t border-[#f0e6d8]">
                    <Button
                      onClick={() => router.push(`/jar/${jar.jarAddress}`)}
                      className="bg-[#ff5e14] text-white hover:bg-white hover:text-[#ff5e14] hover:border-[#ff5e14] border transition-all"
                    >
                      <ArrowUpRight className="h-4 w-4 mr-2" /> Manage Jar
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              // No jars created yet
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <Cookie className="h-16 w-16 text-[#a89a8c] mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Jars Created Yet</h3>
                <p className="text-[#a89a8c] max-w-md mb-6">
                  You haven't created any Cookie Jars yet. Create your first jar to start managing shared funds.
                </p>
                <Button onClick={() => router.push("/create")} className="bg-[#ff5e14] text-white hover:bg-[#e54d00]">
                  Create Your First Jar
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-0">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-[#fff8f0] rounded-t-lg">
              <CardTitle className="text-xl text-[#3c2a14]">Recent Activity</CardTitle>
              <CardDescription className="text-[#8b7355]">
                Your recent transactions and interactions with Cookie Jars
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* In a real implementation, we would fetch transaction history from the blockchain */}
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-16 w-16 text-[#a89a8c] mb-4" />
                <h3 className="text-xl font-bold text-[#3c2a14] mb-2">Transaction History</h3>
                <p className="text-[#8b7355] max-w-md">
                  Your recent transactions with Cookie Jars will appear here. Create or interact with jars to see your
                  activity.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
