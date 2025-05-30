"use client"

import type React from "react"
import type { Address } from "viem"

// Import token utilities
import { ETH_ADDRESS, useTokenInfo, formatTokenAmount } from "@/lib/utils/token-utils"

// Export the Withdrawal interface so it can be imported elsewhere
export interface Withdrawal {
  amount: bigint
  purpose: string
  recipient: string
}

interface WithdrawalHistorySectionProps {
  pastWithdrawals?: Withdrawal[]
  tokenAddress?: Address // New prop to specify token address
}

export const WithdrawalHistorySection: React.FC<WithdrawalHistorySectionProps> = ({ 
  pastWithdrawals = [],
  tokenAddress = ETH_ADDRESS // Default to ETH if not provided
}) => {
  // Get token info (symbol and decimals) using the hook
  const { symbol: tokenSymbol, decimals: tokenDecimals } = useTokenInfo(tokenAddress)

  return (
    <div className="mt-6">
      <h1 className="text-lg font-semibold mb-2">Past Withdrawals from this Jar</h1>
      {pastWithdrawals.length > 0 ? (
        <ul className="space-y-4">
          {[...pastWithdrawals].reverse().map((withdrawal, index) => (
            <li key={index} className="border border-[#f0e6d8] p-4 rounded-lg bg-[#fff8f0]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-medium text-[#3c2a14]">
                    <span className="text-[#3c2a14]">Amount:</span>{" "}
                    <span className="text-[#ff5e14]">{formatTokenAmount(withdrawal.amount, tokenDecimals, tokenSymbol, 6)}</span>
                  </p>
                </div>
                <div>
                  <p className="font-medium text-[#3c2a14]">
                    <span className="text-[#3c2a14]">Purpose:</span>{" "}
                    <span className="text-[#8b7355]">{withdrawal.purpose || "No purpose provided"}</span>
                  </p>
                </div>
                <div>
                  <p className="font-medium text-[#3c2a14]">
                    <span className="text-[#3c2a14]">Recipient:</span>{" "}
                    <span className="text-[#8b7355]">{withdrawal.recipient || "No withdrawal address provided"}</span>
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8 text-[#8b7355] bg-[#fff8f0] rounded-lg border border-[#f0e6d8]">
          No withdrawal history available
        </div>
      )}
    </div>
  )
}
