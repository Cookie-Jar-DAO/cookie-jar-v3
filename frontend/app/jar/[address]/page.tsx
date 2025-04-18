"use client"
import { useParams, useRouter } from "next/navigation"
import { useMemo } from "react"

import { useCookieJarConfig } from "@/hooks/use-cookie-jar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, Users, Coins, Copy, ExternalLink } from "lucide-react"
import { useSendTransaction, useAccount, useChainId, useContractReads } from "wagmi"
import { parseEther, formatUnits, parseUnits } from "viem"
import type { ReadContractErrorType } from "viem"
import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWriteCookieJarDepositEth, useWriteCookieJarDepositCurrency, useWriteErc20Approve } from "@/generated"
import { AdminFunctions } from "@/components/admin/AdminFunctions"
import { formatAddress } from "@/lib/utils/format"
import DefaultFeeCollector from "@/components/FeeCollector/DefaultFeeCollector"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/design/use-toast"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { WhitelistWithdrawalSection } from "@/components/users/WhitelistWithdrawalSection"
import { NFTGatedWithdrawalSection } from "@/components/users/NFTGatedWithdrawalSection"
import { Clock, ArrowUpToLine } from "lucide-react"
// Import the BackButton component
import { BackButton } from "@/components/design/back-button"
import { useWriteCookieJarWithdrawWhitelistMode, useWriteCookieJarWithdrawNftMode } from "@/generated"
import { CountdownTimer } from "@/components/users/CountdownTimer"
import { WithdrawalHistorySection, type Withdrawal } from "@/components/users/WithdrawlHistorySection"

// Import token utilities
import { ETH_ADDRESS, useTokenInfo, parseTokenAmount, formatTokenAmount } from "@/lib/utils/token-utils"

export default function CookieJarConfigDetails() {
  const params = useParams()
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const address = params.address as string
  const { data: hash, sendTransaction } = useSendTransaction()
  const { address: userAddress } = useAccount()
  const [tokenAddress, setTokenAddress] = useState("")
  const { toast } = useToast()
  const pageRef = useRef<HTMLDivElement>(null)
  const [withdrawAmount, setWithdrawAmount] = useState<string>("")
  const [withdrawPurpose, setWithdrawPurpose] = useState<string>("")
  const [gateAddress, setGateAddress] = useState<string>("")
  const [tokenId, setTokenId] = useState<string>("")
  const chainId = useChainId()

  const addressString = address as `0x${string}`
  const isValidAddress = typeof address === "string" && address.startsWith("0x")

  const { config, isLoading, hasError, errors } = useCookieJarConfig(
    isValidAddress ? (address as `0x${string}`) : "0x0000000000000000000000000000000000000000",
  )

  const isAdmin = userAddress && config?.admin && userAddress.toLowerCase() === config.admin.toLowerCase()
  const showUserFunctions = config?.whitelist === true && config?.accessType === "Whitelist"
  const showNFTGatedFunctions = config?.accessType === "NFTGated"
  const isFeeCollector =
    userAddress && config?.feeCollector && userAddress.toLowerCase() === config.feeCollector.toLowerCase()

  const { writeContract: DepositEth } = useWriteCookieJarDepositEth()
  const { writeContract: DepositCurrency } = useWriteCookieJarDepositCurrency()
  const {
    writeContract: Approve,
    isPending: isApprovalPending,
    isSuccess: isApprovalSuccess,
    isError: isApprovalError,
  } = useWriteErc20Approve()

  const [approvalCompleted, setApprovalCompleted] = useState(false)
  const [pendingDepositAmount, setPendingDepositAmount] = useState<bigint>(BigInt(0))

  const {
    writeContract: withdrawWhitelistMode,
    data: withdrawWhitelistModeData,
    error: withdrawWhitelistModeError,
    isSuccess: isWithdrawWhitelistSuccess,
    isPending: isWithdrawWhitelistPending,
  } = useWriteCookieJarWithdrawWhitelistMode()

  const {
    writeContract: withdrawNFTMode,
    data: withdrawNFTModeData,
    error: withdrawNFTModeError,
    isSuccess: isWithdrawNFTSuccess,
    isPending: isWithdrawNFTPending,
  } = useWriteCookieJarWithdrawNftMode()

  // Check if user is in cooldown period
  const isInCooldown = useMemo(() => {
    if (!config.lastWithdrawalWhitelist || !config.withdrawalInterval) return false

    const now = Math.floor(Date.now() / 1000)
    const nextWithdrawalTime = Number(config.lastWithdrawalWhitelist) + Number(config.withdrawalInterval)
    return nextWithdrawalTime > now
  }, [config.lastWithdrawalWhitelist, config.withdrawalInterval])

  // Update the network name in the jar address page as well
  const getNetworkInfo = () => {
    if (!chainId) return { name: "Disconnected", color: "bg-gray-500" }

    switch (chainId) {
      case 84532: // Base Sepolia
        return { name: "Base Sepolia", color: "bg-[#ff5e14]" }
      case 8453: // Base Mainnet
        return { name: "Base", color: "bg-blue-500" }
      case 10: // Optimism
        return { name: "Optimism", color: "bg-red-500" }
      case 100: // Gnosis
        return { name: "Gnosis", color: "bg-green-500" }
      case 42161: // Arbitrum
        return { name: "Arbitrum", color: "bg-blue-700" }
      default:
        return { name: "Unknown", color: "bg-gray-500" }
    }
  }

  // Prevent unnecessary re-renders when switching tabs
  useEffect(() => {
    // This flag helps us track if we're switching tabs
    let isTabActive = true

    const handleVisibilityChange = () => {
      // When the tab becomes visible again, we don't want to trigger a refresh
      if (document.visibilityState === "visible" && !isTabActive) {
        isTabActive = true
        // Prevent any refresh actions here
      } else if (document.visibilityState === "hidden") {
        isTabActive = false
      }
    }

    // Add the event listener
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Clean up
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  // Use token utilities hook to get token information
  const isERC20 = config?.currency && config.currency !== ETH_ADDRESS
  const { symbol: tokenSymbol, decimals: tokenDecimals } = useTokenInfo(
    isERC20 ? (config?.currency as `0x${string}`) : undefined
  )

  useEffect(() => {
    if (isApprovalSuccess && approvalCompleted) {
      console.log("Approval completed, proceeding with deposit")
      DepositCurrency({
        address: addressString as `0x${string}`,
        args: [pendingDepositAmount],
      })
      setApprovalCompleted(false)
      setPendingDepositAmount(BigInt(0))
    }
  }, [isApprovalSuccess, approvalCompleted, DepositCurrency, addressString, pendingDepositAmount])

  const onSubmit = (value: string) => {
    // Parse amount considering the token decimals
    const amountBigInt = parseTokenAmount(value || "0", tokenDecimals)

    if (config.currency === ETH_ADDRESS) {
      DepositEth({
        address: addressString as `0x${string}`,
        value: amountBigInt,
      })
    } else {
      setApprovalCompleted(true)
      setPendingDepositAmount(amountBigInt)
      try {
        console.log("Calling approve with", config.currency)

        Approve({
          address: config.currency as `0x${string}`,
          args: [addressString as `0x${string}`, amountBigInt],
        })
      } catch (error) {
        console.error("Approve error:", error)
      }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Address copied",
      description: "The address has been copied to your clipboard",
    })
  }

  const handleWithdrawWhitelist = () => {
    if (!config.contractAddress || !config.fixedAmount) return

    withdrawWhitelistMode({
      address: config.contractAddress,
      args: [config.fixedAmount, withdrawPurpose],
    })
  }

  const handleWithdrawWhitelistVariable = () => {
    if (!config.contractAddress || !withdrawAmount) return

    // Parse amount considering the token decimals
    const parsedAmount = config.currency === ETH_ADDRESS
      ? parseEther(withdrawAmount)
      : parseTokenAmount(withdrawAmount, tokenDecimals)

    withdrawWhitelistMode({
      address: config.contractAddress,
      args: [parsedAmount, withdrawPurpose],
    })
  }

  const handleWithdrawNFT = () => {
    if (!config.contractAddress || !config.fixedAmount || !gateAddress) return

    withdrawNFTMode({
      address: config.contractAddress,
      args: [config.fixedAmount, withdrawPurpose, gateAddress as `0x${string}`, BigInt(tokenId || "0")],
    })
  }

  const handleWithdrawNFTVariable = () => {
    if (!config.contractAddress || !withdrawAmount || !gateAddress) return

    // Parse amount considering the token decimals
    const parsedAmount = config.currency === ETH_ADDRESS
      ? parseEther(withdrawAmount)
      : parseTokenAmount(withdrawAmount, tokenDecimals)

    withdrawNFTMode({
      address: config.contractAddress,
      args: [parsedAmount, withdrawPurpose, gateAddress as `0x${string}`, BigInt(tokenId || "0")],
    })
  }

  // Add success and error handling effects
  useEffect(() => {
    if (isWithdrawWhitelistSuccess || isWithdrawNFTSuccess) {
      toast({
        title: "Withdrawal Successful",
        description: "Your withdrawal has been processed successfully.",
      })
      // Reset form fields
      setWithdrawAmount("")
      setWithdrawPurpose("")
      setGateAddress("")
      setTokenId("")
    }
  }, [isWithdrawWhitelistSuccess, isWithdrawNFTSuccess, toast])

  useEffect(() => {
    if (withdrawWhitelistModeError || withdrawNFTModeError) {
      toast({
        title: "Withdrawal Failed",
        description:
          (withdrawWhitelistModeError || withdrawNFTModeError)?.message || "An error occurred during withdrawal",
        variant: "destructive",
      })
    }
  }, [withdrawWhitelistModeError, withdrawNFTModeError, toast])

  if (!isValidAddress) {
    return (
      <div className="container max-w-3xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-700 mb-4">Invalid Address</h2>
        <p className="text-red-600">No valid address was provided. Please check the URL and try again.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff5e14]"></div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="container max-w-3xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-700 mb-4">Error Loading Configuration</h2>
        <ul className="list-disc pl-5 text-red-600">
          {errors
            .filter((error): error is ReadContractErrorType => error !== null)
            .map((error, index) => (
              <li key={index}>{error.message || "Unknown error"}</li>
            ))}
        </ul>
      </div>
    )
  }

  // Format balance for display using the token decimals
  const formattedBalance = () => {
    if (!config.balance) return "0"
    
    return formatTokenAmount(config.balance, tokenDecimals, tokenSymbol || "ETH")
  }

  return (
    <div className="container max-w-full px-4 md:px-8 py-8 bg-[#2b1d0e]" ref={pageRef}>
      {/* Back button navigation */}
      <div className="mb-6 relative">
        <BackButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-20 gap-6">
        {/* Left sidebar with jar details */}
        <div className="lg:col-span-11">
          <div>
            <Card className="shadow-lg bg-white border-none overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Jar Title and Description */}
                  <div>
                    <h1 className="text-3xl font-bold text-[#1a1a1a]">{config.metadata ?? "Cookie Jar"}</h1>
                    <p className="text-[#4a3520] mt-1">{"Shared Token Pool"}</p>
                  </div>

                  <Separator className="my-2" />

                  {/* Jar Details - Key Value Pairs */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[#4a3520] font-medium">Contract Address</span>
                      <div className="flex items-center">
                        <span className="text-[#1a1a1a] font-medium mr-2">{formatAddress(addressString)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(addressString)}
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
                            href={`https://sepolia-explorer.base.org/address/${addressString}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center py-2">
                      <span className="text-[#4a3520] font-medium">Access Type</span>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-[#ff5e14] mr-2" />
                        <span className="text-[#1a1a1a] font-medium">{config.accessType}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center py-2">
                      <span className="text-[#4a3520] font-medium">Cooldown Period</span>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-[#ff5e14] mr-2" />
                        <span className="text-[#1a1a1a] font-medium">
                          {config.withdrawalInterval
                            ? (() => {
                                // Import these at the top of the file (around line 15-20)
                                const { formatTimeComponents, formatTimeString } = require("@/lib/utils/time-utils")
                                const seconds = Number(config.withdrawalInterval)
                                const { days, hours, minutes, seconds: secs } = formatTimeComponents(seconds)
                                return formatTimeString(days, hours, minutes, secs)
                              })()
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center py-2">
                      <span className="text-[#4a3520] font-medium">Max Withdrawal</span>
                      <div className="flex items-center">
                        <ArrowUpToLine className="h-4 w-4 text-[#ff5e14] mr-2" />
                        <span className="text-[#1a1a1a] font-medium">
                          {config.maxWithdrawal
                            ? config.currency === "0x0000000000000000000000000000000000000003"
                              ? Number(formatUnits(config.maxWithdrawal, 18)).toFixed(4) + " ETH"
                              : Number(formatUnits(config.maxWithdrawal, tokenDecimals)).toFixed(4) + " " + tokenSymbol
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center py-2">
                      <span className="text-[#4a3520] font-medium">Current Balance</span>
                      <span className="text-[#ff5e14] font-bold text-xl">{formattedBalance()}</span>
                    </div>

                    <Separator />

                    {/* Add Whitelist Status indicator */}
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[#4a3520] font-medium">Your Status</span>
                      <div className="flex items-center">
                        {config.blacklist ? (
                          <span className="font-medium px-3 py-1 rounded-full text-white bg-red-500">Blacklisted</span>
                        ) : (
                          <span
                            className={`font-medium px-3 py-1 rounded-full text-white ${config.whitelist ? "bg-green-500" : "bg-red-500"}`}
                          >
                            {config.whitelist ? "Whitelisted" : "Not Whitelisted"}
                          </span>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Feature boxes */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="bg-[#f8f8f8] p-2 rounded-lg text-center">
                        <p className="text-[#4a3520] text-sm mb-1">Purpose Required</p>
                        <p className="font-semibold text-[#1a1a1a]">{config.strictPurpose ? "Yes" : "No"}</p>
                      </div>

                      <div className="bg-[#f8f8f8] p-2 rounded-lg text-center">
                        <p className="text-[#4a3520] text-sm mb-1">Fixed Amount</p>
                        <p className="font-semibold text-[#1a1a1a]">
                          {config.withdrawalOption === "Fixed" ? "Yes" : "No"}
                          {config.withdrawalOption === "Fixed" && config.fixedAmount && (
                            <span className="block text-xs text-[#ff5e14]">
                              {config.currency === "0x0000000000000000000000000000000000000003"
                                ? Number(formatUnits(config.fixedAmount || BigInt(0), 18)).toFixed(4) + " ETH"
                                : Number(formatUnits(config.fixedAmount || BigInt(0), tokenDecimals)).toFixed(4) + " " + tokenSymbol}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="bg-[#f8f8f8] p-2 rounded-lg text-center">
                        <p className="text-[#4a3520] text-sm mb-1">Emergency Withdrawal</p>
                        <p className="font-semibold text-[#1a1a1a]">
                          {config.emergencyWithdrawalEnabled ? "Enabled" : "Disabled"}
                        </p>
                      </div>
                    </div>

                    {/* User Status */}
                    {(showUserFunctions || isAdmin || isFeeCollector) && (
                      <div className="mt-6">
                        <h3 className="text-base font-semibold text-[#3c2a14] mb-2">Your Status</h3>
                        <div className="flex flex-wrap gap-2">
                          {config.blacklist ? (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 bg-[#ffebee] text-[#c62828] border-[#c62828] px-3 py-1"
                            >
                              <ShieldAlert className="h-3 w-3 mr-1" />
                              Blacklisted
                            </Badge>
                          ) : (
                            showUserFunctions && (
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1 bg-[#e6f7e6] text-[#2e7d32] border-[#2e7d32] px-3 py-1"
                              >
                                <Users className="h-3 w-3 mr-1" />
                                Whitelisted
                              </Badge>
                            )
                          )}
                          {isFeeCollector && (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 bg-[#e3f2fd] text-[#1976d2] border-[#1976d2] px-3 py-1"
                            >
                              <Coins className="h-3 w-3 mr-1" />
                              Fee Collector
                            </Badge>
                          )}
                          {isAdmin && (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 bg-[#fce4ec] text-[#c2185b] border-[#c2185b] px-3 py-1"
                            >
                              <ShieldAlert className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right side - Jar Actions */}
        <div className="lg:col-span-9">
          <Tabs defaultValue="withdraw" className="w-full">
            <TabsList className="mb-6 bg-[#fff8f0] p-1 w-full">
              <TabsTrigger
                value="withdraw"
                className="data-[state=active]:bg-white data-[state=active]:text-[#ff5e14] data-[state=active]:shadow-sm text-[#4a3520] flex-1"
              >
                Get Cookie
              </TabsTrigger>
              <TabsTrigger
                value="deposit"
                className="data-[state=active]:bg-white data-[state=active]:text-[#ff5e14] data-[state=active]:shadow-sm text-[#4a3520] flex-1"
              >
                Jar Donate
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger
                  value="admin"
                  className="data-[state=active]:bg-white data-[state=active]:text-[#ff5e14] data-[state=active]:shadow-sm text-[#4a3520] flex-1"
                >
                  Admin Controls
                </TabsTrigger>
              )}
              {isFeeCollector && (
                <TabsTrigger
                  value="feeCollector"
                  className="data-[state=active]:bg-white data-[state=active]:text-[#ff5e14] data-[state=active]:shadow-sm text-[#4a3520] flex-1"
                >
                  Fee Collector
                </TabsTrigger>
              )}
            </TabsList>

            {/* Deposit Tab */}
            <TabsContent value="deposit" className="mt-0">
              <Card className="border-none shadow-md">
                <CardHeader className="bg-[#fff8f0] rounded-t-lg">
                  <CardTitle className="text-xl text-[#3c2a14]">Jar Donate</CardTitle>
                  <CardDescription className="text-[#8b7355]">
                    Support this cookie jar with your donation
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label htmlFor="fundAmount" className="block text-[#ff5e14] font-medium mb-2">
                          Amount to Deposit
                        </label>
                        <Input
                          id="fundAmount"
                          type="text"
                          placeholder={
                            config.currency === "0x0000000000000000000000000000000000000003" 
                              ? "0.1 ETH" 
                              : `1${"." + "0".repeat(tokenDecimals > 0 ? 0 : tokenDecimals)} ${tokenSymbol || "Tokens"}`
                          }
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="border-[#f0e6d8] bg-white text-[#3c2a14]"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={() => onSubmit(amount)}
                          className="w-full bg-[#ff5e14] hover:bg-[#e54d00] text-white h-10"
                          disabled={!amount || Number(amount) <= 0}
                        >
                          Donate Now
                        </Button>
                      </div>
                    </div>

                    {config.currency !== "0x0000000000000000000000000000000000000003" && (
                      <div className="pt-2">
                        <p className="text-sm text-[#8b7355]">
                          Note: For ERC20 tokens, you'll need to approve the token transfer before depositing.
                        </p>
                      </div>
                    )}

                    {isApprovalPending && (
                      <div className="mt-4 p-3 bg-[#fff8f0] rounded-lg text-[#4a3520]">
                        Waiting for token approval... Please confirm the transaction in your wallet.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Withdraw Tab */}
            <TabsContent value="withdraw" className="mt-0">
              <Card className="border-none shadow-md">
                <CardHeader className="bg-[#fff8f0] rounded-t-lg">
                  <CardTitle className="text-xl text-[#3c2a14]">Get Cookie</CardTitle>
                  <CardDescription className="text-[#8b7355]">Receive cookies from this jar</CardDescription>
                </CardHeader>
                <CardContent className="p-8 relative min-h-[400px]">
                  {config.blacklist ? (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-b-lg">
                      <div className="bg-red-500 text-white font-medium px-6 py-2 rounded-full text-lg">
                        You are Blacklisted
                      </div>
                    </div>
                  ) : isInCooldown ? (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-10 rounded-b-lg">
                      <div className="w-full max-w-xl mx-auto bg-[#f8f5f0]/90 rounded-xl shadow-lg">
                        <CountdownTimer
                          lastWithdrawalTimestamp={Number(config.lastWithdrawalWhitelist)}
                          interval={Number(config.withdrawalInterval)}
                          onComplete={() => {
                            // Force a re-render when timer completes
                            window.location.reload()
                          }}
                        />
                      </div>
                    </div>
                  ) : null}

                  {showUserFunctions ? (
                    <WhitelistWithdrawalSection
                      config={{
                        ...config,
                        isWithdrawPending: isWithdrawWhitelistPending,
                      }}
                      withdrawPurpose={withdrawPurpose}
                      setWithdrawPurpose={setWithdrawPurpose}
                      withdrawAmount={withdrawAmount}
                      setWithdrawAmount={setWithdrawAmount}
                      handleWithdrawWhitelist={handleWithdrawWhitelist}
                      handleWithdrawWhitelistVariable={handleWithdrawWhitelistVariable}
                    />
                  ) : showNFTGatedFunctions ? (
                    <NFTGatedWithdrawalSection
                      config={{
                        ...config,
                        isWithdrawPending: isWithdrawNFTPending,
                      }}
                      withdrawAmount={withdrawAmount}
                      setWithdrawAmount={setWithdrawAmount}
                      gateAddress={gateAddress}
                      setGateAddress={setGateAddress}
                      tokenId={tokenId}
                      setTokenId={setTokenId}
                      handleWithdrawNFT={handleWithdrawNFT}
                      handleWithdrawNFTVariable={handleWithdrawNFTVariable}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="bg-red-500 text-white font-medium px-6 py-2 rounded-full text-lg">
                        Not Whitelisted
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Admin Tab */}
            {isAdmin && (
              <TabsContent value="admin" className="mt-0">
                <Card className="border-none shadow-md">
                  <CardHeader className="bg-[#fff8f0] rounded-t-lg">
                    <CardTitle className="text-xl text-[#3c2a14]">Admin Controls</CardTitle>
                    <CardDescription className="text-[#8b7355]">
                      Manage jar settings and access controls
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <AdminFunctions address={address as `0x${string}`} />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Fee Collector Tab */}
            {isFeeCollector && (
              <TabsContent value="feeCollector" className="mt-0">
                <Card className="border-none shadow-md">
                  <CardHeader className="bg-[#fff8f0] rounded-t-lg">
                    <CardTitle className="text-xl text-[#3c2a14]">Fee Collector Settings</CardTitle>
                    <CardDescription className="text-[#8b7355]">Manage fee collection settings</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <DefaultFeeCollector contractAddress={address as `0x${string}`} />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* Withdrawal History Section */}
      <div className="mt-8">
        <Card className="border-none shadow-md">
          <CardHeader className="bg-[#fff8f0] rounded-t-lg">
            <CardTitle className="text-xl text-[#3c2a14]">Withdrawal History</CardTitle>
            <CardDescription className="text-[#8b7355]">Past withdrawals from this cookie jar</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <WithdrawalHistorySection
              pastWithdrawals={config.pastWithdrawals ? ([...config.pastWithdrawals] as Withdrawal[]) : undefined}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
