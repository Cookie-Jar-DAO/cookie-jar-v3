import { z } from "zod"
import { isAddress } from "viem"

// Ethereum address validation schema
export const ethereumAddressSchema = z
  .string()
  .refine((address) => isAddress(address), { message: "Invalid Ethereum address format" })

// ETH amount validation schema
export const ethAmountSchema = z
  .string()
  .refine((val) => !isNaN(Number(val)) && Number(val) > 0, { message: "Please enter a valid amount greater than 0" })

// Time interval validation schema
export const timeIntervalSchema = z
  .object({
    days: z.string().transform((val) => Number(val) || 0),
    hours: z.string().transform((val) => Number(val) || 0),
    minutes: z.string().transform((val) => Number(val) || 0),
    seconds: z.string().transform((val) => Number(val) || 0),
  })
  .refine((val) => val.days + val.hours + val.minutes + val.seconds > 0, {
    message: "Please enter a valid interval greater than 0",
  })

// Helper function to validate Ethereum addresses
export const validateEthereumAddress = (address: string): boolean => {
  try {
    ethereumAddressSchema.parse(address)
    return true
  } catch (error) {
    return false
  }
}

// Helper function to validate ETH amounts
export const validateEthAmount = (amount: string): boolean => {
  try {
    ethAmountSchema.parse(amount)
    return true
  } catch (error) {
    return false
  }
}

// Helper function to calculate total seconds from time components
export const calculateTotalSeconds = (days: number, hours: number, minutes: number, seconds: number): number => {
  return days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds
}

// Helper function to format time components to a readable string
export const formatTimeString = (days: number, hours: number, minutes: number, seconds: number): string => {
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
