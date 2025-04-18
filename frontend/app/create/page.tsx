"use client"

import { DialogFooter } from "@/components/ui/dialog"

import React from "react"

import { useState, useTransition, useEffect } from "react"
import { useWriteCookieJarFactoryCreateCookieJar } from "@/generated"
import { useWaitForTransactionReceipt, useAccount } from "wagmi"
import { parseEther } from "viem"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react"
import { PlusCircle, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LoadingOverlay } from "@/components/design/loading-overlay"
import { AlertCircle } from "lucide-react"
import { BackButton } from "@/components/design/back-button"

// Import token utilities
import { ETH_ADDRESS, useTokenInfo, parseTokenAmount, formatTokenAmount } from "@/lib/utils/token-utils"

// Enums matching the contract
enum AccessType {
  Whitelist = 0,
  NFTGated = 1,
}

enum WithdrawalTypeOptions {
  Fixed = 0,
  Variable = 1,
}

enum NFTType {
  ERC721 = 0,
  ERC1155 = 1,
  Soulbound = 2,
}

export default function CreateCookieJarForm() {
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  // Form state
  const [jarOwnerAddress, setJarOwnerAddress] = useState<`0x${string}`>("0x0000000000000000000000000000000000000000")
  const [supportedCurrency, setSupportedCurrency] = useState<`0x${string}`>(ETH_ADDRESS)
  const [accessType, setAccessType] = useState<AccessType>(AccessType.Whitelist)
  const [withdrawalOption, setWithdrawalOption] = useState<WithdrawalTypeOptions>(WithdrawalTypeOptions.Fixed)
  const [fixedAmount, setFixedAmount] = useState("0")
  const [maxWithdrawal, setMaxWithdrawal] = useState("0")
  const [withdrawalInterval, setWithdrawalInterval] = useState("0")
  const [strictPurpose, setStrictPurpose] = useState(false)
  const [emergencyWithdrawalEnabled, setEmergencyWithdrawalEnabled] = useState(true)
  const [oneTimeWithdrawal, setOneTimeWithdrawal] = useState(false)
  const [metadata, setMetadata] = useState("")
  const { isConnected, address } = useAccount()

  // NFT management
  const [nftAddresses, setNftAddresses] = useState<string[]>([])
  const [nftTypes, setNftTypes] = useState<number[]>([])
  const [newNftAddress, setNewNftAddress] = useState("")
  const [newNftType, setNewNftType] = useState<number>(NFTType.ERC721)

  // Currency type state
  const [currencyType, setCurrencyType] = useState<"eth" | "token">("eth")
  
  // Token information using the useTokenInfo hook
  const { symbol: tokenSymbol, decimals: tokenDecimals, isERC20 } = useTokenInfo(
    currencyType === "token" ? supportedCurrency : undefined
  )

  // Then, add state variables for the confirmation dialog and loading overlay
  // Add these after the existing state declarations (around line 60)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Contract write hook
  const {
    writeContract: createCookieJar,
    data: txHash,
    isPending: isCreatingContract,
    isSuccess: isSubmitted,
    error: createError,
  } = useWriteCookieJarFactoryCreateCookieJar()

  // Transaction receipt hook
  const {
    data: receipt,
    isLoading: isWaitingForReceipt,
    isSuccess: txConfirmed,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  })

  // Set the jar owner to the connected wallet by default
  useEffect(() => {
    if (address) {
      setJarOwnerAddress(address)
    }
  }, [address])

  // Update currency type when the currency changes
  useEffect(() => {
    setCurrencyType(supportedCurrency === ETH_ADDRESS ? "eth" : "token")
  }, [supportedCurrency])

  // Determine if we're using ETH or a token
  const isEthCurrency = supportedCurrency === ETH_ADDRESS

  // Parse amount based on currency type
  const parseAmount = (amountStr: string): bigint => {
    if (!amountStr || amountStr === "0") return BigInt(0)

    try {
      if (isEthCurrency) {
        // For ETH, convert from ETH to wei
        return parseEther(amountStr)
      } else {
        // For tokens, convert from human-readable to smallest unit using token decimals
        return parseTokenAmount(amountStr, tokenDecimals)
      }
    } catch (error) {
      console.error("Error parsing amount:", error)
      return BigInt(0)
    }
  }

  // Add an NFT address and type
  const addNft = () => {
    if (newNftAddress) {
      setNftAddresses([...nftAddresses, newNftAddress])
      setNftTypes([...nftTypes, newNftType])
      setNewNftAddress("")
    }
  }

  // Remove an NFT address and type
  const removeNft = (index: number) => {
    setNftAddresses(nftAddresses.filter((_, i) => i !== index))
    setNftTypes(nftTypes.filter((_, i) => i !== index))
  }

  // Update the handleSubmit function to show the confirmation dialog instead of submitting directly
  // Replace the existing handleSubmit function with this one
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowConfirmDialog(true)
  }

  // Add a new function to handle the actual submission after confirmation
  const confirmSubmit = () => {
    setShowConfirmDialog(false)
    setIsCreating(true)
    setErrorMessage(null)

    startTransition(() => {
      // Only use NFT addresses if access type is TokenGated
      const effectiveNftAddresses = accessType === AccessType.NFTGated ? nftAddresses : []
      const effectiveNftTypes = accessType === AccessType.NFTGated ? nftTypes : []

      try {
        createCookieJar({
          args: [
            jarOwnerAddress,
            supportedCurrency,
            accessType,
            effectiveNftAddresses as readonly `0x${string}`[],
            effectiveNftTypes,
            withdrawalOption,
            parseAmount(fixedAmount),
            parseAmount(maxWithdrawal),
            BigInt(withdrawalInterval || "0"),
            strictPurpose,
            emergencyWithdrawalEnabled,
            oneTimeWithdrawal,
            metadata,
          ],
        })
      } catch (error) {
        console.error("Error creating cookie jar:", error)
        setErrorMessage("Failed to create Cookie Jar. Please try again.")
        setIsCreating(false)
      }
    })
  }

  // Reset form after submission
  const resetForm = () => {
    setJarOwnerAddress(address || "0x0000000000000000000000000000000000000000")
    setSupportedCurrency(ETH_ADDRESS)
    setAccessType(AccessType.Whitelist)
    setWithdrawalOption(WithdrawalTypeOptions.Fixed)
    setFixedAmount("0")
    setMaxWithdrawal("0")
    setWithdrawalInterval("0")
    setStrictPurpose(false)
    setEmergencyWithdrawalEnabled(true)
    setOneTimeWithdrawal(false)
    setMetadata("")
    setNftAddresses([])
    setNftTypes([])
    setCurrentStep(1)
  }

  // Update the useEffect for transaction confirmation to hide the loading overlay
  // Replace the existing useEffect for txConfirmed with this one
  useEffect(() => {
    if (txConfirmed && receipt) {
      // Reset form after successful creation
      setIsCreating(false)
      resetForm()
    }
  }, [txConfirmed, receipt])

  // Update the useEffect for createError to handle transaction rejection
  // Replace the existing useEffect for createError with this one
  useEffect(() => {
    if (createError) {
      console.error("Transaction error:", createError)
      // Simplify the error message to just "Transaction rejected" instead of showing the full error
      setErrorMessage("Transaction rejected")
      setIsCreating(false)
    }
  }, [createError])

  // Navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Helper to format placeholder and description based on currency type
  const getAmountPlaceholder = isEthCurrency ? "0.1 ETH" : "1000 tokens"
  const getAmountDescription = isEthCurrency
    ? "Fixed withdrawal amount in ETH (will be converted to wei)"
    : "Fixed withdrawal amount in token units"

  const getMaxWithdrawalDescription = isEthCurrency
    ? "Maximum withdrawal amount in ETH (will be converted to wei)"
    : "Maximum withdrawal amount in token units"

  // Get step title based on current step
  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Basic Information"
      case 2:
        return "Access Control"
      case 3:
        return "Withdrawal Options"
      case 4:
        return "Additional Features"
      default:
        return ""
    }
  }

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Network */}
            <div className="space-y-2">
              <Label htmlFor="network" className="text-[#3c2a14] text-base">
                Network
              </Label>
              <Select defaultValue="baseSepolia">
                <SelectTrigger className="w-full bg-white border-gray-300 placeholder:text-[#3c2a14]">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baseSepolia">Base Sepolia</SelectItem>
                  <SelectItem value="base" disabled>
                    Base (Coming Soon)
                  </SelectItem>
                  <SelectItem value="optimism" disabled>
                    Optimism (Coming Soon)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-[#8b7355]">Select the network where you want to deploy your jar</p>
            </div>

            {/* Jar Owner */}
            <div className="space-y-2">
              <Label htmlFor="jarOwner" className="text-[#3c2a14] text-base">
                Jar Owner Address
              </Label>
              <Input
                id="jarOwner"
                placeholder="0x... (leave empty to use your address)"
                className="bg-white border-gray-300 placeholder:text-[#3c2a14] text-[#3c2a14]"
                defaultValue=""
                onChange={(e) => {
                  const value = e.target.value
                  if (value === "") {
                    setJarOwnerAddress(address as `0x${string}`)
                  } else {
                    setJarOwnerAddress(value as `0x${string}`)
                  }
                }}
              />
              <p className="text-sm text-[#8b7355]">
                The address that will have owner/admin rights for this cookie jar. Leave empty to use your wallet
                address.
              </p>
            </div>

            {/* Currency Type */}
            <div className="space-y-2">
              <Label className="text-[#3c2a14] text-base">Currency Type</Label>
              <Select
                value={currencyType}
                onValueChange={(value: "eth" | "token") => {
                  if (value === "eth") {
                    setSupportedCurrency(ETH_ADDRESS)
                    setCurrencyType("eth")
                  } else {
                    setCurrencyType("token")
                  }
                }}
              >
                <SelectTrigger className="bg-white border-gray-300 placeholder:text-[#3c2a14]">
                  <SelectValue placeholder="Select currency type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eth">ETH (Native)</SelectItem>
                  <SelectItem value="token">ERC20 Token</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-[#8b7355]">
                {currencyType === "eth"
                  ? "Use native ETH as the currency for this jar"
                  : "Use an ERC20 token as the currency for this jar"}
              </p>
            </div>

            {currencyType === "token" && (
              <div className="space-y-2">
                <Label htmlFor="supportedCurrency" className="text-[#3c2a14] text-base">
                  Token Contract Address
                </Label>
                <Input
                  id="supportedCurrency"
                  placeholder="0x..."
                  className="bg-white border-gray-300 placeholder:text-[#3c2a14] text-[#3c2a14]"
                  defaultValue=""
                  onChange={(e) => {
                    const value = e.target.value
                    setSupportedCurrency(value as `0x${string}`)
                  }}
                />
                <p className="text-sm text-[#8b7355]">Address of the ERC20 token contract</p>
              </div>
            )}

            {/* Metadata */}
            <div className="space-y-2">
              <Label htmlFor="metadata" className="text-[#3c2a14] text-base">
                Jar Description
              </Label>
              <Textarea
                id="metadata"
                placeholder="Provide a description or any additional information"
                className="min-h-24 bg-white border-gray-300 placeholder:text-[#3c2a14] text-[#3c2a14]"
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
              />
              <p className="text-sm text-[#8b7355]">Additional information about this cookie jar</p>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            {/* Access Type */}
            <div className="space-y-2">
              <Label htmlFor="accessType" className="text-[#3c2a14] text-base">
                Access Type
              </Label>
              <Select
                value={accessType.toString()}
                onValueChange={(value) => setAccessType(Number(value) as AccessType)}
              >
                <SelectTrigger className="bg-white border-gray-300 placeholder:text-[#3c2a14]">
                  <SelectValue placeholder="Select access type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Whitelist</SelectItem>
                  <SelectItem value="1">NFT Gated</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-[#8b7355]">Determine who can access this cookie jar</p>
            </div>

            {/* NFT Addresses (only show if NFTGated is selected) */}
            {accessType === AccessType.NFTGated && (
              <div className="space-y-4">
                <Label className="text-[#3c2a14] text-base">NFT Addresses & Types</Label>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-sm text-[#3c2a14]">NFT Address</Label>
                    <Input
                      placeholder="0x..."
                      className="bg-white border-gray-300 placeholder:text-[#3c2a14] text-[#3c2a14]"
                      value={newNftAddress}
                      onChange={(e) => setNewNftAddress(e.target.value)}
                    />
                  </div>
                  <div className="w-32">
                    <Label className="text-sm text-[#3c2a14]">NFT Type</Label>
                    <Select
                      value={newNftType.toString()}
                      onValueChange={(value) => setNewNftType(Number(value) as NFTType)}
                    >
                      <SelectTrigger className="bg-white border-gray-300 placeholder:text-[#3c2a14]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">ERC721</SelectItem>
                        <SelectItem value="1">ERC1155</SelectItem>
                        <SelectItem value="2">SoulBound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addNft}
                    className="border-[#ff5e14] text-[#ff5e14]"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>

                {/* Display list of added NFTs */}
                {nftAddresses.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-[#3c2a14]">Added NFTs:</Label>
                    <div className="space-y-2">
                      {nftAddresses.map((address, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                          <div className="flex-1">
                            <span className="text-sm font-medium text-[#3c2a14]">{address}</span>
                            <span className="text-xs text-[#8b7355] ml-2">
                              ({nftTypes[index] === 0 ? "ERC721" : nftTypes[index] === 1 ? "ERC1155" : "SoulBound"})
                            </span>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeNft(index)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            {/* Withdrawal Option */}
            <div className="space-y-2">
              <Label htmlFor="withdrawalOption" className="text-[#3c2a14] text-base">
                Withdrawal Option
              </Label>
              <Select
                value={withdrawalOption.toString()}
                onValueChange={(value) => setWithdrawalOption(Number(value) as WithdrawalTypeOptions)}
              >
                <SelectTrigger className="bg-white border-gray-300 placeholder:text-[#3c2a14]">
                  <SelectValue placeholder="Select withdrawal option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Fixed</SelectItem>
                  <SelectItem value="1">Variable</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-[#8b7355]">How withdrawals will be handled</p>
            </div>

            {/* Fixed Amount (show if Fixed is selected) */}
            {withdrawalOption === WithdrawalTypeOptions.Fixed && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fixedAmount" className="text-[#3c2a14]">
                    Fixed Withdrawal Amount {isERC20 && `(${tokenSymbol})`}
                  </Label>
                  <Input
                    id="fixedAmount"
                    type="number"
                    value={fixedAmount}
                    onChange={(e) => setFixedAmount(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="any"
                    className="border-[#e2c7a9] focus-visible:ring-[#ff5e14] text-[#3c2a14]"
                  />
                 
                </div>
              </div>
            )}

            {/* Max Withdrawal (show if Variable is selected) */}
            {withdrawalOption === WithdrawalTypeOptions.Variable && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="maxWithdrawal" className="text-[#3c2a14]">
                    Maximum Withdrawal Amount {isERC20 && `(${tokenSymbol})`}
                  </Label>
                  <Input
                    id="maxWithdrawal"
                    type="number"
                    value={maxWithdrawal}
                    onChange={(e) => setMaxWithdrawal(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="any"
                    className="border-[#e2c7a9] focus-visible:ring-[#ff5e14] text-[#3c2a14]"
                  />
                  
                </div>
              </div>
            )}

            {/* Withdrawal Interval */}
            <div className="space-y-2">
              <Label htmlFor="withdrawalInterval" className="text-[#3c2a14] text-base">
                Withdrawal Interval (days)
              </Label>
              <Input
                id="withdrawalInterval"
                type="number"
                placeholder="1"
                className="bg-white border-gray-300 placeholder:text-[#3c2a14] text-[#3c2a14]"
                value={(Number(withdrawalInterval) / 86400).toString()}
                onChange={(e) => {
                  const days = Number.parseFloat(e.target.value)
                  const seconds = isNaN(days) ? "" : (days * 86400).toString()
                  setWithdrawalInterval(seconds)
                }}
              />
              <p className="text-sm text-[#8b7355]">Time between allowed withdrawals</p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            {/* Strict Purpose */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="strictPurpose"
                checked={strictPurpose}
                onCheckedChange={(checked) => setStrictPurpose(checked as boolean)}
                className="border-[#3c2a14] data-[state=checked]:bg-[#ff5e14] data-[state=checked]:border-[#ff5e14]"
              />
              <div className="grid gap-1.5">
                <Label htmlFor="strictPurpose" className="text-[#3c2a14] text-base">
                  Strict Purpose
                </Label>
                <p className="text-sm text-[#8b7355]">Enforce strict purpose for withdrawals</p>
              </div>
            </div>

            {/* Emergency Withdrawal */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emergencyWithdrawal"
                checked={emergencyWithdrawalEnabled}
                onCheckedChange={(checked) => setEmergencyWithdrawalEnabled(checked as boolean)}
                className="border-[#3c2a14] data-[state=checked]:bg-[#ff5e14] data-[state=checked]:border-[#ff5e14]"
              />
              <div className="grid gap-1.5">
                <Label htmlFor="emergencyWithdrawal" className="text-[#3c2a14] text-base">
                  Emergency Withdrawal
                </Label>
                <p className="text-sm text-[#8b7355]">Allow emergency withdrawals by jar owner</p>
              </div>
            </div>

            {/* One Time Withdrawal */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="oneTimeWithdrawal"
                checked={oneTimeWithdrawal}
                onCheckedChange={(checked) => setOneTimeWithdrawal(checked as boolean)}
                className="border-[#3c2a14] data-[state=checked]:bg-[#ff5e14] data-[state=checked]:border-[#ff5e14]"
              />
              <div className="grid gap-1.5">
                <Label htmlFor="oneTimeWithdrawal" className="text-[#3c2a14] text-base">
                  One Time Withdrawal
                </Label>
                <p className="text-sm text-[#8b7355]">If whitelisted users can only withdraw once.</p>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-[#f8f5f0] rounded-lg">
              <h3 className="text-lg font-medium mb-2 text-[#3c2a14]">Cookie Jar Summary</h3>
              <ul className="space-y-2 text-sm">
                <li className="text-[#3c2a14]">
                  <span className="font-medium">Owner:</span>{" "}
                  {jarOwnerAddress === address ? "Your wallet" : jarOwnerAddress}
                </li>
                <li className="text-[#3c2a14]">
                  <span className="font-medium">Currency:</span> {isEthCurrency ? "ETH (Native)" : tokenSymbol}
                </li>
                <li className="text-[#3c2a14]">
                  <span className="font-medium">Access Type:</span>{" "}
                  {accessType === AccessType.Whitelist ? "Whitelist" : "NFT Gated"}
                </li>
                <li className="text-[#3c2a14]">
                  <span className="font-medium">Withdrawal:</span>{" "}
                  {withdrawalOption === WithdrawalTypeOptions.Fixed ? "Fixed" : "Variable"}
                </li>
                <li className="text-[#3c2a14]">
                  <span className="font-medium">Amount:</span>{" "}
                  {withdrawalOption === WithdrawalTypeOptions.Fixed ? `${fixedAmount} ${isERC20 ? tokenSymbol : "ETH"}`: `Up to ${maxWithdrawal} ${isERC20 ? tokenSymbol : "ETH"}`}
                </li>
                <li className="text-[#3c2a14]">
                  <span className="font-medium">Interval:</span> {(Number(withdrawalInterval) / 86400).toString()} days
                </li>
              </ul>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // If not connected, show a message
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] py-10">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-bold text-[#3c2a14] mb-4">Connect Your Wallet</h2>
          <p className="text-lg text-[#8b7355] mb-6">Please connect your wallet to create a Cookie Jar.</p>
          <div className="text-[#8b7355]">Use the connect button in the sidebar to get started.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#2b1d0e] py-10 px-4">
      {/* Header with back button and network info */}
      <div className="max-w-3xl mx-auto mb-10">
        <BackButton className="rounded-full" />
      </div>

      {/* Step indicator */}
      <div className="max-w-3xl mx-auto mb-8 flex justify-center items-center">
        <div className="flex items-center">
          {[1, 2, 3, 4].map((step) => (
            <React.Fragment key={step}>
              {step > 1 && <div className={`w-12 h-[2px] ${currentStep >= step ? "bg-[#ff5e14]" : "bg-gray-300"}`} />}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep === step
                    ? "bg-[#ff5e14] text-white"
                    : currentStep > step
                      ? "bg-[#ff5e14] text-white"
                      : "bg-gray-300 text-gray-600"
                }`}
              >
                {step}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main form card */}
      <Card className="max-w-3xl mx-auto bg-white shadow-xl">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl text-[#3c2a14]">{getStepTitle()}</CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderStep()}

            {/* Transaction status */}
            {isSubmitted && !txConfirmed && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <div>
                  <p className="font-medium">Transaction Submitted</p>
                  <p className="text-sm">Your transaction has been submitted. Waiting for confirmation...</p>
                </div>
              </div>
            )}

            {txConfirmed && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <div>
                  <p className="font-medium">Cookie Jar Created!</p>
                  <p className="text-sm">Your cookie jar has been created successfully.</p>
                </div>
              </div>
            )}
          </form>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-4">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={isCreating || isWaitingForReceipt}
              className="border-[#ff5e14] text-[#ff5e14] hover:bg-[#ff5e14] hover:text-[#3c2a14] transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
          ) : (
            <div></div> // Empty div to maintain layout
          )}

          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={isCreating || isWaitingForReceipt}
              className="bg-[#ff5e14] hover:bg-[#e54d00] text-white"
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-[#ff5e14] hover:bg-[#e54d00] text-white"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Cookie Jar
            </Button>
          )}
        </CardFooter>
      </Card>

      {showConfirmDialog && (
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Cookie Jar Creation</DialogTitle>
              <DialogDescription>
                Please review your jar configuration before proceeding. Once created, most settings cannot be changed.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="bg-[#fff8f0] p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2 text-[#3c2a14]">Cookie Jar Summary</h3>
                <ul className="space-y-2 text-sm">
                  <li className="text-[#3c2a14]">
                    <span className="font-medium">Owner:</span>{" "}
                    {jarOwnerAddress === address ? "Your wallet" : jarOwnerAddress}
                  </li>
                  <li className="text-[#3c2a14]">
                    <span className="font-medium">Currency:</span> {isEthCurrency ? "ETH (Native)" : `${tokenSymbol}`}
                  </li>
                  <li className="text-[#3c2a14]">
                    <span className="font-medium">Access Type:</span>{" "}
                    {accessType === AccessType.Whitelist ? "Whitelist" : "NFT Gated"}
                  </li>
                  <li className="text-[#3c2a14]">
                    <span className="font-medium">Withdrawal:</span>{" "}
                    {withdrawalOption === WithdrawalTypeOptions.Fixed ? "Fixed" : "Variable"}
                  </li>
                  <li className="text-[#3c2a14]">
                    <span className="font-medium">Amount:</span>{" "}
                    {withdrawalOption === WithdrawalTypeOptions.Fixed 
                      ? `${fixedAmount} ${isERC20 ? tokenSymbol : "ETH"}` 
                      : `Up to ${maxWithdrawal} ${isERC20 ? tokenSymbol : "ETH"}`}
                  </li>
                  <li className="text-[#3c2a14]">
                    <span className="font-medium">Interval:</span> {(Number(withdrawalInterval) / 86400).toString()}{" "}
                    days
                  </li>
                </ul>
              </div>
            </div>
            <DialogFooter className="flex justify-between sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                className="border-[#ff5e14] text-[#ff5e14] hover:bg-[#fff0e0]"
              >
                Go Back
              </Button>
              <Button type="button" onClick={confirmSubmit} className="bg-[#ff5e14] hover:bg-[#e54d00] text-white">
                Create Cookie Jar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Loading overlay */}
      <LoadingOverlay isOpen={isCreating} message="Creating your Cookie Jar..." onClose={() => setIsCreating(false)} />

      {/* Error message */}
      {errorMessage && (
        <Dialog open={!!errorMessage} onOpenChange={() => setErrorMessage(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-red-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                Transaction Failed
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-white font-bold">{errorMessage}</p>
              <p className="text-[#8b7355] mt-2 text-sm">Please try again or check your wallet for more details.</p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="bg-[#ff5e14] hover:bg-[#e54d00] text-white"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
