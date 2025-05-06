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
import { LoadingOverlay } from "@/components/design/loading-overlay"
import { ethers } from "ethers"
import { z } from "zod"
import { isAddress } from "viem"
import { ErrorDialog } from "@/components/ui/error-dialog"

// Replace the isValidEthAddress function (if it exists) or add it near the top of the component
const ethereumAddressSchema = z
  .string()
  .refine((address) => isAddress(address), { message: "Invalid Ethereum address format" })

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

  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Processing...")
  const [jarBalance, setJarBalance] = useState<string>("0")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

  // Show success toasts and handle loading state
  useEffect(() => {
    if (isTransferSuccess) {
      toast({
        title: "Ownership Transferred",
        description: "The jar ownership has been successfully transferred.",
      })
      setIsTransferring(false)
      setIsLoading(false)
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
      setIsLoading(false)
    }
    if (isWhitelistGrantSuccess) {
      toast({
        title: "Whitelist Updated",
        description: "Address has been added to the whitelist.",
      })
      setIsLoading(false)
    }
    if (isWhitelistRevokeSuccess) {
      toast({
        title: "Whitelist Updated",
        description: "Address has been removed from the whitelist.",
      })
      setIsLoading(false)
    }
    if (isBlacklistGrantSuccess) {
      toast({
        title: "Blacklist Updated",
        description: "Address has been added to the blacklist.",
      })
      setIsLoading(false)
    }
    if (isBlacklistRevokeSuccess) {
      toast({
        title: "Blacklist Updated",
        description: "Address has been removed from the blacklist.",
      })
      setIsLoading(false)
    }
    if (isNftGateSuccess) {
      toast({
        title: "NFT Gate Added",
        description: "New NFT gate has been added successfully.",
      })
      setIsLoading(false)
    }
    if (isRemoveNftGateSuccess) {
      toast({
        title: "NFT Gate Removed",
        description: "NFT gate has been removed successfully.",
      })
      setIsLoading(false)
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
      setIsLoading(false)
    }
  }, [transferError, toast])

  const handlePercentageClick = async (percent: number) => {
    try {
      // Get the jar's balance
      let balance = "0"

      if (tokenAddress && tokenAddress.length > 3) {
        // For ERC20 tokens
        const provider = window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null
        if (provider) {
          const erc20Contract = new ethers.Contract(
            tokenAddress as `0x${string}`,
            ["function balanceOf(address) view returns (uint256)"],
            provider,
          )
          const tokenBalance = await erc20Contract.balanceOf(address)
          balance = tokenBalance.toString()
        }
      } else {
        // For ETH
        const provider = window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null
        if (provider) {
          const ethBalance = await provider.getBalance(address)
          balance = ethBalance.toString()
        }
      }

      // Calculate the percentage
      const balanceBigInt = BigInt(balance)
      const percentAmount = (balanceBigInt * BigInt(Math.floor(percent * 100))) / BigInt(100)

      // Convert to ETH for display
      const formattedAmount = ethers.formatEther(percentAmount)
      setWithdrawalAmount(formattedAmount)
      setJarBalance(balance)
    } catch (error) {
      console.error("Error getting balance:", error)
    }
  }

  // Admin functions
  const handleTransferJarOwnership = async () => {
    if (!newJarOwner || !newJarOwner.startsWith("0x")) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address starting with 0x",
        variant: "destructive",
      })
      return
    }

    setIsTransferring(true)
    setIsLoading(true)
    setLoadingMessage("Transferring ownership...")

    try {
      // Validate the address format
      ethereumAddressSchema.parse(newJarOwner)

      await transferJarOwnership({
        address: address,
        args: [newJarOwner as `0x${string}`],
      })
    } catch (error: unknown) {
      console.error("Error transferring ownership:", error)
      setIsTransferring(false)
      setIsLoading(false)

      if (error instanceof z.ZodError) {
        setErrorMessage("Invalid Ethereum address format")
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string" &&
        error.message.includes("rejected")
      ) {
        setErrorMessage("Transaction rejected by user")
      } else {
        setErrorMessage("An error occurred while transferring ownership")
      }
    }
  }

  const handleEmergencyWithdraw = async () => {
    if (!withdrawalAmount) return
    console.log("Emergency withdrawal amount:", withdrawalAmount)

    setIsLoading(true)
    setLoadingMessage("Processing emergency withdrawal...")

    try {
      if (tokenAddress.length > 3) {
        await emergencyWithdrawWithoutState({
          address: address,
          args: [tokenAddress as `0x${string}`, BigInt(withdrawalAmount || "0")],
        })
      } else {
        await emergencyWithdrawCurrencyWithState({
          address: address,
          args: [
            parseEther(withdrawalAmount), // amount as second argument
          ],
        })
      }
    } catch (error: unknown) {
      console.error("Emergency withdrawal error:", error)
      setIsLoading(false)

      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string" &&
        error.message.includes("rejected")
      ) {
        setErrorMessage("Transaction rejected by user")
      } else {
        setErrorMessage("An error occurred during emergency withdrawal")
      }
    }
  }

  // Update the handleRevokeJarBlacklistRole function
  const handleRevokeJarBlacklistRole = async () => {
    if (!addressToUpdate) return

    // Validate the address format
    try {
      ethereumAddressSchema.parse(addressToUpdate)
      console.log(`Removing address from blacklist:`, addressToUpdate)

      setIsLoading(true)
      setLoadingMessage("Removing address from blacklist...")

      try {
        await revokeJarBlacklistRole({
          address: address,
          args: [[addressToUpdate as `0x${string}`]],
        })
      } catch (error: unknown) {
        console.error("Blacklist error:", error)
        setIsLoading(false)
        if (
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string" &&
          error.message.includes("rejected")
        ) {
          setErrorMessage("Transaction rejected by user")
        } else {
          setErrorMessage("An error occurred while revoking blacklist role")
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ ...errors, addressToUpdate: "Invalid Ethereum address format" })
        setErrorMessage("Invalid Ethereum address format")
      }
      console.error("Address validation error:", error)
    }
  }

  // Similarly update the handleGrantJarBlacklistRole function
  const handleGrantJarBlacklistRole = async () => {
    if (!addressToUpdate) return

    // Validate the address format
    try {
      ethereumAddressSchema.parse(addressToUpdate)
      console.log(`Adding address to blacklist:`, addressToUpdate)

      setIsLoading(true)
      setLoadingMessage("Adding address to blacklist...")

      try {
        await grantJarBlacklistRole({
          address: address,
          args: [[addressToUpdate as `0x${string}`]],
        })
      } catch (error: unknown) {
        console.error("Blacklist error:", error)
        setIsLoading(false)
        if (
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string" &&
          error.message.includes("rejected")
        ) {
          setErrorMessage("Transaction rejected by user")
        } else {
          setErrorMessage("An error occurred while granting blacklist role")
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ ...errors, addressToUpdate: "Invalid Ethereum address format" })
        setErrorMessage("Invalid Ethereum address format")
      }
      console.error("Address validation error:", error)
    }
  }

  // Update the handleGrantJarWhitelistRole function
  const handleGrantJarWhitelistRole = async () => {
    if (!addressToUpdate) return

    // Validate the address format
    try {
      ethereumAddressSchema.parse(addressToUpdate)
      console.log(`Adding address to whitelist:`, addressToUpdate)

      setIsLoading(true)
      setLoadingMessage("Adding address to whitelist...")

      try {
        await grantJarWhitelistRole({
          address: address,
          args: [[addressToUpdate as `0x${string}`]],
        })
      } catch (error: unknown) {
        console.error("Whitelist error:", error)
        setIsLoading(false)
        if (
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string" &&
          error.message.includes("rejected")
        ) {
          setErrorMessage("Transaction rejected by user")
        } else {
          setErrorMessage("An error occurred while granting whitelist role")
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ ...errors, addressToUpdate: "Invalid Ethereum address format" })
        setErrorMessage("Invalid Ethereum address format")
      }
      console.error("Address validation error:", error)
    }
  }

  // Update the handleRevokeJarWhitelistRole function
  const handleRevokeJarWhitelistRole = async () => {
    if (!addressToUpdate) return

    // Validate the address format
    try {
      ethereumAddressSchema.parse(addressToUpdate)
      console.log(`Removing address from whitelist:`, addressToUpdate)

      setIsLoading(true)
      setLoadingMessage("Removing address from whitelist...")

      try {
        await revokeJarWhitelistRole({
          address: address,
          args: [[addressToUpdate as `0x${string}`]],
        })
      } catch (error: unknown) {
        console.error("Whitelist error:", error)
        setIsLoading(false)
        if (
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string" &&
          error.message.includes("rejected")
        ) {
          setErrorMessage("Transaction rejected by user")
        } else {
          setErrorMessage("An error occurred while revoking whitelist role")
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ ...errors, addressToUpdate: "Invalid Ethereum address format" })
        setErrorMessage("Invalid Ethereum address format")
      }
      console.error("Address validation error:", error)
    }
  }

  // Update the addNFTGate function
  const handleAddNFTGate = async () => {
    if (!nftAddress || !nftTokenId) return

    // Validate the NFT address format
    try {
      ethereumAddressSchema.parse(nftAddress)
      console.log("Adding NFT gate:", nftAddress, nftTokenId)

      setIsLoading(true)
      setLoadingMessage("Adding NFT gate...")

      try {
        await addNftGate({
          address: address,
          args: [nftAddress as `0x${string}`, Number.parseInt(nftTokenId, 10)],
        })
      } catch (error: unknown) {
        console.error("NFT gate error:", error)
        setIsLoading(false)
        if (
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string" &&
          error.message.includes("rejected")
        ) {
          setErrorMessage("Transaction rejected by user")
        } else {
          setErrorMessage("An error occurred while adding NFT gate")
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ ...errors, nftAddress: "Invalid Ethereum address format" })
        setErrorMessage("Invalid Ethereum address format")
      }
      console.error("Address validation error:", error)
    }
  }

  // Update the removeNFTGate function
  const handleRemoveNFTGate = async () => {
    if (!nftAddress) return

    // Validate the NFT address format
    try {
      ethereumAddressSchema.parse(nftAddress)
      console.log("Removing NFT gate:", nftAddress)

      setIsLoading(true)
      setLoadingMessage("Removing NFT gate...")

      try {
        await removeNftGate({
          address: address,
          args: [nftAddress as `0x${string}`],
        })
      } catch (error: unknown) {
        console.error("NFT gate error:", error)
        setIsLoading(false)
        if (
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string" &&
          error.message.includes("rejected")
        ) {
          setErrorMessage("Transaction rejected by user")
        } else {
          setErrorMessage("An error occurred while removing NFT gate")
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ ...errors, nftAddress: "Invalid Ethereum address format" })
        setErrorMessage("Invalid Ethereum address format")
      }
      console.error("Address validation error:", error)
    }
  }

  // Format the current owner address for display
  const formattedCurrentOwner = currentOwner ? `${currentOwner.slice(0, 6)}...${currentOwner.slice(-4)}` : "Loading..."

  // Check if current user is the owner
  const isCurrentUserOwner =
    currentUserAddress && currentOwner && currentUserAddress.toLowerCase() === currentOwner.toLowerCase()

  return (
    <div className="space-y-4 md:space-y-6 bg-[#2a2a2a] p-3 md:p-4 rounded-lg">
      <Tabs defaultValue="ownership" className="w-full">
        <TabsList className="mb-4 md:mb-6 bg-[#333333] p-1 overflow-x-auto hide-scrollbar">
          <TabsTrigger
            value="ownership"
            className="data-[state=active]:bg-[#c0ff00] data-[state=active]:text-black data-[state=active]:shadow-sm text-white text-xs md:text-sm whitespace-nowrap px-2 md:px-3"
          >
            <Shield className="h-4 w-4 mr-1 md:mr-2" />
            <span className="truncate">Ownership</span>
          </TabsTrigger>
          <TabsTrigger
            value="access"
            className="data-[state=active]:bg-[#c0ff00] data-[state=active]:text-black data-[state=active]:shadow-sm text-white text-xs md:text-sm whitespace-nowrap px-2 md:px-3"
          >
            <UserPlus className="h-4 w-4 mr-1 md:mr-2" />
            <span className="truncate">Access</span>
          </TabsTrigger>
          <TabsTrigger
            value="emergency"
            className="data-[state=active]:bg-[#c0ff00] data-[state=active]:text-black data-[state=active]:shadow-sm text-white text-xs md:text-sm whitespace-nowrap px-2 md:px-3"
          >
            <AlertTriangle className="h-4 w-4 mr-1 md:mr-2" />
            <span className="truncate">Emergency</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ownership" className="mt-0">
          <Card className="border-[#333333] bg-[#2a2a2a] shadow-md">
            <CardHeader className="bg-[#333333] rounded-t-lg">
              <CardTitle className="text-xl text-white flex items-center">
                <Shield className="h-5 w-5 mr-2 text-[#c0ff00]" />
                Transfer Jar Ownership
              </CardTitle>
              <CardDescription className="text-gray-400">
                Transfer ownership of this jar to another address
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 bg-[#2a2a2a]">
              <div className="space-y-4">
                <div className="bg-[#333333] p-4 rounded-lg mb-4">
                  <p className="text-white font-medium">Current Owner: {formattedCurrentOwner}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {isCurrentUserOwner
                      ? "You are currently the owner of this jar"
                      : "You are not the current owner of this jar"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="newOwner" className="text-[#c0ff00] font-medium">
                    New Owner Address
                  </label>
                  <Input
                    id="newOwner"
                    placeholder="0x..."
                    value={newJarOwner}
                    onChange={(e) => setNewJarOwner(e.target.value)}
                    className="border-[#444444] bg-[#333333] text-white"
                    disabled={isTransferring}
                  />
                  <p className="text-sm text-gray-400">The new address will have full owner rights to this jar</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-[#333333] p-3 md:p-4 rounded-b-lg flex justify-end">
              <Button
                onClick={handleTransferJarOwnership}
                className="bg-[#c0ff00] hover:bg-[#d4ff33] text-black text-xs md:text-sm px-2 md:px-4"
                disabled={!newJarOwner || !newJarOwner.startsWith("0x") || isTransferring}
              >
                {isTransferring ? (
                  <>
                    <Loader2 className="mr-1 md:mr-2 h-4 w-4 animate-spin" />
                    <span className="truncate">Transferring...</span>
                  </>
                ) : (
                  <span className="truncate">Transfer</span>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="mt-0">
          <Card className="border-[#333333] bg-[#2a2a2a] shadow-md">
            <CardHeader className="bg-[#333333] rounded-t-lg">
              <CardTitle className="text-xl text-white flex items-center">
                <UserPlus className="h-5 w-5 mr-2 text-[#c0ff00]" />
                Whitelist & Blacklist Management
              </CardTitle>
              <CardDescription className="text-gray-400">
                Control who can access and withdraw from this jar
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 bg-[#2a2a2a]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="addressToUpdate" className="text-[#c0ff00] font-medium">
                    Address to Update
                  </label>
                  <Input
                    id="addressToUpdate"
                    placeholder="0x..."
                    value={addressToUpdate}
                    onChange={(e) => setAddressToUpdate(e.target.value)}
                    className="border-[#444444] bg-[#333333] text-white"
                  />
                  {errors.addressToUpdate && <p className="text-red-500 text-sm">{errors.addressToUpdate}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-[#c0ff00]">Whitelist</h3>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={handleGrantJarWhitelistRole}
                        className="bg-[#2a2a2a] text-[#c0ff00] hover:bg-[#333333] hover:text-[#c0ff00] border border-[#c0ff00] text-xs md:text-sm"
                        disabled={!addressToUpdate}
                      >
                        <UserPlus className="h-4 w-4 mr-1 md:mr-2" />
                        <span className="truncate">Add</span>
                      </Button>
                      <Button
                        onClick={handleRevokeJarWhitelistRole}
                        variant="outline"
                        className="text-[#c0ff00] hover:bg-[#333333] border-[#c0ff00] text-xs md:text-sm"
                        disabled={!addressToUpdate}
                      >
                        <UserMinus className="h-4 w-4 mr-1 md:mr-2" />
                        <span className="truncate">Remove</span>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-[#c0ff00]">Blacklist</h3>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={handleGrantJarBlacklistRole}
                        className="bg-[#2a2a2a] text-red-500 hover:bg-[#333333] hover:text-red-500 border border-red-500 text-xs md:text-sm"
                        disabled={!addressToUpdate}
                      >
                        <UserPlus className="h-4 w-4 mr-1 md:mr-2" />
                        <span className="truncate">Add</span>
                      </Button>
                      <Button
                        onClick={handleRevokeJarBlacklistRole}
                        variant="outline"
                        className="text-red-500 hover:bg-[#333333] border-red-500 text-xs md:text-sm"
                        disabled={!addressToUpdate}
                      >
                        <UserMinus className="h-4 w-4 mr-1 md:mr-2" />
                        <span className="truncate">Remove</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="mt-0">
          <Card className="border-[#333333] bg-[#2a2a2a] shadow-md">
            <CardHeader className="bg-[#333333] rounded-t-lg">
              <CardTitle className="text-xl text-white flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-[#c0ff00]" />
                Emergency Withdrawal
              </CardTitle>
              <CardDescription className="text-gray-400">Withdraw funds in case of emergency</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 bg-[#2a2a2a]">
              <div className="space-y-4">
                <div className="bg-[#444444] border border-yellow-700 rounded-lg p-4 text-yellow-200 flex items-start">
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
                    <label htmlFor="withdrawalAmount" className="text-[#c0ff00] font-medium">
                      Amount to Withdraw
                    </label>
                    <Input
                      id="withdrawalAmount"
                      placeholder="Amount"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      className="border-[#444444] bg-[#333333] text-white"
                    />

                    {/* Add percentage buttons */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePercentageClick(0.25)}
                        className="flex-1 border-[#c0ff00] text-[#c0ff00] hover:bg-[#333333] hover:text-[#c0ff00] bg-[#2a2a2a] text-xs"
                      >
                        25%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePercentageClick(0.5)}
                        className="flex-1 border-[#c0ff00] text-[#c0ff00] hover:bg-[#333333] hover:text-[#c0ff00] bg-[#2a2a2a] text-xs"
                      >
                        50%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePercentageClick(0.75)}
                        className="flex-1 border-[#c0ff00] text-[#c0ff00] hover:bg-[#333333] hover:text-[#c0ff00] bg-[#2a2a2a] text-xs"
                      >
                        75%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePercentageClick(1.0)}
                        className="flex-1 border-[#c0ff00] text-[#c0ff00] hover:bg-[#333333] hover:text-[#c0ff00] bg-[#2a2a2a] text-xs"
                      >
                        Max
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="tokenAddress" className="text-[#c0ff00] font-medium">
                      Token Address (optional)
                    </label>
                    <Input
                      id="tokenAddress"
                      placeholder="0x... (leave empty for ETH)"
                      value={tokenAddress}
                      onChange={(e) => setTokenAddress(e.target.value)}
                      className="border-[#444444] bg-[#333333] text-white"
                    />
                    <p className="text-sm text-gray-400">Only fill this in if withdrawing a specific token</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-[#333333] p-3 md:p-4 rounded-b-lg flex justify-end">
              <Button
                onClick={handleEmergencyWithdraw}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-xs md:text-sm px-2 md:px-4"
                disabled={!withdrawalAmount}
              >
                <AlertTriangle className="h-4 w-4 mr-1 md:mr-2" />
                <span className="truncate">Withdraw</span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="nft" className="mt-0">
          <Card className="border-border shadow-sm">
            <CardHeader className="bg-background-light rounded-t-lg">
              <CardTitle className="text-xl text-text-primary flex items-center">
                <Tag className="h-5 w-5 mr-2 text-primary" />
                NFT Gate Management
              </CardTitle>
              <CardDescription className="text-text-secondary">
                Control access to the jar using NFT ownership
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 bg-background-paper">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="nftAddress" className="text-primary font-medium">
                      NFT Contract Address
                    </label>
                    <Input
                      id="nftAddress"
                      placeholder="0x..."
                      value={nftAddress}
                      onChange={(e) => setNftAddress(e.target.value)}
                      className="border-border bg-background-paper text-text-primary"
                    />
                    {errors.nftAddress && <p className="text-red-500 text-sm">{errors.nftAddress}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="nftType" className="text-primary font-medium">
                      NFT Type & Token ID
                    </label>
                    <div className="flex gap-2">
                      <Select onValueChange={setNftTokenId}>
                        <SelectTrigger className="border-border bg-background-paper text-text-primary">
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
            <CardFooter className="bg-background-light p-4 rounded-b-lg flex justify-between">
              <Button
                onClick={handleRemoveNFTGate}
                variant="outline"
                className="border-border text-text-secondary hover:bg-background-light hover:text-primary text-xs md:text-sm"
                disabled={!nftAddress}
              >
                <span className="truncate">Remove</span>
              </Button>

              <Button
                onClick={handleAddNFTGate}
                className="bg-primary hover:bg-primary-dark text-black text-xs md:text-sm"
                disabled={!nftAddress || !nftTokenId}
              >
                <span className="truncate">Add</span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Loading Overlay */}
      <LoadingOverlay isOpen={isLoading} message={loadingMessage} onClose={() => setIsLoading(false)} />
      {errorMessage && (
        <ErrorDialog open={!!errorMessage} onOpenChange={() => setErrorMessage(null)} message={errorMessage} />
      )}
    </div>
  )
}
