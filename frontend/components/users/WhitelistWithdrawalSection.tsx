"use client"

// WhitelistWithdrawalSection.tsx
import type React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowUpToLine } from "lucide-react"
import { ETH_ADDRESS, useTokenInfo, parseTokenAmount, formatTokenAmount } from "@/lib/utils/token-utils"

interface WhitelistWithdrawalSectionProps {
  config: any // Ideally this would be more specifically typed
  withdrawPurpose: string
  setWithdrawPurpose: (value: string) => void
  withdrawAmount: string
  setWithdrawAmount: (value: string) => void
  handleWithdrawWhitelist: () => void
  handleWithdrawWhitelistVariable: () => void
}

export const WhitelistWithdrawalSection: React.FC<WhitelistWithdrawalSectionProps> = ({
  config,
  withdrawPurpose,
  setWithdrawPurpose,
  withdrawAmount,
  setWithdrawAmount,
  handleWithdrawWhitelist,
  handleWithdrawWhitelistVariable,
}) => {
  // Get token information using the token utils
  const { symbol: tokenSymbol, decimals: tokenDecimals } = useTokenInfo(
    config?.currency !== ETH_ADDRESS ? config?.currency : undefined
  );
  // Fixed amount withdrawal with purpose
  if (config.strictPurpose && config.withdrawalOption === "Fixed") {
    return (
      <div className="space-y-6 py-4">
        <div className="space-y-3">
          <label htmlFor="withdrawPurpose" className="block text-[#ff5e14] font-medium text-lg">
            Withdrawal Purpose
          </label>
          <Textarea
            id="withdrawPurpose"
            placeholder="Enter the purpose of your withdrawal (required)"
            value={withdrawPurpose}
            onChange={(e) => setWithdrawPurpose(e.target.value)}
            className="min-h-32 border-[#f0e6d8] bg-white text-[#3c2a14]"
          />
          <p className="text-sm text-[#8b7355]">Please provide a detailed explanation for this withdrawal</p>
        </div>

        <div className="pt-4">
          <Button
            onClick={handleWithdrawWhitelist}
            className="w-full bg-[#ff5e14] hover:bg-[#e54d00] text-white py-6 text-lg"
            disabled={!withdrawPurpose || withdrawPurpose.length < 10 || config.isWithdrawPending}
          >
            {config.isWithdrawPending ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Processing...
              </>
            ) : (
              <>
                <ArrowUpToLine className="h-5 w-5 mr-2" />
                Get Fixed Cookie ({config.fixedAmount ? formatTokenAmount(BigInt(config.fixedAmount), tokenDecimals, tokenSymbol) : `0 ${tokenSymbol}`})
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Fixed amount withdrawal without purpose
  if (!config.strictPurpose && config.withdrawalOption === "Fixed") {
    return (
      <div className="space-y-6 py-8">
        <p className="text-[#ff5e14] font-medium text-xl text-center">
          You can get a fixed cookie of {config.fixedAmount ? formatTokenAmount(BigInt(config.fixedAmount), tokenDecimals, tokenSymbol) : `0 ${tokenSymbol}`} from this jar.
        </p>
        {Number(config.lastWithdrawalWhitelist) > 0 && (
          <p className="text-sm text-[#8b7355] text-center">
            Note: After withdrawal, a cooldown period will be applied before you can withdraw again.
          </p>
        )}
        <div className="pt-4 flex justify-center">
          <Button
            onClick={handleWithdrawWhitelist}
            className="px-8 py-6 bg-[#ff5e14] hover:bg-[#e54d00] text-white text-lg"
            disabled={config.isWithdrawPending}
          >
            {config.isWithdrawPending ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Processing...
              </>
            ) : (
              <>
                <ArrowUpToLine className="h-5 w-5 mr-2" />
                Get Fixed Cookie
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Variable amount withdrawal with purpose
  if (config.strictPurpose && config.withdrawalOption === "Variable") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="withdrawAmount" className="block text-[#ff5e14] font-medium">
            Withdrawal Amount
          </label>
          <Input
            id="withdrawAmount"
            type="text"
            placeholder="Enter amount"
            value={withdrawAmount}
            onChange={(e) => {
              // Only allow numbers and decimal points with validation based on decimal precision
              const value = e.target.value;
              if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                // Validate that the number of decimal places doesn't exceed the token's decimal precision
                const parts = value.split('.');
                if (
                  parts.length === 1 || // No decimal point
                  parts[1].length <= tokenDecimals // Has decimal point but not exceeding max decimals
                ) {
                  setWithdrawAmount(value);
                }
              }
            }}
            className="border-[#f0e6d8] bg-white text-[#3c2a14]"
          />
          <p className="text-sm text-[#8b7355]">
            Maximum withdrawal: {config.maxWithdrawal ? formatTokenAmount(BigInt(config.maxWithdrawal), tokenDecimals, tokenSymbol) : `0 ${tokenSymbol}`}
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="withdrawPurpose" className="block text-[#ff5e14] font-medium">
            Withdrawal Purpose
          </label>
          <Textarea
            id="withdrawPurpose"
            placeholder="Enter the purpose of your withdrawal (required)"
            value={withdrawPurpose}
            onChange={(e) => setWithdrawPurpose(e.target.value)}
            className="min-h-24 border-[#f0e6d8] bg-white text-[#3c2a14]"
          />
        </div>

        <div className="pt-2">
          <Button
            onClick={handleWithdrawWhitelistVariable}
            className="w-full bg-[#ff5e14] hover:bg-[#e54d00] text-white"
            disabled={
              !withdrawAmount ||
              Number(withdrawAmount) <= 0 ||
              !withdrawPurpose ||
              withdrawPurpose.length < 10 ||
              config.isWithdrawPending
            }
          >
            {config.isWithdrawPending ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Processing...
              </>
            ) : (
              <>
                <ArrowUpToLine className="h-4 w-4 mr-2" />
                Get Cookie ({withdrawAmount || "0"} {tokenSymbol})
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Variable amount withdrawal without purpose
  if (!config.strictPurpose && config.withdrawalOption === "Variable") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="withdrawAmount" className="block text-[#ff5e14] font-medium">
            Withdrawal Amount
          </label>
          <Input
            id="withdrawAmount"
            type="text"
            placeholder="Enter amount"
            value={withdrawAmount}
            onChange={(e) => {
              // Only allow numbers and decimal points with validation based on decimal precision
              const value = e.target.value;
              if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                // Validate that the number of decimal places doesn't exceed the token's decimal precision
                const parts = value.split('.');
                if (
                  parts.length === 1 || // No decimal point
                  parts[1].length <= tokenDecimals // Has decimal point but not exceeding max decimals
                ) {
                  setWithdrawAmount(value);
                }
              }
            }}
            className="border-[#f0e6d8] bg-white text-[#3c2a14]"
          />
          <p className="text-sm text-[#8b7355]">
            Maximum withdrawal: {config.maxWithdrawal ? formatTokenAmount(BigInt(config.maxWithdrawal), tokenDecimals, tokenSymbol) : `0 ${tokenSymbol}`}
          </p>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleWithdrawWhitelistVariable}
            className="w-full bg-[#ff5e14] hover:bg-[#e54d00] text-white"
            disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || config.isWithdrawPending}
          >
            {config.isWithdrawPending ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Processing...
              </>
            ) : (
              <>
                <ArrowUpToLine className="h-4 w-4 mr-2" />
                Get Cookie ({withdrawAmount || "0"} {tokenSymbol})
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return null
}
