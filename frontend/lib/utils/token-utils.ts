import { useReadContracts } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

// ERC20 ABI fragments for reading token info
export const erc20ABI = [
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Known address constants
export const ETH_ADDRESS = "0x0000000000000000000000000000000000000003";

/**
 * Hook to fetch token information (symbol and decimals)
 * @param tokenAddress The address of the ERC20 token
 * @returns Token information including symbol and decimals
 */
export function useTokenInfo(tokenAddress?: `0x${string}`) {
  const isERC20 = tokenAddress && tokenAddress !== ETH_ADDRESS;
  
  const { data: tokenInfo } = useReadContracts({
    contracts: [
      {
        address: isERC20 ? tokenAddress : undefined,
        abi: erc20ABI,
        functionName: "symbol",
      },
      {
        address: isERC20 ? tokenAddress : undefined,
        abi: erc20ABI,
        functionName: "decimals",
      },
    ],
    query: {
      enabled: !!isERC20,
    },
  });

  // Default values and process results
  const symbol = isERC20 ? 
    (tokenInfo?.[0]?.result as string || "TOKEN") : 
    "ETH";
  
  const decimals = isERC20 ? 
    (tokenInfo?.[1]?.result ? Number(tokenInfo[1].result) : 18) : 
    18;

  return {
    symbol,
    decimals,
    isERC20,
    isEth: !isERC20 || tokenAddress === ETH_ADDRESS,
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
): string {
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
export function parseTokenAmount(amountStr: string, decimals: number): bigint {
  if (!amountStr || amountStr === "0") return BigInt(0);

  try {
    return parseUnits(amountStr || "0", decimals);
  } catch (error) {
    console.error("Error parsing amount:", error);
    return BigInt(0);
  }
}
