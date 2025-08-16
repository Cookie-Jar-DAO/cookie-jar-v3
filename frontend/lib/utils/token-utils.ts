import { useReadContracts } from 'wagmi';
import { parseUnits, formatUnits, erc20Abi, isAddress } from 'viem';
import type { Address } from 'viem';
import { log } from 'console';
import { useChainId } from 'wagmi';
import { getNativeCurrency } from '@/config/supported-networks';

// Known address constants
export const ETH_ADDRESS = "0x0000000000000000000000000000000000000003";

/**
 * Hook to fetch token information (symbol and decimals)
 * @param tokenAddress The address of the ERC20 token
 * @returns Token information including symbol, decimals, and error states
 */
export function useTokenInfo(tokenAddress: Address) {
  const chainId = useChainId();
  const nativeCurrency = getNativeCurrency(chainId);
  const isERC20 = isAddress(tokenAddress) && tokenAddress !== ETH_ADDRESS;

  const { data: tokenInfo } = useReadContracts({
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
  });

  // For native currency, use chain-specific values
  if (tokenAddress === ETH_ADDRESS) {
    return {
      symbol: nativeCurrency.symbol,
      decimals: nativeCurrency.decimals,
      isERC20: false,
      isEth: true,
      error: false,
      errorMessage: ""
    };
  }

  // Check if we have valid token data
  const hasSymbol = tokenInfo?.[0]?.result !== undefined;
  const hasDecimals = tokenInfo?.[1]?.result !== undefined;
  const error = isERC20 && (!hasSymbol || !hasDecimals);
  const symbol = hasSymbol ? (tokenInfo[0].result as string) : "ERROR";
  const decimals = hasDecimals ? Number(tokenInfo[1].result) : 0;

  // Generate appropriate error message
  let errorMessage = "";
  if (error) {
    if (!hasSymbol && !hasDecimals) {
      errorMessage = "Invalid ERC20 token address or contract doesn't implement ERC20 standard";
    } else if (!hasSymbol) {
      errorMessage = "Token contract doesn't implement symbol() method";
    } else if (!hasDecimals) {
      errorMessage = "Token contract doesn't implement decimals() method";
    }
  }

  return {
    symbol,
    decimals,
    isERC20,
    isEth: false,
    error,
    errorMessage
  };
}

/**
 * Format amount for display using the token decimals
 * @param amount The amount in smallest unit (wei, satoshi, etc)
 * @param decimals The number of decimals for the token
 * @param symbol The token symbol
 * @param maxDecimals Maximum number of decimals to display
 * @returns Formatted amount string with symbol
 */
export function formatTokenAmount(
  amount: bigint | undefined,
  decimals: number,
  symbol: string,
  maxDecimals: number = 4
) {
  if (!amount) return `0 ${symbol}`;

  try {
    const formatted = formatUnits(amount, decimals);
    return `${Number(formatted).toFixed(maxDecimals)} ${symbol}`;
  } catch (error) {
    console.error("Error formatting amount:", error);
    return `${amount || 0} ${symbol}`;
  }
}

/**
 * Parse user input amount considering token decimals
 * @param amountStr User input amount as string
 * @param decimals Number of decimals for the token
 * @returns Amount in smallest unit as BigInt
 */
export function parseTokenAmount(amountStr: string, decimals: number) {
  if (!amountStr || amountStr === "0") return BigInt(0);
  return parseUnits(amountStr, decimals) || BigInt(0);
}

/**
 * Validates if a string value represents a valid number with decimal places that don't exceed the token's decimal precision
 * @param value The string value to validate
 * @param tokenDecimals The number of decimal places allowed for the token
 * @returns Object with validated value and error message if applicable
 */
export function checkDecimals(value: string, tokenDecimals: number): { value: string | null; error: string | null } {
  if (value === "") {
    return { value, error: null };
  }

  if (/^[0-9]*\.?[0-9]*$/.test(value)) {
    // Validate that the number of decimal places doesn't exceed the token's decimal precision
    const parts = value.split('.');
    if (
      parts.length === 1 || // No decimal point
      parts[1].length <= tokenDecimals // Has decimal point but not exceeding max decimals
    ) {
      return { value, error: null };
    } else {
      // Too many decimal places
      return {
        value: null,
        error: `You entered too many decimal places. This token only allows ${tokenDecimals} decimals.`
      };
    }
  }

  return { value: null, error: "Please enter a valid number." };
}
