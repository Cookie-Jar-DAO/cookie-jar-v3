import type { Chain } from 'wagmi/chains'
import { supportedChains } from '@/config/supported-networks'

/**
 * Gets the chain object for a given chain ID
 * @param chainId The chain ID to find
 * @returns The chain object or undefined if not found
 */
function getChainById(chainId: number): Chain | undefined {
  return supportedChains.find(chain => chain.id === chainId)
}

/**
 * Gets the network name for a given chain ID
 * @param chainId The chain ID to find
 * @returns The network name or 'Unknown Network' if not found
 */
export function getNetworkName(chainId: number): string {
  const chain = getChainById(chainId)
  return chain?.name || 'Unknown Network'
}

/**
 * Gets the block explorer URL for an address based on the chain ID
 * @param address The address to link to
 * @param chainId The current chain ID
 * @returns The full block explorer URL for the address
 */
export function getExplorerAddressUrl(address: string, chainId: number): string {
  const chain = getChainById(chainId)
  
  // Use the chain's block explorer URL if available
  if (chain?.blockExplorers?.default) {
    return `${chain.blockExplorers.default.url}/address/${address}`
  }
  
  // Fallback to Ethereum mainnet if chain not found or has no explorer
  return `https://etherscan.io/address/${address}`
}

/**
 * Gets the block explorer URL for a transaction based on the chain ID
 * @param txHash The transaction hash to link to
 * @param chainId The current chain ID
 * @returns The full block explorer URL for the transaction
 */
export function getExplorerTxUrl(txHash: string, chainId: number): string {
  const chain = getChainById(chainId)
  
  // Use the chain's block explorer URL if available
  if (chain?.blockExplorers?.default) {
    return `${chain.blockExplorers.default.url}/tx/${txHash}`
  }
  
  // Fallback to Ethereum mainnet if chain not found or has no explorer
  return `https://etherscan.io/tx/${txHash}`
}
