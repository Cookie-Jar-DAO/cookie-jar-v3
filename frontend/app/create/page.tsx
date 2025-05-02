"use client"

import type React from "react"
import { useState, useTransition, useEffect } from "react"
import { cookieJarFactoryAbi } from "@/generated"
import { useWaitForTransactionReceipt, useAccount, useChainId, useWriteContract } from "wagmi"
import { parseEther } from "viem"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Loader2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  PlusCircle,
  Trash2,
  AlertCircle,
  Info,
  Shield,
  Coins,
  Users,
  Clock,
  Settings,
  ChevronRight,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { LoadingOverlay } from "@/components/design/loading-overlay"
import { BackButton } from "@/components/design/back-button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/design/use-toast"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { keccak256, toUtf8Bytes } from "ethers"
import { z } from "zod"
import { isAddress } from "viem"
import { contractAddresses } from "@/config/supported-networks"

// Import token utilities
import { ETH_ADDRESS, useTokenInfo, parseTokenAmount } from "@/lib/utils/token-utils"

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

// Replace the isValidEthAddress function with a Zod schema
const ethereumAddressSchema = z
  .string()
  .refine((address) => isAddress(address), { message: "Invalid Ethereum address format" })

// Create a schema for the form data
const jarFormSchema = z.object({
  jarName: z.string().min(1, "Jar name is required"),
  metadata: z.string().min(20, "Description must be at least 20 characters"),
  jarOwnerAddress: ethereumAddressSchema,
  supportedCurrency: z.union([
    z.literal("0x0000000000000000000000000000000000000003"), // ETH address
    ethereumAddressSchema, // ERC20 token address
  ]),
  accessType: z.enum(["0", "1"]),
  withdrawalOption: z.enum(["0", "1"]),
  fixedAmount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, { message: "Please enter a valid amount greater than 0" }),
  maxWithdrawal: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, { message: "Please enter a valid amount greater than 0" }),
  withdrawalInterval: z
    .object({
      days: z.string().transform((val) => Number(val) || 0),
      hours: z.string().transform((val) => Number(val) || 0),
      minutes: z.string().transform((val) => Number(val) || 0),
      seconds: z.string().transform((val) => Number(val) || 0),
    })
    .refine((val) => val.days + val.hours + val.minutes + val.seconds > 0, {
      message: "Please enter a valid interval greater than 0",
    }),
  strictPurpose: z.boolean(),
  emergencyWithdrawalEnabled: z.boolean(),
  oneTimeWithdrawal: z.boolean(),
  nftGates: z
    .array(
      z.object({
        address: ethereumAddressSchema,
        type: z.number(),
      }),
    )
    .optional(),
})

// Validation functions
const isValidDescription = (description: string): boolean => {
  return description.length >= 20
}

// Calculate total seconds from days, hours, minutes, seconds
const calculateTotalSeconds = (days: number, hours: number, minutes: number, seconds: number): number => {
  return days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds
}

// Format time components to a readable string
const formatTimeString = (days: number, hours: number, minutes: number, seconds: number): string => {
  const parts = []

  if (days > 0) {
    parts.push(`${days} day${days !== 1 ? "s" : ""}`)
  }

  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`)
  }

  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`)
  }

  if (seconds > 0) {
    parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`)
  }

  if (parts.length === 0) {
    return "0 seconds"
  }

  return parts.join(", ")
}

// Function to validate Ethereum address format
const isValidEthAddress = (address: string): boolean => {
  try {
    ethereumAddressSchema.parse(address)
    return true
  } catch (error) {
    return false
  }
}

// Update the parseAmount function to handle undefined tokenDecimals by adding a fallback value

export default function CreateCookieJarForm() {
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5
  const { toast } = useToast()
  const router = useRouter()

  // Form state
  const [jarOwnerAddress, setJarOwnerAddress] = useState<`0x${string}`>("0x0000000000000000000000000000000000000000")
  const [supportedCurrency, setSupportedCurrency] = useState<`0x${string}`>(ETH_ADDRESS)
  const [accessType, setAccessType] = useState<AccessType>(AccessType.Whitelist)
  const [withdrawalOption, setWithdrawalOption] = useState<WithdrawalTypeOptions>(WithdrawalTypeOptions.Fixed)
  const [fixedAmount, setFixedAmount] = useState("0.1")
  const [maxWithdrawal, setMaxWithdrawal] = useState("1")
  const [withdrawalDays, setWithdrawalDays] = useState("0")
  const [withdrawalHours, setWithdrawalHours] = useState("0")
  const [withdrawalMinutes, setWithdrawalMinutes] = useState("0")
  const [withdrawalSeconds, setWithdrawalSeconds] = useState("0")
  const [strictPurpose, setStrictPurpose] = useState(false)
  const [emergencyWithdrawalEnabled, setEmergencyWithdrawalEnabled] = useState(true)
  const [oneTimeWithdrawal, setOneTimeWithdrawal] = useState(false)
  const [metadata, setMetadata] = useState("")
  const [jarName, setJarName] = useState("")
  const { isConnected, address } = useAccount()

  // NFT management
  const [nftAddresses, setNftAddresses] = useState<string[]>([])
  const [nftTypes, setNftTypes] = useState<number[]>([])
  const [newNftAddress, setNewNftAddress] = useState("")
  const [newNftType, setNewNftType] = useState<number>(NFTType.ERC721)

  // Currency type state
  const [currencyType, setCurrencyType] = useState<"eth" | "token">("eth")

  // Token information using the useTokenInfo hook
  const {
    symbol: tokenSymbol,
    decimals: tokenDecimals,
    isERC20,
    error: tokenError,
    errorMessage: tokenErrorMessage,
  } = useTokenInfo(supportedCurrency)

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Dialog and loading states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Contract write hook
  const {
    writeContract,
    data: txHash,
    isPending: isCreatingContract,
    isSuccess: isSubmitted,
    error: createError,
  } = useWriteContract()

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
  const chainId = useChainId()

  // Get the factory address for the current chain
  const factoryAddress = chainId ? contractAddresses.cookieJarFactory[chainId] : undefined

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
        // For tokens, ensure we have valid token data before attempting to parse
        if (tokenError || tokenDecimals === undefined) {
          throw new Error("Invalid token data: " + (tokenErrorMessage || "Unknown token error"))
        }
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
    if (!newNftAddress) return

    try {
      ethereumAddressSchema.parse(newNftAddress)
      setNftAddresses([...nftAddresses, newNftAddress])
      setNftTypes([...nftTypes, newNftType])
      setNewNftAddress("")
      setErrors({ ...errors, newNftAddress: "" })
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ ...errors, newNftAddress: "Please enter a valid Ethereum address" })
      }
    }
  }

  // Remove an NFT address and type
  const removeNft = (index: number) => {
    setNftAddresses(nftAddresses.filter((_, i) => i !== index))
    setNftTypes(nftTypes.filter((_, i) => i !== index))
  }

  // Update the validateStep function to use Zod validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    // Mark all fields in this step as touched
    const newTouched = { ...touched }

    switch (step) {
      case 1: // Basic Information - Part 1
        try {
          const result = jarFormSchema.pick({ jarName: true, metadata: true }).parse({
            jarName,
            metadata,
          })
          // If validation passes, clear any existing errors
          delete newErrors.jarName
          delete newErrors.metadata
        } catch (error) {
          if (error instanceof z.ZodError) {
            error.errors.forEach((err) => {
              const field = err.path[0] as string
              newErrors[field] = err.message
              newTouched[field] = true
              isValid = false
            })
          }
        }
        break

      case 2: // Basic Information - Part 2
        try {
          // For jarOwnerAddress, we need special handling since it might be the connected wallet
          const ownerAddressToValidate = jarOwnerAddress === address ? address : jarOwnerAddress

          // For supportedCurrency, we need to handle the ETH case
          const currencyToValidate = currencyType === "eth" ? ETH_ADDRESS : supportedCurrency

          const result = jarFormSchema
            .pick({
              jarOwnerAddress: true,
              supportedCurrency: true,
            })
            .parse({
              jarOwnerAddress: ownerAddressToValidate,
              supportedCurrency: currencyToValidate,
            })

          // If validation passes, clear any existing errors
          delete newErrors.jarOwnerAddress
          delete newErrors.supportedCurrency
        } catch (error) {
          if (error instanceof z.ZodError) {
            error.errors.forEach((err) => {
              const field = err.path[0] as string
              newErrors[field] = err.message
              newTouched[field] = true
              isValid = false
            })
          }
        }
        break

      case 3: // Access Control
        if (accessType === AccessType.NFTGated) {
          if (nftAddresses.length === 0) {
            newErrors.nftGates = "Please add at least one NFT gate"
            newTouched.nftGates = true
            isValid = false
          } else {
            // Validate each NFT address
            for (let i = 0; i < nftAddresses.length; i++) {
              try {
                ethereumAddressSchema.parse(nftAddresses[i])
              } catch (error) {
                newErrors.nftGates = "One or more NFT addresses are invalid"
                newTouched.nftGates = true
                isValid = false
                break
              }
            }
          }
        }
        break

      case 4: // Withdrawal Rules
        try {
          // Validate fixed amount or max withdrawal based on withdrawal option
          if (withdrawalOption === WithdrawalTypeOptions.Fixed) {
            const fixedAmountValue = Number(fixedAmount)
            if (isNaN(fixedAmountValue) || fixedAmountValue <= 0) {
              newErrors.fixedAmount = "Fixed amount must be greater than 0"
              newTouched.fixedAmount = true
              isValid = false
            } else {
              delete newErrors.fixedAmount
            }
          } else {
            const maxWithdrawalValue = Number(maxWithdrawal)
            if (isNaN(maxWithdrawalValue) || maxWithdrawalValue <= 0) {
              newErrors.maxWithdrawal = "Maximum withdrawal amount must be greater than 0"
              newTouched.maxWithdrawal = true
              isValid = false
            } else {
              delete newErrors.maxWithdrawal
            }
          }

          // Validate withdrawal interval
          const days = Number(withdrawalDays || 0)
          const hours = Number(withdrawalHours || 0)
          const minutes = Number(withdrawalMinutes || 0)
          const seconds = Number(withdrawalSeconds || 0)

          if (days + hours + minutes + seconds <= 0) {
            newErrors.withdrawalInterval =
              "Withdrawal interval must be greater than 0. Please set at least one time value."
            newTouched.withdrawalDays = true
            newTouched.withdrawalHours = true
            newTouched.withdrawalMinutes = true
            newTouched.withdrawalSeconds = true
            isValid = false
          } else {
            delete newErrors.withdrawalInterval
          }
        } catch (error) {
          if (error instanceof z.ZodError) {
            error.errors.forEach((err) => {
              const field = err.path[0] as string
              if (field === "withdrawalInterval") {
                newErrors.withdrawalInterval = err.message
                newTouched.withdrawalDays = true
                newTouched.withdrawalHours = true
                newTouched.withdrawalMinutes = true
                newTouched.withdrawalSeconds = true
              } else {
                newErrors[field] = err.message
                newTouched[field] = true
              }
              isValid = false
            })
          }
        }
        break

      case 5: // Additional Features
        // No required fields in this step
        break
    }

    setErrors({ ...errors, ...newErrors })
    setTouched({ ...touched, ...newTouched })
    return isValid
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all steps before showing confirmation
    let allValid = true
    for (let i = 1; i <= totalSteps; i++) {
      if (!validateStep(i)) {
        allValid = false
      }
    }

    if (allValid) {
      setShowConfirmDialog(true)
    } else {
      toast({
        title: "Validation Error",
        description: "Please fix all errors before submitting",
        variant: "destructive",
      })
    }
  }

  // Confirm submission
  const confirmSubmit = () => {
    // Don't close the dialog immediately
    // setShowConfirmDialog(false) - removed this line
    setIsCreating(true)
    setErrorMessage(null)

    startTransition(() => {
      // Only use NFT addresses if access type is TokenGated
      const effectiveNftAddresses = accessType === AccessType.NFTGated ? nftAddresses : []
      const effectiveNftTypes = accessType === AccessType.NFTGated ? nftTypes : []

      try {
        // Check if we have a valid factory address for this chain
        if (!factoryAddress) {
          throw new Error(
            `No contract address found for the current network (Chain ID: ${chainId}). Please switch to a supported network.`,
          )
        }

        writeContract({
          address: factoryAddress,
          abi: cookieJarFactoryAbi,
          functionName: "createCookieJar",
          args: [
            jarOwnerAddress,
            supportedCurrency,
            accessType,
            effectiveNftAddresses as readonly `0x${string}`[],
            effectiveNftTypes,
            withdrawalOption,
            parseAmount(fixedAmount),
            parseAmount(maxWithdrawal),
            BigInt(
              calculateTotalSeconds(
                Number(withdrawalDays || "0"),
                Number(withdrawalHours || "0"),
                Number(withdrawalMinutes || "0"),
                Number(withdrawalSeconds || "0"),
              ),
            ),
            strictPurpose,
            emergencyWithdrawalEnabled,
            oneTimeWithdrawal,
            `${jarName}: ${metadata}`, // Combine name and description
          ],
        })

        // Only close the dialog after the transaction is submitted
        if (txHash) {
          setShowConfirmDialog(false)
        }
      } catch (error) {
        console.error("Error creating cookie jar:", error)
        setErrorMessage("Failed to create Cookie Jar. Please try again.")
        setIsCreating(false)
      }
    })
  }

  const resetForm = () => {
    setJarName("")
    setJarOwnerAddress(address || "0x0000000000000000000000000000000000000000")
    setSupportedCurrency(ETH_ADDRESS)
    setAccessType(AccessType.Whitelist)
    setWithdrawalOption(WithdrawalTypeOptions.Fixed)
    setFixedAmount("0.1")
    setMaxWithdrawal("1")
    setWithdrawalDays("0")
    setWithdrawalHours("0")
    setWithdrawalMinutes("0")
    setWithdrawalSeconds("0")
    setStrictPurpose(false)
    setEmergencyWithdrawalEnabled(true)
    setOneTimeWithdrawal(false)
    setMetadata("")
    setNftAddresses([])
    setNftTypes([])
    setCurrentStep(1)
    setErrors({})
    setTouched({})
  }

  // Handle transaction confirmation
  useEffect(() => {
    // Add this line to the beginning of the useEffect for transaction confirmation
    if (isSubmitted) {
      setShowConfirmDialog(false)
    }
    if (txConfirmed && receipt) {
      console.log("Transaction confirmed:", receipt)

      // Extract the created jar address from the transaction receipt
      try {
        // The jar address should be in the logs or events
        if (receipt.logs && receipt.logs.length > 0) {
          // Look through all logs to find the jar creation event
          // The CookieJarCreated event typically has the jar address as the first topic after the event signature
          const createdEvent = receipt.logs.find((log) => {
            // The CookieJarCreated event has the jar address as the first indexed parameter
            return (
              log.topics && log.topics[0] === keccak256(toUtf8Bytes("CookieJarCreated(address,address,string,string)"))
            )
          })

          if (createdEvent && createdEvent.topics && createdEvent.topics[1]) {
            // Extract the jar address from the event topic
            const jarAddress = `0x${createdEvent.topics[1].slice(26).toLowerCase()}`

            console.log("Extracted jar address:", jarAddress)

            toast({
              title: "Success!",
              description: `Your Cookie Jar has been created successfully. Redirecting to your jar...`,
            })

            // Add a small delay before redirecting to ensure the toast is seen
            setTimeout(() => {
              // Redirect to the specific jar page
              router.push(`/jar/${jarAddress}`)
            }, 1500)

            setIsCreating(false)
            resetForm()
            return
          }
        }

        // If we couldn't find the address in the logs, try to get it from the events
        if (receipt.logs && receipt.logs.length > 0) {
          console.log("Trying to extract address from raw logs")

          // The jar address might be in the raw log data
          for (const log of receipt.logs) {
            if (log.data && log.data.length > 66) {
              // Try to extract an address from the data
              // This is a fallback and might not work for all contract implementations
              const dataWithoutPrefix = log.data.slice(2) // Remove '0x'

              // Look for potential addresses in the data (32 bytes chunks)
              for (let i = 0; i < dataWithoutPrefix.length; i += 64) {
                const chunk = dataWithoutPrefix.slice(i, i + 64)
                // Last 20 bytes of a 32 byte chunk could be an address
                const potentialAddress = `0x${chunk.slice(24)}`

                if (potentialAddress.length === 42) {
                  console.log("Found potential jar address in data:", potentialAddress)

                  toast({
                    title: "Success!",
                    description: `Your Cookie Jar has been created successfully. Redirecting to your jar...`,
                  })

                  setTimeout(() => {
                    router.push(`/jar/${potentialAddress}`)
                  }, 1500)

                  setIsCreating(false)
                  resetForm()
                  return
                }
              }
            }
          }
        }

        // If we still couldn't find the address, fall back to the transaction hash
        console.log("Could not extract jar address, using transaction hash for debugging")
        toast({
          title: "Success!",
          description: `Your Cookie Jar has been created, but we couldn't redirect you to it. Going to jars page...`,
        })

        // Log the transaction hash for debugging
        console.log("Transaction hash:", txHash)

        // Fallback to jars listing
        setTimeout(() => {
          router.push("/jars")
        }, 1500)
      } catch (error) {
        console.error("Error extracting jar address:", error)
        toast({
          title: "Success!",
          description: "Your Cookie Jar has been created, but we couldn't redirect you to it. Going to jars page...",
        })

        // Fallback to jars listing
        setTimeout(() => {
          router.push("/jars")
        }, 1500)
      }

      setIsCreating(false)
      resetForm()
    }
  }, [txConfirmed, receipt, toast, router, txHash, isSubmitted])

  // Handle transaction error
  useEffect(() => {
    if (createError) {
      console.error("Transaction error:", createError)
      setErrorMessage("Transaction rejected")
      setIsCreating(false)
    }
  }, [createError])

  // Navigation functions
  const nextStep = () => {
    // Check token error in step 1 when using token currency
    if (currentStep === 1 && currencyType === "token" && tokenError) {
      setErrorMessage("Please enter a valid ERC20 token address before proceeding. " + tokenErrorMessage)
      return
    }

    // Validate the current step before proceeding
    if (!validateStep(currentStep)) {
      // Mark all fields in this step as touched to show validation errors
      const fieldsInStep = getFieldsForStep(currentStep)
      const newTouched = { ...touched }
      fieldsInStep.forEach((field) => {
        newTouched[field] = true
      })
      setTouched(newTouched)

      // Show toast with validation error
      toast({
        title: "Validation Error",
        description: "Please fix all errors before proceeding",
        variant: "destructive",
      })
      return
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Get fields for a specific step (for validation)
  const getFieldsForStep = (step: number): string[] => {
    switch (step) {
      case 1:
        return ["jarName", "metadata"]
      case 2:
        return ["jarOwnerAddress", "supportedCurrency"]
      case 3:
        return accessType === AccessType.NFTGated ? ["nftGates"] : []
      case 4:
        return withdrawalOption === WithdrawalTypeOptions.Fixed
          ? ["fixedAmount", "withdrawalInterval"]
          : ["maxWithdrawal", "withdrawalInterval"]
      case 5:
        return []
      default:
        return []
    }
  }

  // Helper to format placeholder and description based on currency type
  const getAmountPlaceholder = isEthCurrency ? "0.1 ETH" : `1000 ${tokenSymbol || "tokens"}`
  const getAmountDescription = isEthCurrency
    ? "Fixed withdrawal amount in ETH (will be converted to wei)"
    : `Fixed withdrawal amount in ${tokenSymbol || "token"} units`

  const getMaxWithdrawalDescription = isEthCurrency
    ? "Maximum withdrawal amount in ETH (will be converted to wei)"
    : `Maximum withdrawal amount in ${tokenSymbol || "token"} units`

  // Get step title based on current step
  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Jar Details"
      case 2:
        return "Ownership & Currency"
      case 3:
        return "Access Control"
      case 4:
        return "Withdrawal Rules"
      case 5:
        return "Additional Features"
      default:
        return ""
    }
  }

  // Get step icon based on current step
  const getStepIcon = () => {
    switch (currentStep) {
      case 1:
        return <Coins className="h-5 w-5 text-[#C3FF00]" />
      case 2:
        return <Shield className="h-5 w-5 text-[#C3FF00]" />
      case 3:
        return <Users className="h-5 w-5 text-[#C3FF00]" />
      case 4:
        return <Clock className="h-5 w-5 text-[#C3FF00]" />
      case 5:
        return <Settings className="h-5 w-5 text-[#C3FF00]" />
      default:
        return null
    }
  }

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1: // Jar Details
        return (
          <div className="space-y-4">
            <div className="bg-[#252525] p-4 rounded-lg mb-4 flex items-start">
              <Info className="h-5 w-5 mr-3 mt-0.5 text-[#C3FF00] flex-shrink-0" />
              <p className="text-white text-sm">
                Start by providing a name and description for your Cookie Jar. This information helps users understand
                the purpose of your jar.
              </p>
            </div>

            {/* Jar Name */}
            <div className="space-y-2">
              <Label htmlFor="jarName" className="text-white text-base flex items-center">
                Jar Name
                <Badge className="ml-2 bg-[#C3FF00] text-black">Required</Badge>
              </Label>
              <Input
                id="jarName"
                placeholder="Team Treasury"
                className="bg-[#252525] border-[#444444] placeholder:text-[#888888] text-white"
                value={jarName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setJarName(e.target.value)
                  if (e.target.value) {
                    setErrors({ ...errors, jarName: "" })
                  }
                }}
                onBlur={() => setTouched({ ...touched, jarName: true })}
              />
              {errors.jarName && touched.jarName && <p className="text-red-500 text-xs">{errors.jarName}</p>}
              <p className="text-sm text-[#AAAAAA]">
                A clear, descriptive name for your jar (e.g., "Team Treasury", "Community Fund")
              </p>
            </div>

            {/* Jar Description */}
            <div className="space-y-2">
              <Label htmlFor="metadata" className="text-white text-base flex items-center">
                Jar Description
                <Badge className="ml-2 bg-[#C3FF00] text-black">Required</Badge>
              </Label>
              <Textarea
                id="metadata"
                placeholder="Provide a detailed description of this jar's purpose (minimum 20 characters)"
                className="min-h-24 bg-[#252525] border-[#444444] placeholder:text-[#888888] text-white"
                value={metadata}
                onChange={(e) => {
                  setMetadata(e.target.value)
                  if (isValidDescription(e.target.value)) {
                    setErrors({ ...errors, metadata: "" })
                  }
                }}
                onBlur={() => setTouched({ ...touched, metadata: true })}
              />
              {errors.metadata && touched.metadata ? (
                <p className="text-red-500 text-xs">{errors.metadata}</p>
              ) : (
                <p className="text-sm text-[#AAAAAA] flex items-center">
                  <span className={metadata.length >= 20 ? "text-green-500" : "text-[#AAAAAA]"}>{metadata.length}</span>
                  <span>/20 characters minimum</span>
                  {metadata.length >= 20 && <CheckCircle2 className="h-4 w-4 text-green-500 ml-2" />}
                </p>
              )}
            </div>
          </div>
        )

      case 2: // Ownership & Currency
        return (
          <div className="space-y-4">
            <div className="bg-[#252525] p-4 rounded-lg mb-4 flex items-start">
              <Info className="h-5 w-5 mr-3 mt-0.5 text-[#C3FF00] flex-shrink-0" />
              <p className="text-white text-sm">
                Configure who will own this jar and what currency it will use. The owner will have full administrative
                rights.
              </p>
            </div>

            {/* Network */}
            <div className="space-y-2">
              <Label htmlFor="network" className="text-white text-base">
                Network
              </Label>
              <Select defaultValue="baseSepolia">
                <SelectTrigger className="w-full bg-[#252525] border-[#444444] placeholder:text-[#888888]">
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
              <p className="text-sm text-[#AAAAAA]">Select the network where you want to deploy your jar</p>
            </div>

            {/* Jar Owner */}
            <div className="space-y-2">
              <Label htmlFor="jarOwner" className="text-white text-base">
                Jar Owner Address
              </Label>
              <Input
                id="jarOwner"
                placeholder="0x..."
                className="bg-[#252525] border-[#444444] placeholder:text-[#888888] text-white"
                value={jarOwnerAddress}
                onChange={(e) => {
                  const value = e.target.value
                  setJarOwnerAddress(value as `0x${string}`)
                  if (value === "" || isValidEthAddress(value)) {
                    setErrors({ ...errors, jarOwnerAddress: "" })
                  }
                }}
                onBlur={() => setTouched({ ...touched, jarOwnerAddress: true })}
              />
              {errors.jarOwnerAddress && touched.jarOwnerAddress ? (
                <p className="text-red-500 text-xs">{errors.jarOwnerAddress}</p>
              ) : (
                <div className="flex items-center">
                  <p className="text-sm text-[#AAAAAA]">
                    {jarOwnerAddress === address ? "Using your connected wallet address" : "Custom owner address"}
                  </p>
                  {isValidEthAddress(jarOwnerAddress as string) && (
                    <CheckCircle2 className="h-4 w-4 text-green-500 ml-2" />
                  )}
                </div>
              )}
              <div className="flex justify-center mt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setJarOwnerAddress(address as `0x${string}`)}
                  className="bg-[#C3FF00] hover:bg-[#d4ff33] text-black"
                >
                  Reset to my wallet address
                </Button>
              </div>
            </div>

            {/* Currency Type */}
            <div className="space-y-2">
              <Label className="text-white text-base">Currency Type</Label>
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
                <SelectTrigger className="bg-[#252525] border-[#444444] placeholder:text-[#888888]">
                  <SelectValue placeholder="Select currency type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eth">ETH (Native)</SelectItem>
                  <SelectItem value="token">ERC20 Token</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-[#AAAAAA]">
                {currencyType === "eth"
                  ? "Use native ETH as the currency for this jar"
                  : "Use an ERC20 token as the currency for this jar"}
              </p>
            </div>

            {currencyType === "token" && (
              <div className="space-y-2">
                <Label htmlFor="supportedCurrency" className="text-white text-base flex items-center">
                  Token Contract Address
                  <Badge className="ml-2 bg-[#C3FF00] text-black">Required</Badge>
                </Label>
                <Input
                  id="supportedCurrency"
                  placeholder="0x..."
                  className="bg-[#252525] border-[#444444] placeholder:text-[#888888] text-white"
                  value={supportedCurrency === ETH_ADDRESS ? "" : supportedCurrency}
                  onChange={(e) => {
                    const value = e.target.value
                    setSupportedCurrency(value as `0x${string}`)
                    if (isValidEthAddress(value)) {
                      setErrors({ ...errors, supportedCurrency: "" })
                    }
                  }}
                  onBlur={() => setTouched({ ...touched, supportedCurrency: true })}
                />
                {errors.supportedCurrency && touched.supportedCurrency ? (
                  <p className="text-red-500 text-xs">{errors.supportedCurrency}</p>
                ) : (
                  <div className="flex items-center">
                    <p className="text-sm text-[#AAAAAA]">Address of the ERC20 token contract</p>
                    {isValidEthAddress(supportedCurrency as string) && supportedCurrency !== ETH_ADDRESS && (
                      <CheckCircle2 className="h-4 w-4 text-green-500 ml-2" />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )

      // The rest of the component code continues...
      // I'll continue with the remaining case statements and the rest of the component

      case 3: // Access Control
        return (
          <div className="space-y-4">
            <div className="bg-[#252525] p-4 rounded-lg mb-4 flex items-start">
              <Info className="h-5 w-5 mr-3 mt-0.5 text-[#C3FF00] flex-shrink-0" />
              <p className="text-white text-sm">
                Choose who can access your jar. You can either use a whitelist of specific addresses or require users to
                own specific NFTs.
              </p>
            </div>

            {/* Access Type */}
            <div className="space-y-2">
              <Label htmlFor="accessType" className="text-white text-base">
                Access Type
              </Label>
              <Select
                value={accessType.toString()}
                onValueChange={(value) => {
                  setAccessType(Number(value) as AccessType)
                  // Clear NFT-related errors when switching to Whitelist
                  if (Number(value) === AccessType.Whitelist) {
                    setErrors({ ...errors, nftGates: "", newNftAddress: "" })
                  }
                }}
              >
                <SelectTrigger className="bg-[#252525] border-[#444444] placeholder:text-[#888888]">
                  <SelectValue placeholder="Select access type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Whitelist</SelectItem>
                  {/* removed NFT Gated option for MVP launch to reduce complexity <3msg */}
                  {/* <SelectItem value="1">NFT Gated</SelectItem> */}
                </SelectContent>
              </Select>
              <p className="text-sm text-[#AAAAAA]">
                {accessType === AccessType.Whitelist
                  ? "Whitelist: Only specific addresses you approve can access the jar"
                  : "NFT Gated: Anyone who owns the specified NFTs can access the jar"}
              </p>
            </div>

            {/* NFT Addresses (only show if NFTGated is selected) */}
            {accessType === AccessType.NFTGated && (
              <div className="space-y-4">
                <Label className="text-white text-base flex items-center">
                  NFT Addresses & Types
                  <Badge className="ml-2 bg-[#C3FF00] text-black">Required</Badge>
                </Label>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-sm text-white">NFT Address</Label>
                    <Input
                      placeholder="0x..."
                      className="bg-[#252525] border-[#444444] placeholder:text-[#888888] text-white"
                      value={newNftAddress}
                      onChange={(e) => setNewNftAddress(e.target.value)}
                    />
                    {errors.newNftAddress && <p className="text-red-500 text-xs mt-1">{errors.newNftAddress}</p>}
                  </div>
                  <div className="w-32">
                    <Label className="text-sm text-white">NFT Type</Label>
                    <Select
                      value={newNftType.toString()}
                      onValueChange={(value) => setNewNftType(Number(value) as NFTType)}
                    >
                      <SelectTrigger className="bg-[#252525] border-[#444444] placeholder:text-[#888888]">
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
                    className="border-[#C3FF00] text-[#C3FF00]"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>

                {/* Display list of added NFTs */}
                {nftAddresses.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    <Label className="text-white">Added NFTs:</Label>
                    <div className="space-y-2">
                      {nftAddresses.map((address, index) => (
                        <div key={index} className="flex items-center justify-between bg-[#444444] p-2 rounded-md">
                          <div className="flex-1">
                            <span className="text-sm font-medium text-white">{address}</span>
                            <span className="text-xs text-[#AAAAAA] ml-2">
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
                ) : (
                  errors.nftGates && touched.nftGates && <p className="text-red-500 text-xs mt-1">{errors.nftGates}</p>
                )}

                <div className="bg-[#444444] p-3 rounded-md">
                  <p className="text-sm text-white">
                    <strong>Note:</strong> You can add up to 5 different NFT gates. Users will need to own at least one
                    of these NFTs to access your jar.
                  </p>
                </div>
              </div>
            )}

            {accessType === AccessType.Whitelist && (
              <div className="bg-[#444444] p-3 rounded-md">
                <p className="text-sm text-white">
                  <strong>Note:</strong> After creating your jar, you'll need to add addresses to the whitelist from the
                  jar's admin panel.
                </p>
              </div>
            )}
          </div>
        )

      case 4: // Withdrawal Rules
        return (
          <div className="space-y-4">
            <div className="bg-[#252525] p-4 rounded-lg mb-4 flex items-start">
              <Info className="h-5 w-5 mr-3 mt-0.5 text-[#C3FF00] flex-shrink-0" />
              <p className="text-white text-sm">
                Configure how withdrawals work. You can set fixed or variable amounts and define how often users can
                withdraw.
              </p>
            </div>

            {/* Withdrawal Option */}
            <div className="space-y-2">
              <Label htmlFor="withdrawalOption" className="text-white text-base">
                Withdrawal Option
              </Label>
              <Select
                value={withdrawalOption.toString()}
                onValueChange={(value) => setWithdrawalOption(Number(value) as WithdrawalTypeOptions)}
              >
                <SelectTrigger className="bg-[#252525] border-[#444444] placeholder:text-[#888888]">
                  <SelectValue placeholder="Select withdrawal option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Fixed</SelectItem>
                  <SelectItem value="1">Variable</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-[#AAAAAA]">
                {withdrawalOption === WithdrawalTypeOptions.Fixed
                  ? "Fixed: Each withdrawal will be for the exact same amount"
                  : "Variable: Users can withdraw any amount up to a maximum limit"}
              </p>
            </div>

            {/* Fixed Amount (show if Fixed is selected) */}
            {withdrawalOption === WithdrawalTypeOptions.Fixed && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fixedAmount" className="text-white text-base flex items-center">
                    Fixed Amount
                    <Badge className="ml-2 bg-[#C3FF00] text-black">Required</Badge>
                  </Label>
                  <Input
                    id="fixedAmount"
                    type="text"
                    placeholder={getAmountPlaceholder}
                    className="bg-[#252525] border-[#444444] placeholder:text-[#888888] text-white"
                    value={fixedAmount}
                    onChange={(e) => {
                      setFixedAmount(e.target.value)
                      if (e.target.value && Number.parseFloat(e.target.value) > 0) {
                        setErrors({ ...errors, fixedAmount: "" })
                      }
                    }}
                    onBlur={() => setTouched({ ...touched, fixedAmount: true })}
                  />
                  {errors.fixedAmount && touched.fixedAmount ? (
                    <p className="text-red-500 text-xs">{errors.fixedAmount}</p>
                  ) : (
                    <p className="text-sm text-[#AAAAAA]">{getAmountDescription}</p>
                  )}
                </div>
              </div>
            )}

            {/* Max Withdrawal (show if Variable is selected) */}
            {withdrawalOption === WithdrawalTypeOptions.Variable && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="maxWithdrawal" className="text-white text-base flex items-center">
                    Maximum Withdrawal
                    <Badge className="ml-2 bg-[#C3FF00] text-black">Required</Badge>
                  </Label>
                  <Input
                    id="maxWithdrawal"
                    type="text"
                    placeholder={getAmountPlaceholder}
                    className="bg-[#252525] border-[#444444] placeholder:text-[#888888] text-white"
                    value={maxWithdrawal}
                    onChange={(e) => {
                      setMaxWithdrawal(e.target.value)
                      if (e.target.value && Number.parseFloat(e.target.value) > 0) {
                        setErrors({ ...errors, maxWithdrawal: "" })
                      }
                    }}
                    onBlur={() => setTouched({ ...touched, maxWithdrawal: true })}
                  />
                  {errors.maxWithdrawal && touched.maxWithdrawal ? (
                    <p className="text-red-500 text-xs">{errors.maxWithdrawal}</p>
                  ) : (
                    <p className="text-sm text-[#AAAAAA]">{getMaxWithdrawalDescription}</p>
                  )}
                </div>
              </div>
            )}

            {/* Withdrawal Interval */}
            <div className="space-y-2">
              <Label htmlFor="withdrawalInterval" className="text-white text-base flex items-center">
                Withdrawal Interval
                <Badge className="ml-2 bg-[#C3FF00] text-black">Required</Badge>
              </Label>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Label htmlFor="withdrawalDays" className="text-sm text-[#AAAAAA]">
                    Days
                  </Label>
                  <Input
                    id="withdrawalDays"
                    type="number"
                    min="0"
                    placeholder="0"
                    className={`bg-[#252525] border-[#444444] placeholder:text-[#888888] text-white ${
                      errors.withdrawalInterval &&
                      (
                        touched.withdrawalDays ||
                          touched.withdrawalHours ||
                          touched.withdrawalMinutes ||
                          touched.withdrawalSeconds
                      )
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                    value={withdrawalDays}
                    onChange={(e) => setWithdrawalDays(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="withdrawalHours" className="text-sm text-[#AAAAAA]">
                    Hours
                  </Label>
                  <Input
                    id="withdrawalHours"
                    type="number"
                    min="0"
                    max="23"
                    placeholder="0"
                    className={`bg-[#252525] border-[#444444] placeholder:text-[#888888] text-white ${
                      errors.withdrawalInterval &&
                      (
                        touched.withdrawalDays ||
                          touched.withdrawalHours ||
                          touched.withdrawalMinutes ||
                          touched.withdrawalSeconds
                      )
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                    value={withdrawalHours}
                    onChange={(e) => setWithdrawalHours(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="withdrawalMinutes" className="text-sm text-[#AAAAAA]">
                    Minutes
                  </Label>
                  <Input
                    id="withdrawalMinutes"
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                    className={`bg-[#252525] border-[#444444] placeholder:text-[#888888] text-white ${
                      errors.withdrawalInterval &&
                      (
                        touched.withdrawalDays ||
                          touched.withdrawalHours ||
                          touched.withdrawalMinutes ||
                          touched.withdrawalSeconds
                      )
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                    value={withdrawalMinutes}
                    onChange={(e) => setWithdrawalMinutes(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="withdrawalSeconds" className="text-sm text-[#AAAAAA]">
                    Seconds
                  </Label>
                  <Input
                    id="withdrawalSeconds"
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                    className={`bg-[#252525] border-[#444444] placeholder:text-[#888888] text-white ${
                      errors.withdrawalInterval &&
                      (
                        touched.withdrawalDays ||
                          touched.withdrawalHours ||
                          touched.withdrawalMinutes ||
                          touched.withdrawalSeconds
                      )
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                    value={withdrawalSeconds}
                    onChange={(e) => setWithdrawalSeconds(e.target.value)}
                  />
                </div>
              </div>

              {errors.withdrawalInterval && <p className="text-red-500 text-xs mt-1">{errors.withdrawalInterval}</p>}
              {!errors.withdrawalInterval && <p className="text-sm text-[#AAAAAA]">Time between allowed withdrawals</p>}
            </div>

            <div className="bg-[#444444] p-3 rounded-md">
              <p className="text-sm text-white">
                <strong>Example:</strong> With a withdrawal interval of 7 days, users must wait one week between
                withdrawals.
              </p>
            </div>
          </div>
        )

      case 5: // Additional Features
        return (
          <div className="space-y-4">
            <div className="bg-[#252525] p-4 rounded-lg mb-4 flex items-start">
              <Info className="h-5 w-5 mr-3 mt-0.5 text-[#C3FF00] flex-shrink-0" />
              <p className="text-white text-sm">
                Configure additional features for your jar. These settings help define how your jar operates and what
                security measures are in place.
              </p>
            </div>

            {/* Strict Purpose */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="strictPurpose"
                checked={strictPurpose}
                onCheckedChange={(checked) => setStrictPurpose(checked as boolean)}
                className="border-white data-[state=checked]:bg-[#C3FF00] data-[state=checked]:border-[#C3FF00] mt-1"
              />
              <div className="grid gap-1.5">
                <Label htmlFor="strictPurpose" className="text-white text-base">
                  Strict Purpose
                </Label>
                <p className="text-sm text-[#AAAAAA]">
                  Require users to provide a detailed explanation for each withdrawal. This helps with transparency and
                  accountability.
                </p>
              </div>
            </div>

            {/* Emergency Withdrawal */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="emergencyWithdrawal"
                checked={emergencyWithdrawalEnabled}
                onCheckedChange={(checked) => setEmergencyWithdrawalEnabled(checked as boolean)}
                className="border-white data-[state=checked]:bg-[#C3FF00] data-[state=checked]:border-[#C3FF00] mt-1"
              />
              <div className="grid gap-1.5">
                <Label htmlFor="emergencyWithdrawal" className="text-white text-base">
                  Emergency Withdrawal
                </Label>
                <p className="text-sm text-[#AAAAAA]">
                  Allow jar admins to withdraw all funds in case of emergency. This is a safety feature but should be
                  used responsibly.
                </p>
              </div>
            </div>

            {/* One Time Withdrawal */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="oneTimeWithdrawal"
                checked={oneTimeWithdrawal}
                onCheckedChange={(checked) => setOneTimeWithdrawal(checked as boolean)}
                className="border-white data-[state=checked]:bg-[#C3FF00] data-[state=checked]:border-[#C3FF00] mt-1"
              />
              <div className="grid gap-1.5">
                <Label htmlFor="oneTimeWithdrawal" className="text-white text-base">
                  One Time Withdrawal
                </Label>
                <p className="text-sm text-[#AAAAAA]">
                  Limit each whitelisted user to a single withdrawal. This is useful for one-time distributions or
                  rewards.
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-[#252525] rounded-lg">
              <h3 className="text-lg font-medium mb-2 text-white">Cookie Jar Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#AAAAAA]">Name:</span>
                    <span className="font-medium text-white">{jarName || "Unnamed Jar"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#AAAAAA]">Owner:</span>
                    <span className="font-medium text-white">
                      {jarOwnerAddress === address
                        ? "Your wallet"
                        : jarOwnerAddress.substring(0, 6) + "..." + jarOwnerAddress.substring(38)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#AAAAAA]">Currency:</span>
                    <span className="font-medium text-white">{isEthCurrency ? "ETH (Native)" : tokenSymbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#AAAAAA]">Access Type:</span>
                    <span className="font-medium text-white">
                      {accessType === AccessType.Whitelist ? "Whitelist" : "NFT Gated"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#AAAAAA]">Withdrawal:</span>
                    <span className="font-medium text-white">
                      {withdrawalOption === WithdrawalTypeOptions.Fixed ? "Fixed" : "Variable"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#AAAAAA]">Amount:</span>
                    <span className="font-medium text-white">
                      {withdrawalOption === WithdrawalTypeOptions.Fixed ? fixedAmount : `Up to ${maxWithdrawal}`}
                      {isEthCurrency ? " ETH" : " Tokens"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#AAAAAA]">Interval:</span>
                    <span className="font-medium text-white">
                      {formatTimeString(
                        Number(withdrawalDays || "0"),
                        Number(withdrawalHours || "0"),
                        Number(withdrawalMinutes || "0"),
                        Number(withdrawalSeconds || "0"),
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#AAAAAA]">Features:</span>
                    <span className="font-medium text-white">
                      {[
                        strictPurpose ? "Purpose Required" : null,
                        emergencyWithdrawalEnabled ? "Emergency Enabled" : null,
                        oneTimeWithdrawal ? "One-Time Only" : null,
                      ]
                        .filter(Boolean)
                        .join(", ") || "None"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Step navigation component
  const StepNavigation = () => {
    const steps = [
      { id: 1, name: "Details", icon: <Coins className="h-5 w-5" /> },
      { id: 2, name: "Ownership", icon: <Shield className="h-5 w-5" /> },
      { id: 3, name: "Access", icon: <Users className="h-5 w-5" /> },
      { id: 4, name: "Withdrawals", icon: <Clock className="h-5 w-5" /> },
      { id: 5, name: "Features", icon: <Settings className="h-5 w-5" /> },
    ]

    return (
      <div className="bg-[#333333] rounded-lg shadow-md p-4 sticky top-0 h-[calc(100vh-8rem)]">
        <h3 className="text-lg font-semibold text-white mb-4 border-b border-[#444444] pb-2">Create Cookie Jar</h3>
        <div className="space-y-1">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => {
                // Only allow navigation to steps that have been completed or are the current step
                if (step.id <= currentStep) {
                  setCurrentStep(step.id)
                }
              }}
              className={cn(
                "w-full flex items-center p-3 rounded-md transition-colors",
                currentStep === step.id
                  ? "bg-[#C3FF00] text-black"
                  : currentStep > step.id
                    ? "bg-[#444444] text-white"
                    : "text-[#AAAAAA]",
                step.id <= currentStep ? "cursor-pointer hover:bg-opacity-90" : "cursor-not-allowed opacity-60",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full mr-3",
                  currentStep === step.id
                    ? "bg-[#333333] text-[#C3FF00]"
                    : currentStep > step.id
                      ? "bg-green-500 text-white"
                      : "bg-[#e0e0e0] text-[#AAAAAA]",
                )}
              >
                {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : step.icon}
              </div>
              <span className="font-medium">{step.name}</span>
              {currentStep === step.id && <ChevronRight className="ml-auto h-5 w-5" />}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // If not connected, show a message
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] py-10 bg-[#1D1D1D]">
        <div className="bg-[#333333] p-8 rounded-xl shadow-lg max-w-md text-center border border-[#444444]">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-lg text-white mb-6">Please connect your wallet to create a Cookie Jar.</p>
          <div className="flex flex-col items-center gap-4">
            <p className="text-[#AAAAAA]">Return to the home page to connect your wallet.</p>
            <Button onClick={() => router.push("/")} className="bg-[#C3FF00] hover:bg-[#d4ff33] text-black">
              Go to Home Page
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Update the main layout structure to use fixed positioning and add scrollable content
  return (
    <div className="h-screen bg-[#1D1D1D] flex flex-col overflow-hidden">
      {/* Header with back button - fixed at top */}
      <div className="p-4 border-b border-[#444444]">
        <div className="max-w-7xl mx-auto">
          <BackButton className="rounded-full" />
        </div>
      </div>

      {/* Main content area - takes remaining height */}
      <div className="flex-1 flex overflow-hidden">
        <div className="max-w-7xl mx-auto w-full flex gap-6 p-4">
          {/* Left sidebar with steps - fixed */}
          <div className="w-72 flex-shrink-0">
            <StepNavigation />
          </div>

          {/* Main form card - fixed with scrollable content */}
          <Card className="flex-1 bg-[#333333] shadow-xl flex flex-col">
            <CardHeader className="border-b border-[#444444] flex-shrink-0">
              <div className="flex items-center">
                {getStepIcon()}
                <CardTitle className="text-2xl text-white ml-2">{getStepTitle()}</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="pt-6 flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6 min-h-full">
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

            <CardFooter className="flex justify-between border-t border-[#444444] pt-4 flex-shrink-0">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={isCreating || isWaitingForReceipt}
                  className="border-[#C3FF00] text-[#C3FF00] hover:bg-[#C3FF00] hover:text-black transition-colors"
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
                  className="bg-[#C3FF00] hover:bg-[#d4ff33] text-black"
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="bg-[#C3FF00] hover:bg-[#d4ff33] text-black"
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Cookie Jar
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Confirmation dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md bg-[#333333] text-white border-[#444444]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Confirm Cookie Jar Creation</DialogTitle>
            <DialogDescription className="text-[#AAAAAA]">
              Please review your jar configuration before proceeding. Once created, most settings cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="bg-[#252525] p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4 text-white border-b border-[#444444] pb-2">Cookie Jar Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#AAAAAA] font-medium">Name:</span>
                  <span className="font-medium text-white">{jarName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#AAAAAA] font-medium">Owner:</span>
                  <span className="font-medium text-white">
                    {jarOwnerAddress === address ? "Your wallet" : jarOwnerAddress}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#AAAAAA] font-medium">Currency:</span>
                  <span className="font-medium text-white">{isEthCurrency ? "ETH (Native)" : tokenSymbol}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#AAAAAA] font-medium">Access Type:</span>
                  <span className="font-medium text-white">
                    {accessType === AccessType.Whitelist ? "Whitelist" : "NFT Gated"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#AAAAAA] font-medium">Withdrawal:</span>
                  <span className="font-medium text-white">
                    {withdrawalOption === WithdrawalTypeOptions.Fixed ? "Fixed" : "Variable"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#AAAAAA] font-medium">Amount:</span>
                  <span className="font-medium text-white">
                    {withdrawalOption === WithdrawalTypeOptions.Fixed ? fixedAmount : `Up to ${maxWithdrawal}`}
                    {isEthCurrency ? " ETH" : ` ${tokenSymbol || "Tokens"}`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#AAAAAA] font-medium">Interval:</span>
                  <span className="font-medium text-white">
                    {formatTimeString(
                      Number(withdrawalDays || "0"),
                      Number(withdrawalHours || "0"),
                      Number(withdrawalMinutes || "0"),
                      Number(withdrawalSeconds || "0"),
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#AAAAAA] font-medium">Features:</span>
                  <span className="font-medium text-white">
                    {[
                      strictPurpose ? "Purpose Required" : null,
                      emergencyWithdrawalEnabled ? "Emergency Enabled" : null,
                      oneTimeWithdrawal ? "One-Time Only" : null,
                    ]
                      .filter(Boolean)
                      .join(", ") || "None"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="border-[#C3FF00] text-[#C3FF00] hover:bg-[#252525] flex-1"
            >
              Go Back
            </Button>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                confirmSubmit()
              }}
              className="bg-[#C3FF00] hover:bg-[#d4ff33] text-black flex-1"
            >
              Create Cookie Jar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loading overlay */}
      <LoadingOverlay isOpen={isCreating} message="Creating your Cookie Jar..." onClose={() => setIsCreating(false)} />

      {/* Error message */}
      {errorMessage && (
        <Dialog open={!!errorMessage} onOpenChange={() => setErrorMessage(null)}>
          <DialogContent className="sm:max-w-md bg-[#333333] text-white border-[#444444]">
            <DialogHeader>
              <DialogTitle className="flex items-center text-red-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                Transaction Failed
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-white font-bold">{errorMessage}</p>
              <p className="text-[#AAAAAA] mt-2 text-sm">Please try again or check your wallet for more details.</p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="bg-[#C3FF00] hover:bg-[#d4ff33] text-black"
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
