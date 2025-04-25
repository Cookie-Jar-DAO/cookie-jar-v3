"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { parseEther } from "viem"
import {
  useWriteCookieJarTransferJarOwnership,
  useReadCookieJarJarOwner,
  useWriteCookieJarGrantJarWhitelistRole,
  useWriteCookieJarRevokeJarWhitelistRole,
  useWriteCookieJarGrantJarBlacklistRole,
  useWriteCookieJarRevokeJarBlacklistRole,
  useWriteCookieJarEmergencyWithdrawWithoutState,
  useWriteCookieJarEmergencyWithdrawCurrencyWithState,
  useWriteCookieJarAddNftGate,
  useWriteCookieJarRemoveNftGate,
} from "../../generated"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Shield, UserPlus, UserMinus, AlertTriangle, Tag, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/design/use-toast"
import { useAccount } from "wagmi"

enum NFTType {
  ERC721 = 0,
  ERC1155 = 1,
  Soulbound = 2,
}

interface AdminFunctionsProps {
  address: `0x${string}`
}

export const AdminFunctions: React.FC<AdminFunctionsProps> = ({ address }) => {
  const [newJarOwner, setNewJarOwner] = useState("")
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [tokenAddress, setTokenAddress] = useState("")
  const [addressToUpdate, setAddressToUpdate] = useState("")
  const [nftAddress, setNftAddress] = useState("")
  const [nftTokenId, setNftTokenId] = useState("")
  const [isTransferring, setIsTransferring] = useState(false)
  const { toast } = useToast()
  const { address: currentUserAddress } = useAccount()

  // Read the current jar owner
  const { data: currentOwner, refetch: refetchOwner } = useReadCookieJarJarOwner({
    address,
  })

  // Transfer jar ownership hook
  const {
    writeContract: transferJarOwnership,
    data: transferData,
    error: transferError,
    isSuccess: isTransferSuccess,
    isPending: isTransferPending,
  } = useWriteCookieJarTransferJarOwnership()

  const {
    writeContract: emergencyWithdrawWithoutState,
    data: emergencyWithdrawWithoutStateData,
    error: emergencyWithdrawWithoutStateError,
    isSuccess: isEmergencyWithdrawSuccess,
  } = useWriteCookieJarEmergencyWithdrawWithoutState()

  const {
    writeContract: emergencyWithdrawCurrencyWithState,
    data: emergencyWithdrawWithStateData,
    error: emergencyWithdrawWithStateError,
  } = useWriteCookieJarEmergencyWithdrawCurrencyWithState()

  const {
    writeContract: grantJarWhitelistRole,
    data: whitelistGrantData,
    error: whitelistGrantError,
    isSuccess: isWhitelistGrantSuccess,
  } = useWriteCookieJarGrantJarWhitelistRole()

  const {
    writeContract: revokeJarWhitelistRole,
    data: whitelistRevokeData,
    error: whitelistRevokeError,
    isSuccess: isWhitelistRevokeSuccess,
  } = useWriteCookieJarRevokeJarWhitelistRole()

  const {
    writeContract: grantJarBlacklistRole,
    data: blacklistGrantData,
    error: blacklistGrantError,
    isSuccess: isBlacklistGrantSuccess,
  } = useWriteCookieJarGrantJarBlacklistRole()

  const {
    writeContract: revokeJarBlacklistRole,
    data: blacklistRevokeData,
    error: blacklistRevokeError,
    isSuccess: isBlacklistRevokeSuccess,
  } = useWriteCookieJarRevokeJarBlacklistRole()

  const {
    writeContract: addNftGate,
    data: nftGateData,
    error: nftGateError,
    isSuccess: isNftGateSuccess,
  } = useWriteCookieJarAddNftGate()

  const {
    writeContract: removeNftGate,
    data: removeNftGateData,
    error: removeNftGateError,
    isSuccess: isRemoveNftGateSuccess,
  } = useWriteCookieJarRemoveNftGate()

  // Show success toasts
  useEffect(() => {
    if (isTransferSuccess) {
      toast({
        title: "Ownership Transferred",
        description: "The jar ownership has been successfully transferred.",
      })
      setIsTransferring(false)
      setNewJarOwner("")

      // Refresh the owner data after successful transfer
      setTimeout(() => {
        refetchOwner()
        // Force page refresh to update all UI components
        window.location.reload()
      }, 2000)
    }

    if (isEmergencyWithdrawSuccess) {
      toast({
        title: "Emergency Withdrawal Complete",
        description: "Funds have been successfully withdrawn.",
      })
    }
    if (isWhitelistGrantSuccess) {
      toast({
        title: "Whitelist Updated",
        description: "Address has been added to the whitelist.",
      })
    }
    if (isWhitelistRevokeSuccess) {
      toast({
        title: "Whitelist Updated",
        description: "Address has been removed from the whitelist.",
      })
    }
    if (isBlacklistGrantSuccess) {
      toast({
        title: "Blacklist Updated",
        description: "Address has been added to the blacklist.",
      })
    }
    if (isBlacklistRevokeSuccess) {
      toast({
        title: "Blacklist Updated",
        description: "Address has been removed from the blacklist.",
      })
    }
    if (isNftGateSuccess) {
      toast({
        title: "NFT Gate Added",
        description: "New NFT gate has been added successfully.",
      })
    }
    if (isRemoveNftGateSuccess) {
      toast({
        title: "NFT Gate Removed",
        description: "NFT gate has been removed successfully.",
      })
    }
  }, [
    isTransferSuccess,
    isEmergencyWithdrawSuccess,
    isWhitelistGrantSuccess,
    isWhitelistRevokeSuccess,
    isBlacklistGrantSuccess,
    isBlacklistRevokeSuccess,
    isNftGateSuccess,
    isRemoveNftGateSuccess,
    toast,
    refetchOwner,
  ])

  // Handle transfer error
  useEffect(() => {
    if (transferError) {
      toast({
        title: "Transfer Failed",
        description: "Failed to transfer ownership. Please try again.",
        variant: "destructive",
      })
      setIsTransferring(false)
    }
  }, [transferError, toast])

  // Admin functions
  const handleTransferJarOwnership = () => {
    if (!newJarOwner || !newJarOwner.startsWith("0x")) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address starting with 0x",
        variant: "destructive",
      })
      return
    }

    setIsTransferring(true)

    try {
      transferJarOwnership({
        address: address,
        args: [newJarOwner as `0x${string}`],
      })
    } catch (error) {
      console.error("Error transferring ownership:", error)
      setIsTransferring(false)
      toast({
        title: "Transfer Failed",
        description: "An error occurred while transferring ownership",
        variant: "destructive",
      })
    }
  }

  const handleEmergencyWithdraw = () => {
    if (!withdrawalAmount) return
    console.log("Emergency withdrawal amount:", withdrawalAmount)
    if (tokenAddress.length > 3) {
      emergencyWithdrawWithoutState({
        address: address,
        args: [tokenAddress as `0x${string}`, BigInt(withdrawalAmount || "0")],
      })
    } else {
      emergencyWithdrawCurrencyWithState({
        address: address,
        args: [
          parseEther(withdrawalAmount), // amount as second argument
        ],
      })
    }
  }

  const handleGrantJarBlacklistRole = () => {
    if (!addressToUpdate) return
    console.log(`"Adding addresses to blacklist:`, addressToUpdate)
    grantJarBlacklistRole({
      address: address,
      args: [[addressToUpdate as `0x${string}`]],
    })
  }

  const handleRevokeJarBlacklistRole = () => {
    if (!addressToUpdate) return
    console.log(`Removing address from blacklist:`, addressToUpdate)
    revokeJarBlacklistRole({
      address: address,
      args: [[addressToUpdate as `0x${string}`]],
    })
  }

  const handleGrantJarWhitelistRole = () => {
    if (!addressToUpdate) return
    console.log(`Adding address to whitelist:`, addressToUpdate)
    grantJarWhitelistRole({
      address: address,
      args: [[addressToUpdate as `0x${string}`]],
    })
  }

  const handleRevokeJarWhitelistRole = () => {
    if (!addressToUpdate) return
    console.log(`Removing address from whitelist:`, addressToUpdate)
    revokeJarWhitelistRole({
      address: address,
      args: [[addressToUpdate as `0x${string}`]],
    })
  }

  const handleAddNFTGate = () => {
    if (!nftAddress || !nftTokenId) return
    console.log("Adding NFT gate:", nftAddress, nftTokenId)
    addNftGate({
      address: address,
      args: [nftAddress as `0x${string}`, Number.parseInt(nftTokenId, 10)],
    })
  }

  const handleRemoveNFTGate = () => {
    if (!nftAddress) return
    console.log("Removing NFT gate:", nftAddress)
    removeNftGate({
      address: address,
      args: [nftAddress as `0x${string}`],
    })
  }

  // Format the current owner address for display
  const formattedCurrentOwner = currentOwner ? `${currentOwner.slice(0, 6)}...${currentOwner.slice(-4)}` : "Loading..."

  // Check if current user is the owner
  const isCurrentUserOwner =
    currentUserAddress && currentOwner && currentUserAddress.toLowerCase() === currentOwner.toLowerCase()

  return (
    <div className="space-y-6 bg-[#2b1d0e] p-4 rounded-lg">
      <Tabs defaultValue="ownership" className="w-full">
        <TabsList className="mb-6 bg-[#fff8f0] p-1">
          <TabsTrigger
            value="ownership"
            className="data-[state=active]:bg-white data-[state=active]:text-[#ff5e14] data-[state=active]:shadow-sm text-[#4a3520]"
          >
            <Shield className="h-4 w-4 mr-2" />
            Ownership
          </TabsTrigger>
          <TabsTrigger
            value="access"
            className="data-[state=active]:bg-white data-[state=active]:text-[#ff5e14] data-[state=active]:shadow-sm text-[#4a3520]"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Access Control
          </TabsTrigger>
          <TabsTrigger
            value="emergency"
            className="data-[state=active]:bg-white data-[state=active]:text-[#ff5e14] data-[state=active]:shadow-sm text-[#4a3520]"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Emergency
          </TabsTrigger>
          {/* <TabsTrigger
            value="nft"
            className="data-[state=active]:bg-white data-[state=active]:text-[#ff5e14] data-[state=active]:shadow-sm text-[#4a3520]"
          >
            <Tag className="h-4 w-4 mr-2" />
            NFT Gates
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="ownership" className="mt-0">
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-[#fff8f0] rounded-t-lg">
              <CardTitle className="text-xl text-[#3c2a14] flex items-center">
                <Shield className="h-5 w-5 mr-2 text-[#ff5e14]" />
                Transfer Jar Ownership
              </CardTitle>
              <CardDescription className="text-[#8b7355]">
                Transfer ownership of this jar to another address
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-[#fff8f0] p-4 rounded-lg mb-4">
                  <p className="text-[#3c2a14] font-medium">Current Owner: {formattedCurrentOwner}</p>
                  <p className="text-sm text-[#8b7355] mt-1">
                    {isCurrentUserOwner
                      ? "You are currently the owner of this jar"
                      : "You are not the current owner of this jar"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="newOwner" className="text-[#ff5e14] font-medium">
                    New Owner Address
                  </label>
                  <Input
                    id="newOwner"
                    placeholder="0x..."
                    value={newJarOwner}
                    onChange={(e) => setNewJarOwner(e.target.value)}
                    className="border-[#f0e6d8] bg-white text-[#3c2a14]"
                    disabled={isTransferring}
                  />
                  <p className="text-sm text-[#8b7355]">The new address will have full owner rights to this jar</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-[#fff8f0] p-4 rounded-b-lg flex justify-end">
              <Button
                onClick={handleTransferJarOwnership}
                className="bg-[#ff5e14] hover:bg-[#e54d00] text-white"
                disabled={!newJarOwner || !newJarOwner.startsWith("0x") || isTransferring}
              >
                {isTransferring ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  "Transfer Ownership"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="mt-0">
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-[#fff8f0] rounded-t-lg">
              <CardTitle className="text-xl text-[#3c2a14] flex items-center">
                <UserPlus className="h-5 w-5 mr-2 text-[#ff5e14]" />
                Whitelist & Blacklist Management
              </CardTitle>
              <CardDescription className="text-[#8b7355]">
                Control who can access and withdraw from this jar
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="addressToUpdate" className="text-[#ff5e14] font-medium">
                    Address to Update
                  </label>
                  <Input
                    id="addressToUpdate"
                    placeholder="0x..."
                    value={addressToUpdate}
                    onChange={(e) => setAddressToUpdate(e.target.value)}
                    className="border-[#f0e6d8] bg-white text-[#3c2a14]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-[#ff5e14]">Whitelist</h3>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={handleGrantJarWhitelistRole}
                        className="bg-[#e6f7e6] text-[#2e7d32] hover:bg-[#c8e6c9] hover:text-[#1b5e20] border border-[#c8e6c9]"
                        disabled={!addressToUpdate || !addressToUpdate.startsWith("0x")}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add to Whitelist
                      </Button>
                      <Button
                        onClick={handleRevokeJarWhitelistRole}
                        variant="outline"
                        className="text-[#2e7d32] hover:bg-[#e6f7e6] border-[#c8e6c9]"
                        disabled={!addressToUpdate || !addressToUpdate.startsWith("0x")}
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove from Whitelist
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-[#ff5e14]">Blacklist</h3>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={handleGrantJarBlacklistRole}
                        className="bg-[#ffebee] text-[#c62828] hover:bg-[#ffcdd2] hover:text-[#b71c1c] border border-[#ffcdd2]"
                        disabled={!addressToUpdate || !addressToUpdate.startsWith("0x")}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add to Blacklist
                      </Button>
                      <Button
                        onClick={handleRevokeJarBlacklistRole}
                        variant="outline"
                        className="text-[#c62828] hover:bg-[#ffebee] border-[#ffcdd2]"
                        disabled={!addressToUpdate || !addressToUpdate.startsWith("0x")}
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove from Blacklist
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="mt-0">
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-[#fff8f0] rounded-t-lg">
              <CardTitle className="text-xl text-[#3c2a14] flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-[#ff5e14]" />
                Emergency Withdrawal
              </CardTitle>
              <CardDescription className="text-[#8b7355]">Withdraw funds in case of emergency</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-[#fff0e0] border border-[#ffcc80] rounded-lg p-4 text-[#e65100] flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Warning: Emergency Use Only</p>
                    <p className="text-sm mt-1">
                      This function should only be used in emergency situations. It will withdraw all funds from the
                      jar.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <label htmlFor="withdrawalAmount" className="text-[#ff5e14] font-medium">
                      Amount to Withdraw
                    </label>
                    <Input
                      id="withdrawalAmount"
                      placeholder="Amount"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      className="border-[#f0e6d8] bg-white text-[#3c2a14]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="tokenAddress" className="text-[#ff5e14] font-medium">
                      Token Address (optional)
                    </label>
                    <Input
                      id="tokenAddress"
                      placeholder="0x... (leave empty for ETH)"
                      value={tokenAddress}
                      onChange={(e) => setTokenAddress(e.target.value)}
                      className="border-[#f0e6d8] bg-white text-[#3c2a14]"
                    />
                    <p className="text-sm text-[#8b7355]">Only fill this in if withdrawing a specific token</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-[#fff8f0] p-4 rounded-b-lg flex justify-end">
              <Button
                onClick={handleEmergencyWithdraw}
                variant="destructive"
                className="bg-[#d32f2f] hover:bg-[#b71c1c]"
                disabled={!withdrawalAmount}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergency Withdraw
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="nft" className="mt-0">
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-[#fff8f0] rounded-t-lg">
              <CardTitle className="text-xl text-[#3c2a14] flex items-center">
                <Tag className="h-5 w-5 mr-2 text-[#ff5e14]" />
                NFT Gate Management
              </CardTitle>
              <CardDescription className="text-[#8b7355]">
                Control access to the jar using NFT ownership
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="nftAddress" className="text-[#ff5e14] font-medium">
                      NFT Contract Address
                    </label>
                    <Input
                      id="nftAddress"
                      placeholder="0x..."
                      value={nftAddress}
                      onChange={(e) => setNftAddress(e.target.value)}
                      className="border-[#f0e6d8] bg-white text-[#3c2a14]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="nftType" className="text-[#ff5e14] font-medium">
                      NFT Type & Token ID
                    </label>
                    <div className="flex gap-2">
                      <Select onValueChange={setNftTokenId}>
                        <SelectTrigger className="border-[#f0e6d8] bg-white text-[#3c2a14]">
                          <SelectValue placeholder="Select NFT Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(NFTType)
                            .filter(([key]) => isNaN(Number(key)))
                            .map(([key, value]) => (
                              <SelectItem key={value} value={String(value)}>
                                {key}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-[#fff8f0] p-4 rounded-b-lg flex justify-between">
              <Button
                onClick={handleRemoveNFTGate}
                variant="outline"
                className="border-[#f0e6d8] text-[#8b7355] hover:bg-[#fff0e0] hover:text-[#ff5e14]"
                disabled={!nftAddress || !nftAddress.startsWith("0x")}
              >
                Remove NFT Gate
              </Button>

              <Button
                onClick={handleAddNFTGate}
                className="bg-[#ff5e14] hover:bg-[#e54d00] text-white"
                disabled={!nftAddress || !nftAddress.startsWith("0x") || !nftTokenId}
              >
                Add NFT Gate
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
