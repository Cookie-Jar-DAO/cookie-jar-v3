"use client"

import React from "react"

import { useParams, useRouter } from "next/navigation"
import { useMemo, useState, useEffect, useRef, useCallback } from "react"
import { useCookieJarConfig } from "@/hooks/use-cookie-jar"
import { Badge } from "@/components/ui/badge"
import {
  ShieldAlert,
  Users,
  Coins,
  Copy,
  ExternalLink,
  Clock,
  ArrowDownToLine,
  Info,
  CheckCircle,
  XCircle,
  History,
  Wallet,
  RefreshCw,
  Menu,
} from "lucide-react"
import { useAccount, useChainId, useWaitForTransactionReceipt, useBalance } from "wagmi"
import type { ReadContractErrorType } from "viem"
import { useWriteCookieJarDepositEth, useWriteCookieJarDepositCurrency, useWriteErc20Approve } from "@/generated"
import { AdminFunctions } from "@/components/admin/AdminFunctions"
import { formatAddress } from "@/lib/utils/format"
import DefaultFeeCollector from "@/components/FeeCollector/DefaultFeeCollector"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/design/use-toast"
import { Separator } from "@/components/ui/separator"
import { NFTGatedWithdrawalSection } from "@/components/users/NFTGatedWithdrawalSection"
import { BackButton } from "@/components/design/back-button"
import { useWriteCookieJarWithdrawWhitelistMode, useWriteCookieJarWithdrawNftMode } from "@/generated"
import { CountdownTimer } from "@/components/users/CountdownTimer"
import { WithdrawalHistorySection, type Withdrawal } from "@/components/users/WithdrawlHistorySection"
import { useNFTOwnership } from "@/hooks/use-nft-ownership"
import { LoadingOverlay } from "@/components/design/loading-overlay"
import { FundingSection } from "@/components/users/FundingSection"
import { ErrorDialog } from "@/components/ui/error-dialog"
import { WhitelistWithdrawalSection } from "@/components/users/WhitelistWithdrawalSection"
import { useIsMobile } from "@/hooks/design/use-mobile"

// Import token utilities
import { ETH_ADDRESS, useTokenInfo, parseTokenAmount, formatTokenAmount } from "@/lib/utils/token-utils"

// Add these imports at the top of the file
import { z } from "zod"
import { isAddress } from "viem"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

// Add this schema near the top of the component
const ethereumAddressSchema = z
  .string()
  .refine((address) => isAddress(address), { message: "Invalid Ethereum address format" })

export default function CookieJarConfigDetails() {
  const params = useParams()
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const address = params.address as string
  const { address: userAddress } = useAccount()
  const [tokenAddress, setTokenAddress] = useState("")
  const { toast } = useToast()
  const pageRef = useRef<HTMLDivElement>(null)
  const [withdrawAmount, setWithdrawAmount] = useState<string>("")
  const [withdrawPurpose, setWithdrawPurpose] = useState<string>("")
  const [gateAddress, setGateAddress] = useState<string>("")
  const [tokenId, setTokenId] = useState<string>("")
  const chainId = useChainId()
  const [activeTab, setActiveTab] = useState("overview")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  // Fix: Initialize with undefined instead of null
  const [pendingTx, setPendingTx] = useState<`0x${string}` | undefined>(undefined)
  const isMobile = useIsMobile()

  const [isDepositLoading, setIsDepositLoading] = useState(false)
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)
  const [isAdminActionLoading, setIsAdminActionLoading] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Processing...")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const addressString = address as `0x${string}`
  const isValidAddress = typeof address === "string" && address.startsWith("0x")

  // Get user's wallet balance
  const { data: walletBalance } = useBalance({
    address: userAddress,
  })

  // Destructure the refetch function from the hook
  const {
    config,
    isLoading,
    hasError,
    errors,
    refetch: refetchConfig,
  } = useCookieJarConfig(isValidAddress ? (address as `0x${string}`) : "0x0000000000000000000000000000000000000000")

  // Update how token information is used in the page

  // Use token utilities hook to get token information
  const isERC20 = config?.currency && config.currency !== ETH_ADDRESS
  const {
    symbol: tokenSymbol,
    decimals: tokenDecimals,
    isLoading: isLoadingToken,
  } = useTokenInfo(isERC20 && config?.currency ? config.currency : ETH_ADDRESS)

  // Format balance for display using the token decimals
  const formattedBalance = () => {
    if (!config.balance) return "0"

    // If token info is still loading, show loading indicator
    if (isLoadingToken) return "Loading..."

    return formatTokenAmount(config.balance, tokenDecimals || 18, tokenSymbol || "ETH")
  }

  // Get NFT ownership status
  const { hasRequiredNFT, isLoading: isLoadingNFT } = useNFTOwnership(address as string)

  // User roles
  const isAdmin = userAddress && config?.admin && userAddress.toLowerCase() === config.admin.toLowerCase()
  const isFeeCollector =
    userAddress && config?.feeCollector && userAddress.toLowerCase() === config.feeCollector.toLowerCase()
  const showUserFunctions = config?.whitelist === true && config?.accessType === "Whitelist"
  const showNFTGatedFunctions = config?.accessType === "NFTGated" && hasRequiredNFT

  // Contract interactions for deposits
  const {
    writeContract: depositEth,
    data: depositEthData,
    isSuccess: isDepositEthSuccess,
    isPending: isDepositEthPending,
  } = useWriteCookieJarDepositEth()

  const {
    writeContract: depositCurrency,
    data: depositCurrencyData,
    isSuccess: isDepositCurrencySuccess,
    isPending: isDepositCurrencyPending,
  } = useWriteCookieJarDepositCurrency()

  const {
    writeContract: approve,
    isPending: isApprovalPending,
    isSuccess: isApprovalSuccess,
    isError: isApprovalError,
    data: approvalData,
  } = useWriteErc20Approve()

  // Wait for transaction receipt
  const {
    data: txReceipt,
    isSuccess: isTxSuccess,
    isLoading: isTxLoading,
  } = useWaitForTransactionReceipt({
    hash: pendingTx,
  })

  // Contract interactions for withdrawals
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

  // Add this function to refetch jar data
  const refetchJarData = useCallback(async () => {
    try {
      setIsRefreshing(true)
      // Force a refetch of the jar configuration
      const result = await refetchConfig()
      toast({
        title: "Data Updated",
        description: "The jar data has been refreshed.",
      })
      return result
    } catch (error) {
      console.error("Error refetching jar data:", error)
      toast({
        title: "Error Updating Data",
        description: "Could not refresh the latest jar data. Please try refreshing the page.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsRefreshing(false)
    }
  }, [refetchConfig, toast])

  // Manual refresh button handler
  const handleManualRefresh = () => {
    refetchJarData()
  }

  // Check if user is in cooldown period
  const isInCooldown = useMemo(() => {
    if (!config.withdrawalInterval) return false

    // Check based on access type
    if (config.accessType === "Whitelist" && config.lastWithdrawalWhitelist) {
      const now = Math.floor(Date.now() / 1000)
      const nextWithdrawalTime = Number(config.lastWithdrawalWhitelist) + Number(config.withdrawalInterval)
      return nextWithdrawalTime > now
    } else if (config.accessType === "NFTGated" && config.lastWithdrawalNft) {
      const now = Math.floor(Date.now() / 1000)
      const nextWithdrawalTime = Number(config.lastWithdrawalNft) + Number(config.withdrawalInterval)
      return nextWithdrawalTime > now
    }

    return false
  }, [config.lastWithdrawalWhitelist, config.lastWithdrawalNft, config.withdrawalInterval, config.accessType])

  // Check for one-time withdrawals
  const hasAlreadyWithdrawn = useMemo(() => {
    if (!config.oneTimeWithdrawal) return false

    // Check if user has already withdrawn based on access type
    if (
      config.accessType === "Whitelist" &&
      config.lastWithdrawalWhitelist &&
      Number(config.lastWithdrawalWhitelist) > 0
    ) {
      return true
    } else if (config.accessType === "NFTGated" && config.lastWithdrawalNft && Number(config.lastWithdrawalNft) > 0) {
      return true
    }

    return false
  }, [config.oneTimeWithdrawal, config.lastWithdrawalWhitelist, config.lastWithdrawalNft, config.accessType])

  // Get network info
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

  // Handle deposit/donate
  const onSubmit = (value: string) => {
    if (!value || Number(value) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      })
      return
    }

    try {
      // Parse amount considering the token decimals
      const amountBigInt = parseTokenAmount(value || "0", tokenDecimals || 18)

      // Show loading overlay
      setIsDepositLoading(true)
      setLoadingMessage(config.currency === ETH_ADDRESS ? "Processing ETH deposit..." : "Processing token deposit...")

      if (config.currency === ETH_ADDRESS) {
        depositEth({
          address: addressString as `0x${string}`,
          value: amountBigInt,
        })
      } else {
        // For ERC20 tokens, first validate the currency address
        try {
          ethereumAddressSchema.parse(config.currency)

          // Then approve and deposit
          setLoadingMessage("Approving token transfer...")
          approve({
            address: config.currency as `0x${string}`,
            args: [addressString as `0x${string}`, amountBigInt],
          })
        } catch (error) {
          console.error("Invalid token address:", error)
          setIsDepositLoading(false)
          setErrorMessage("Invalid token address format")
          setShowErrorDialog(true)
        }
      }
    } catch (error: any) {
      console.error("Error submitting transaction:", error)
      setIsDepositLoading(false)
      setErrorMessage(
        error.message.includes("user rejected transaction")
          ? "Transaction cancelled by user"
          : "Failed to submit transaction. Please try again.",
      )
      setShowErrorDialog(true)
    }
  }

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Address copied",
      description: "The address has been copied to your clipboard",
    })
  }

  // Withdrawal handlers
  const handleWithdrawWhitelist = async () => {
    if (!config.contractAddress || !config.fixedAmount) return

    setIsWithdrawLoading(true)
    setLoadingMessage("Processing withdrawal...")

    try {
      // Validate the contract address
      ethereumAddressSchema.parse(config.contractAddress)

      await withdrawWhitelistMode({
        address: config.contractAddress,
        args: [config.fixedAmount, withdrawPurpose],
      })
    } catch (error: any) {
      console.error("Withdrawal error:", error)
      setIsWithdrawLoading(false)
      if (error.message.includes("user rejected transaction")) {
        setErrorMessage("Transaction cancelled by user")
      } else {
        setErrorMessage("An error occurred during withdrawal")
      }
      setShowErrorDialog(true)
    }
  }

  const handleWithdrawWhitelistVariable = async () => {
    if (!config.contractAddress || !withdrawAmount) return

    setIsWithdrawLoading(true)
    setLoadingMessage("Processing withdrawal...")

    try {
      // Validate the contract address
      ethereumAddressSchema.parse(config.contractAddress)

      // Validate the withdrawal amount
      if (isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
        throw new Error("Invalid withdrawal amount")
      }

      // Parse amount considering the token decimals
      const parsedAmount = parseTokenAmount(withdrawAmount, tokenDecimals || 18)

      await withdrawWhitelistMode({
        address: config.contractAddress,
        args: [parsedAmount, withdrawPurpose],
      })
    } catch (error: any) {
      console.error("Withdrawal error:", error)
      setIsWithdrawLoading(false)
      if (error.message.includes("user rejected transaction")) {
        setErrorMessage("Transaction cancelled by user")
      } else {
        setErrorMessage("An error occurred during withdrawal")
      }
      setShowErrorDialog(true)
    }
  }

  const handleWithdrawNFT = async () => {
    if (!config.contractAddress || !config.fixedAmount || !gateAddress) return

    setIsWithdrawLoading(true)
    setLoadingMessage("Processing NFT-gated withdrawal...")

    try {
      // Validate the contract address and gate address
      ethereumAddressSchema.parse(config.contractAddress)
      ethereumAddressSchema.parse(gateAddress)

      await withdrawNFTMode({
        address: config.contractAddress,
        args: [config.fixedAmount, withdrawPurpose, gateAddress as `0x${string}`, BigInt(tokenId || "0")],
      })
    } catch (error: any) {
      console.error("NFT withdrawal error:", error)
      setIsWithdrawLoading(false)
      if (error.message.includes("user rejected transaction")) {
        setErrorMessage("Transaction cancelled by user")
      } else {
        setErrorMessage("An error occurred during withdrawal")
      }
      setShowErrorDialog(true)
    }
  }

  const handleWithdrawNFTVariable = async () => {
    if (!config.contractAddress || !withdrawAmount || !gateAddress) return

    setIsWithdrawLoading(true)
    setLoadingMessage("Processing NFT-gated withdrawal...")

    try {
      // Validate the contract address and gate address
      ethereumAddressSchema.parse(config.contractAddress)
      ethereumAddressSchema.parse(gateAddress)

      // Validate the withdrawal amount
      if (isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
        throw new Error("Invalid withdrawal amount")
      }

      // Parse amount considering the token decimals
      const parsedAmount = parseTokenAmount(withdrawAmount, tokenDecimals || 18)

      await withdrawNFTMode({
        address: config.contractAddress,
        args: [parsedAmount, withdrawPurpose, gateAddress as `0x${string}`, BigInt(tokenId || "0")],
      })
    } catch (error: any) {
      console.error("NFT withdrawal error:", error)
      setIsWithdrawLoading(false)
      if (error.message.includes("user rejected transaction")) {
        setErrorMessage("Transaction cancelled by user")
      } else {
        setErrorMessage("An error occurred during withdrawal")
      }
      setShowErrorDialog(true)
    }
  }

  // Track deposit ETH transaction
  useEffect(() => {
    if (isDepositEthSuccess && depositEthData) {
      setPendingTx(depositEthData)
      toast({
        title: "ETH Deposit Submitted",
        description: "Your deposit transaction has been submitted. Waiting for confirmation...",
      })
    }
  }, [isDepositEthSuccess, depositEthData, toast])

  // Track deposit currency (ERC20) transaction
  useEffect(() => {
    if (isDepositCurrencySuccess && depositCurrencyData) {
      setPendingTx(depositCurrencyData)
      toast({
        title: "Token Deposit Submitted",
        description: "Your deposit transaction has been submitted. Waiting for confirmation...",
      })
    }
  }, [isDepositCurrencySuccess, depositCurrencyData, toast])

  // Handle approval success
  useEffect(() => {
    if (isApprovalSuccess && approvalData) {
      toast({
        title: "Approval Successful",
        description: "Token approval successful. Proceeding with deposit...",
      })

      setLoadingMessage("Depositing tokens...")

      // After approval, proceed with deposit
      setTimeout(() => {
        try {
          const amountBigInt = parseTokenAmount(amount || "0", tokenDecimals || 18)
          depositCurrency({
            address: addressString as `0x${string}`,
            args: [amountBigInt],
          })
        } catch (error) {
          console.error("Error depositing after approval:", error)
          setIsDepositLoading(false)
          setErrorMessage("Failed to deposit tokens after approval.")
          setShowErrorDialog(true)
        }
      }, 1000)
    }

    if (isApprovalError) {
      setIsDepositLoading(false)
      setErrorMessage("Token approval rejected")
      setShowErrorDialog(true)
    }
  }, [isApprovalSuccess, isApprovalError, approvalData, amount, depositCurrency, addressString, toast, tokenDecimals])

  // Handle withdrawal success
  useEffect(() => {
    if (isWithdrawWhitelistSuccess && withdrawWhitelistModeData) {
      setPendingTx(withdrawWhitelistModeData)
      toast({
        title: "Withdrawal Submitted",
        description: "Your withdrawal transaction has been submitted. Waiting for confirmation...",
      })

      // Reset form fields
      setWithdrawAmount("")
      setWithdrawPurpose("")
    }
  }, [isWithdrawWhitelistSuccess, withdrawWhitelistModeData, toast])

  // Handle NFT withdrawal success
  useEffect(() => {
    if (isWithdrawNFTSuccess && withdrawNFTModeData) {
      setPendingTx(withdrawNFTModeData)
      toast({
        title: "NFT Withdrawal Submitted",
        description: "Your NFT withdrawal transaction has been submitted. Waiting for confirmation...",
      })

      // Reset form fields
      setWithdrawAmount("")
      setWithdrawPurpose("")
      setGateAddress("")
      setTokenId("")
    }
  }, [isWithdrawNFTSuccess, withdrawNFTModeData, toast])

  // Handle transaction confirmation
  useEffect(() => {
    if (isTxSuccess && txReceipt && pendingTx) {
      toast({
        title: "Transaction Confirmed",
        description: "Your transaction has been confirmed. Refreshing data...",
      })

      // Clear the pending transaction
      setPendingTx(undefined)

      // Clear loading states
      setIsDepositLoading(false)
      setIsWithdrawLoading(false)
      setIsAdminActionLoading(false)

      // Clear any error states
      setErrorMessage(null)
      setShowErrorDialog(false)

      // Reset amount field after successful deposit
      setAmount("")

      // Refresh data after transaction confirmation
      // Add a delay to allow blockchain state to update
      setTimeout(() => {
        refetchJarData()
      }, 2000)
    }
  }, [isTxSuccess, txReceipt, pendingTx, toast, refetchJarData])

  // Handle withdrawal errors
  useEffect(() => {
    if (withdrawWhitelistModeError || withdrawNFTModeError) {
      setIsWithdrawLoading(false)

      const errorMsg =
        (withdrawWhitelistModeError || withdrawNFTModeError)?.message || "An error occurred during withdrawal"

      if (errorMsg.includes("rejected")) {
        setErrorMessage("Transaction cancelled by user")
      } else {
        setErrorMessage(errorMsg)
      }
      setShowErrorDialog(true)
    }
  }, [withdrawWhitelistModeError, withdrawNFTModeError, toast])

  // Add a new useEffect to handle deposit errors
  useEffect(() => {
    // Only show error dialog if there was an actual error
    // and not just a pending state during transaction processing
    if (
      isDepositEthPending === false &&
      isDepositCurrencyPending === false &&
      pendingTx === undefined &&
      isDepositLoading === true &&
      !isApprovalPending // Add this check to prevent false positives during approval
    ) {
      // Wait a short delay to ensure we're not in a transition state
      const timer = setTimeout(() => {
        setIsDepositLoading(false)
        setErrorMessage("Transaction may have been cancelled")
        setShowErrorDialog(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isDepositEthPending, isDepositCurrencyPending, pendingTx, isDepositLoading, isApprovalPending])

  // Format balance for display using the token decimals

  // Update the Fixed Amount display in the overview tab
  // Error states
  if (!isValidAddress) {
    return (
      <div className="container max-w-3xl mx-auto mt-8 p-6 bg-background-paper border border-border rounded-lg">
        <h2 className="text-xl font-bold text-red-500 mb-4">Invalid Address</h2>
        <p className="text-red-400">No valid address was provided. Please check the URL and try again.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-main">
        <LoadingOverlay isOpen={true} message="Loading jar details..." />
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="container max-w-3xl mx-auto mt-8 p-6 bg-background-paper border border-border rounded-lg">
        <h2 className="text-xl font-bold text-red-500 mb-4">Error Loading Configuration</h2>
        <ul className="list-disc pl-5 text-red-400">
          {errors
            .filter((error): error is ReadContractErrorType => error !== null)
            .map((error, index) => (
              <li key={index}>{error.message || "Unknown error"}</li>
            ))}
        </ul>
      </div>
    )
  }

  // Define navigation items
  const navigationItems = [
    { id: "overview", label: "Overview", icon: <Info className="h-5 w-5" /> },
    {
      id: "withdraw",
      label: "Get Cookie",
      icon: <ArrowDownToLine className="h-5 w-5" />,
      disabled: config.blacklist || (!showUserFunctions && !showNFTGatedFunctions),
    },
    {
      id: "deposit",
      label: isAdmin ? "Deposit" : "Donate",
      icon: <Wallet className="h-5 w-5" />,
    },
    { id: "history", label: "History", icon: <History className="h-5 w-5" /> },
  ]

  if (isAdmin) {
    navigationItems.push({
      id: "admin",
      label: "Admin",
      icon: <ShieldAlert className="h-5 w-5" />,
    })
  }

  if (isFeeCollector) {
    navigationItems.push({
      id: "feeCollector",
      label: "Fee Collector",
      icon: <Coins className="h-5 w-5" />,
    })
  }

  // Main render
  return (
    <div className="min-h-screen bg-background-main" ref={pageRef}>
      {/* Hero section with jar info */}
      <div className="relative bg-gradient-to-b from-background-dark to-background-main pt-4 pb-8">
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <BackButton />
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{config.metadata ?? "Cookie Jar"}</h1>
              <div className="flex items-center gap-2 text-text-disabled">
                <span>{formatAddress(addressString)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(addressString)}
                  className="h-7 w-7 text-text-disabled hover:text-white hover:bg-[#ffffff20]"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-text-disabled hover:text-white hover:bg-[#ffffff20]"
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

            <div className="flex flex-wrap gap-2">
              {/* User status badges */}
              <div className="flex flex-wrap gap-1.5">
                {config.blacklist ? (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 bg-background-paper text-primary border-primary px-3 py-1"
                  >
                    <ShieldAlert className="h-3 w-3 mr-1" />
                    Blacklisted
                  </Badge>
                ) : (
                  showUserFunctions && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 bg-background-paper text-primary border-primary px-3 py-1"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Whitelisted
                    </Badge>
                  )
                )}
                {showNFTGatedFunctions && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 bg-background-paper text-primary border-primary px-3 py-1"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    NFT Verified
                  </Badge>
                )}
                {isFeeCollector && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 bg-background-paper text-primary border-primary px-3 py-1"
                  >
                    <Coins className="h-3 w-3 mr-1" />
                    Fee Collector
                  </Badge>
                )}
                {isAdmin && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 bg-background-paper text-primary border-primary px-3 py-1"
                  >
                    <ShieldAlert className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>

              {/* Balance display */}
              <div className="flex items-center bg-background-light rounded-full px-4 py-2">
                <Coins className="h-5 w-5 text-primary mr-2" />
                <span className="text-text-primary font-medium">{formattedBalance()}</span>
              </div>
            </div>

            {/* Quick action buttons for mobile */}
            {isMobile && (
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => setActiveTab("withdraw")}
                  className="flex-1 bg-[#c0ff00] hover:bg-[#a8e600] text-black"
                  disabled={config.blacklist || (!showUserFunctions && !showNFTGatedFunctions)}
                >
                  <ArrowDownToLine className="h-4 w-4 mr-2" />
                  Get Cookie
                </Button>
                <Button
                  onClick={() => setActiveTab("deposit")}
                  className="flex-1 bg-primary hover:bg-primary-dark text-black"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Deposit
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="bg-background-paper backdrop-blur-sm rounded-xl border border-border shadow-3d-card overflow-hidden">
          {/* Navigation tabs - Mobile version with bottom navigation */}
          {isMobile ? (
            <div className="fixed bottom-0 left-0 right-0 bg-[#222222] border-t border-[#333333] z-50">
              <div className="flex justify-around items-center py-2">
                {navigationItems.slice(0, 4).map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center px-2 py-1 h-auto ${
                      activeTab === item.id
                        ? "bg-[#c0ff00] text-black"
                        : "text-gray-400 hover:text-white hover:bg-transparent"
                    }`}
                    disabled={item.disabled}
                  >
                    {item.icon}
                    <span className="text-xs mt-1">
                      {item.id === "overview"
                        ? "Overview"
                        : item.id === "withdraw"
                          ? "Get Cookie"
                          : item.id === "deposit"
                            ? "Deposit"
                            : item.id === "history"
                              ? "History"
                              : item.label}
                    </span>
                  </Button>
                ))}
                {(isAdmin || isFeeCollector) && (
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex flex-col items-center px-2 py-1 h-auto text-gray-400 hover:text-white hover:bg-transparent"
                      >
                        <Menu className="h-5 w-5" />
                        <span className="text-xs mt-1">More</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="bg-[#222222] text-white">
                      <SheetHeader>
                        <SheetTitle className="text-white">More Options</SheetTitle>
                      </SheetHeader>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {navigationItems.slice(4).map((item) => (
                          <Button
                            key={item.id}
                            variant={activeTab === item.id ? "default" : "outline"}
                            onClick={() => {
                              setActiveTab(item.id)
                              document
                                .querySelector('[data-state="open"]')
                                ?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
                            }}
                            className={`flex items-center justify-center gap-2 ${
                              activeTab === item.id
                                ? "bg-[#c0ff00] text-black"
                                : "border-[#444444] text-white hover:bg-[#333333]"
                            }`}
                          >
                            {item.icon}
                            <span>
                              {item.id === "admin"
                                ? "Admin"
                                : item.id === "feeCollector"
                                  ? "Fee Collector"
                                  : item.label}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>
                )}
              </div>
            </div>
          ) : (
            // Desktop navigation
            <div className="p-4 border-b border-gray-200">
              <div className="flex overflow-x-auto hide-scrollbar space-x-2">
                {navigationItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    onClick={() => setActiveTab(item.id)}
                    className={
                      activeTab === item.id
                        ? "bg-primary text-black"
                        : "text-text-primary hover:bg-primary hover:text-black"
                    }
                    disabled={item.disabled}
                  >
                    {React.cloneElement(item.icon, { className: "h-4 w-4 mr-2" })}
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Tab content */}
          <div className={`p-6 ${isMobile ? "pb-24" : ""}`}>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">Jar Details</h2>

                  <div className="bg-background-paper rounded-xl p-4 md:p-6 space-y-3 md:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Access Type</span>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-primary mr-2" />
                        <span className="text-text-primary font-medium">{config.accessType}</span>
                      </div>
                    </div>

                    <Separator className="bg-[#f0e6d8]" />

                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Cooldown Period</span>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-primary mr-2" />
                        <span className="text-text-primary font-medium">
                          {config.withdrawalInterval
                            ? (() => {
                                const { formatTimeComponents, formatTimeString } = require("@/lib/utils/time-utils")
                                const seconds = Number(config.withdrawalInterval)
                                const { days, hours, minutes, seconds: secs } = formatTimeComponents(seconds)
                                return formatTimeString(days, hours, minutes, secs)
                              })()
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    <Separator className="bg-[#f0e6d8]" />

                    {config.withdrawalOption === "Fixed" ? (
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Fixed Amount</span>
                        <div className="flex items-center">
                          <span className="text-text-primary font-medium">
                            {config.fixedAmount
                              ? isLoadingToken
                                ? "Loading..."
                                : formatTokenAmount(config.fixedAmount, tokenDecimals || 18, tokenSymbol || "ETH")
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Max Withdrawal</span>
                        <div className="flex items-center">
                          <span className="text-text-primary font-medium">
                            {config.maxWithdrawal
                              ? formatTokenAmount(config.maxWithdrawal, tokenDecimals || 18, tokenSymbol || "ETH")
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    )}

                    <Separator className="bg-[#f0e6d8]" />

                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">One-Time Withdrawal</span>
                      <div className="flex items-center">
                        {config.oneTimeWithdrawal ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>

                    <Separator className="bg-[#f0e6d8]" />

                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Purpose Required</span>
                      <div className="flex items-center">
                        {config.strictPurpose ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>

                    <Separator className="bg-[#f0e6d8]" />

                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Emergency Withdrawal</span>
                      <div className="flex items-center">
                        {config.emergencyWithdrawalEnabled ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">Your Status</h2>

                  <div className="bg-background-paper rounded-xl p-4 md:p-6 space-y-6">
                    {/* Access status */}
                    <div className="flex flex-col gap-2">
                      <span className="text-text-secondary">Access Status</span>
                      <div className="flex items-center gap-2">
                        {config.blacklist ? (
                          <div className="flex items-center gap-2 bg-[#ffebee] text-[#c62828] px-3 py-2 rounded-lg">
                            <ShieldAlert className="h-5 w-5" />
                            <span className="font-medium">You are blacklisted from this jar</span>
                          </div>
                        ) : config.accessType === "Whitelist" ? (
                          config.whitelist ? (
                            <div className="flex items-center gap-2 bg-[#e6f7e6] text-[#2e7d32] px-3 py-2 rounded-lg">
                              <CheckCircle className="h-5 w-5" />
                              <span className="font-medium">You are whitelisted for this jar</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 bg-[#ffebee] text-[#c62828] px-3 py-2 rounded-lg">
                              <XCircle className="h-5 w-5" />
                              <span className="font-medium">You are not whitelisted for this jar</span>
                            </div>
                          )
                        ) : hasRequiredNFT ? (
                          <div className="flex items-center gap-2 bg-[#e6f7e6] text-[#2e7d32] px-3 py-2 rounded-lg">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">You have the required NFT for this jar</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-[#ffebee] text-[#c62828] px-3 py-2 rounded-lg">
                            <XCircle className="h-5 w-5" />
                            <span className="font-medium">You don't have the required NFT for this jar</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cooldown status */}
                    {(showUserFunctions || showNFTGatedFunctions) && (
                      <div className="flex flex-col gap-2">
                        <span className="text-text-secondary">Cooldown Status</span>
                        <div className="flex items-center gap-2">
                          {isInCooldown ? (
                            <div className="flex items-center gap-2 bg-background-light text-primary px-3 py-2 rounded-lg">
                              <Clock className="h-5 w-5" />
                              <span className="font-medium">Cooldown period active</span>
                            </div>
                          ) : hasAlreadyWithdrawn ? (
                            <div className="flex items-center gap-2 bg-[#ffebee] text-[#c62828] px-3 py-2 rounded-lg">
                              <XCircle className="h-5 w-5" />
                              <span className="font-medium">You have already claimed from this jar</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 bg-[#e6f7e6] text-[#2e7d32] px-3 py-2 rounded-lg">
                              <CheckCircle className="h-5 w-5" />
                              <span className="font-medium">You can withdraw now</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cooldown timer */}
                    {isInCooldown && (
                      <div className="mt-4 bg-background-light rounded-lg p-6">
                        <CountdownTimer
                          lastWithdrawalTimestamp={
                            config.accessType === "Whitelist"
                              ? Number(config.lastWithdrawalWhitelist)
                              : Number(config.lastWithdrawalNft)
                          }
                          interval={Number(config.withdrawalInterval)}
                          onComplete={() => {
                            // Force a re-render when timer completes
                            refetchJarData()
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Withdraw Tab */}
            {activeTab === "withdraw" && (
              <div className="w-full max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-6">Get Cookie</h2>

                <div className="bg-[#2a2a2a] rounded-xl p-6 relative">
                  {config.blacklist ? (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                      <div className="bg-red-500 text-white font-medium px-6 py-2 rounded-full text-lg">
                        You are Blacklisted
                      </div>
                    </div>
                  ) : hasAlreadyWithdrawn ? (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                      <div className="bg-[#c0ff00] text-black font-medium px-6 py-2 rounded-full text-lg">
                        You have already claimed from this jar
                      </div>
                    </div>
                  ) : isInCooldown ? (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                      <div className="w-full max-w-xl mx-auto p-6">
                        <CountdownTimer
                          lastWithdrawalTimestamp={
                            config.accessType === "Whitelist"
                              ? Number(config.lastWithdrawalWhitelist)
                              : Number(config.lastWithdrawalNft)
                          }
                          interval={Number(config.withdrawalInterval)}
                          onComplete={() => {
                            // Force a re-render when timer completes
                            refetchJarData()
                          }}
                        />
                      </div>
                    </div>
                  ) : null}

                  {showUserFunctions ? (
                    <WhitelistWithdrawalSection
                      config={config}
                      withdrawPurpose={withdrawPurpose}
                      setWithdrawPurpose={setWithdrawPurpose}
                      withdrawAmount={withdrawAmount}
                      setWithdrawAmount={setWithdrawAmount}
                      handleWithdrawWhitelist={handleWithdrawWhitelist}
                      handleWithdrawWhitelistVariable={handleWithdrawWhitelistVariable}
                      iconType="download"
                      isLoading={isWithdrawLoading}
                    />
                  ) : showNFTGatedFunctions ? (
                    <NFTGatedWithdrawalSection
                      config={{
                        ...config,
                        isWithdrawPending: isWithdrawNFTPending,
                      }}
                      withdrawPurpose={withdrawPurpose}
                      setWithdrawPurpose={setWithdrawPurpose}
                      withdrawAmount={withdrawAmount}
                      setWithdrawAmount={setWithdrawAmount}
                      gateAddress={gateAddress}
                      setGateAddress={setGateAddress}
                      tokenId={tokenId}
                      setTokenId={setTokenId}
                      handleWithdrawNFT={handleWithdrawNFT}
                      handleWithdrawNFTVariable={handleWithdrawNFTVariable}
                      iconType="download"
                      isLoading={isWithdrawLoading}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="bg-red-500 text-white font-medium px-6 py-2 rounded-full text-lg">
                        {config.accessType === "Whitelist" ? "Not Whitelisted" : "Missing Required NFT"}
                      </div>
                      {config.accessType === "NFTGated" && (
                        <p className="mt-4 text-gray-400 text-center max-w-md">
                          You need to own one of the required NFTs to withdraw from this jar.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Deposit/Donate Tab */}
            {activeTab === "deposit" && (
              <div className="w-full max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-6">{isAdmin ? "Deposit Funds" : "Donate to Jar"}</h2>

                <div className="bg-[#2a2a2a] rounded-xl p-6">
                  <FundingSection
                    amount={amount}
                    setAmount={setAmount}
                    onSubmit={onSubmit}
                    walletBalance={walletBalance?.value}
                    isAdmin={isAdmin}
                  />

                  {config.currency !== ETH_ADDRESS && (
                    <div className="pt-2 text-center">
                      <p className="text-sm text-gray-400">
                        Note: For ERC20 tokens, you'll need to approve the token transfer before depositing.
                      </p>
                    </div>
                  )}

                  {isApprovalPending && (
                    <div className="mt-4 p-3 bg-[#333333] rounded-lg text-gray-200">
                      <div className="flex items-center">
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin text-[#c0ff00]" />
                        <span>Waiting for token approval... Please confirm the transaction in your wallet.</span>
                      </div>
                    </div>
                  )}

                  {pendingTx && (
                    <div className="mt-4 p-3 bg-[#333333] rounded-lg text-gray-200">
                      <div className="flex items-center">
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin text-[#c0ff00]" />
                        <span>Transaction pending. Data will update automatically after confirmation.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div>
                <h2 className="text-2xl font-bold text-[#C3FF00] mb-6">Withdrawal History</h2>

                <div className="bg-[#2a2a2a] rounded-xl p-4 md:p-6 shadow-lg animate-appear">
                  <div className="mb-4 p-4 bg-[#333333] rounded-lg border-l-4 border-[#C3FF00]">
                    <p className="text-white">
                      This section shows all past withdrawals from this jar. Each withdrawal includes the amount and
                      purpose.
                    </p>
                  </div>

                  <WithdrawalHistorySection
                    pastWithdrawals={config.pastWithdrawals ? ([...config.pastWithdrawals] as Withdrawal[]) : undefined}
                  />
                </div>
              </div>
            )}

            {activeTab === "admin" && isAdmin && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Admin Controls</h2>

                <div className="bg-[#2a2a2a] rounded-xl p-4 md:p-6 shadow-lg animate-appear">
                  <AdminFunctions address={address as `0x${string}`} />
                </div>
              </div>
            )}

            {activeTab === "admin" && !isAdmin && (
              <div className="p-8 text-center">
                <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
                <p className="text-gray-400">You don't have admin permissions for this jar.</p>
              </div>
            )}

            {/* Fee Collector Tab */}
            {activeTab === "feeCollector" && isFeeCollector && (
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-4">Fee Collector Settings</h2>

                <div className="bg-background-paper rounded-xl p-6">
                  <DefaultFeeCollector contractAddress={address as `0x${string}`} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Loading Overlay */}
      <LoadingOverlay
        isOpen={isDepositLoading || isWithdrawLoading || isAdminActionLoading}
        message={loadingMessage}
        onClose={() => {
          setIsDepositLoading(false)
          setIsWithdrawLoading(false)
          setIsAdminActionLoading(false)
        }}
      />

      {/* Error Dialog */}
      <ErrorDialog
        open={showErrorDialog}
        onOpenChange={() => {
          setErrorMessage(null)
          setShowErrorDialog(false)
        }}
        message={errorMessage}
      />
    </div>
  )
}
