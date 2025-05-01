import { useReadContracts } from "wagmi"
import { parseUnits, formatUnits, erc20Abi, isAddress, ethAddress } from "viem"
import type { Address } from "viem"

// Known address constants
export const ETH_ADDRESS = "0x0000000000000000000000000000000000000003"

// Update the useTokenInfo hook to provide better fallback values and error handling

/**
 * Hook to fetch token information (symbol and decimals)
 * @param tokenAddress The address of the ERC20 token
 * @returns Token information including symbol, decimals, and error states
 */
export function useTokenInfo(tokenAddress: Address) {
  const isERC20 = isAddress(tokenAddress) && tokenAddress !== ETH_ADDRESS

  const { data: tokenInfo, isLoading } = useReadContracts({
    contracts: [
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "symbol",
      },
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "decimals",
      },
    ],
    query: {
      enabled: !!isERC20,
    },
  })

  // For ETH, use default values
  if (tokenAddress === ethAddress || tokenAddress === ETH_ADDRESS) {
    return {
      symbol: "ETH",
      decimals: 18,
      isERC20: false,
      isEth: true,
      error: false,
      errorMessage: "",
      isLoading: false,
    }
  }

  // Check if we have valid token data
  const hasSymbol = tokenInfo?.[0]?.result !== undefined
  const hasDecimals = tokenInfo?.[1]?.result !== undefined
  const error = isERC20 && (!hasSymbol || !hasDecimals) && !isLoading

  // Use better fallback values
  const symbol = hasSymbol ? (tokenInfo[0].result as string) : isLoading ? "..." : "Token"
  const decimals = hasDecimals ? Number(tokenInfo[1].result) : 18 // Default to 18 decimals as most tokens use this

  // Generate appropriate error message
  let errorMessage = ""
  if (error) {
    if (!hasSymbol && !hasDecimals) {
      errorMessage = "Invalid ERC20 token address or contract doesn't implement ERC20 standard"
    } else if (!hasSymbol) {
      errorMessage = "Token contract doesn't implement symbol() method"
    } else if (!hasDecimals) {
      errorMessage = "Token contract doesn't implement decimals() method"
    }
  }

  return {
    symbol,
    decimals,
    isERC20,
    isEth: false,
    error,
    errorMessage,
    isLoading,
  }
}

/**
 * Format amount for display using the token decimals
 * @param amount The amount in smallest unit (wei, satoshi, etc)
 * @param decimals The number of decimals for the token
 * @param symbol The token symbol
 * @param maxDecimals Maximum number of decimals to display
 * @returns Formatted amount string with symbol
 */
export function formatTokenAmount(amount: bigint | undefined, decimals: number, symbol: string, maxDecimals = 4) {
  if (!amount) return `0 ${symbol}`

  try {
    const formatted = formatUnits(amount, decimals)
    return `${Number(formatted).toFixed(maxDecimals)} ${symbol}`
  } catch (error) {
    console.error("Error formatting amount:", error)
    return `${amount || 0} ${symbol}`
  }
}

/**
 * Parse user input amount considering token decimals
 * @param amountStr User input amount as string
 * @param decimals Number of decimals for the token
 * @returns Amount in smallest unit as BigInt
 */
export function parseTokenAmount(amountStr: string, decimals: number) {
  if (!amountStr || amountStr === "0") return BigInt(0)
  return parseUnits(amountStr, decimals) || BigInt(0)
}

/**
 * Validates if a string value represents a valid number with decimal places that don't exceed the token's decimal precision
 * @param value The string value to validate
 * @param tokenDecimals The number of decimal places allowed for the token
 * @returns Object with validated value and error message if applicable
 */
export function checkDecimals(value: string, tokenDecimals: number): { value: string | null; error: string | null } {
  if (value === "") {
    return { value, error: null }
  }

  if (/^[0-9]*\.?[0-9]*$/.test(value)) {
    // Validate that the number of decimal places doesn't exceed the token's decimal precision
    const parts = value.split(".")
    if (
      parts.length === 1 || // No decimal point
      parts[1].length <= tokenDecimals // Has decimal point but not exceeding max decimals
    ) {
      return { value, error: null }
    } else {
      // Too many decimal places
      return {
        value: null,
        error: `You entered too many decimal places. This token only allows ${tokenDecimals} decimals.`,
      }
    }
  }

  return { value: null, error: "Please enter a valid number." }
}
