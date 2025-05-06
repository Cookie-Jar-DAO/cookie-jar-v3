"use client"

// WhitelistWithdrawalSection.tsx
import React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowUpToLine, ArrowDownToLine } from "lucide-react"
import { ETH_ADDRESS, useTokenInfo, formatTokenAmount, checkDecimals } from "@/lib/utils/token-utils"

interface WhitelistWithdrawalSectionProps {
  config: any // Ideally this would be more specifically typed
  withdrawPurpose: string
  setWithdrawPurpose: (value: string) => void
  withdrawAmount: string
  setWithdrawAmount: (value: string) => void
  handleWithdrawWhitelist: () => void
  handleWithdrawWhitelistVariable: () => void
  iconType?: "download" | "arrow" // Prop to control which icon to show
  isLoading?: boolean // Prop to indicate loading state
}

export const WhitelistWithdrawalSection: React.FC<WhitelistWithdrawalSectionProps> = ({
  config,
  withdrawPurpose,
  setWithdrawPurpose,
  withdrawAmount,
  setWithdrawAmount,
  handleWithdrawWhitelist,
  handleWithdrawWhitelistVariable,
  iconType = "arrow",
  isLoading = false,
}) => {
  // Get token information using the token utils
  const { symbol: tokenSymbol, decimals: tokenDecimals } = useTokenInfo(
    config?.currency !== ETH_ADDRESS ? config?.currency : undefined,
  )

  // State for validation errors
  const [amountError, setAmountError] = React.useState<string | null>(null)

  // Choose which icon to display based on the iconType prop
  const WithdrawIcon = iconType === "download" ? ArrowDownToLine : ArrowUpToLine

  // Fixed amount withdrawal with purpose
  if (config.strictPurpose && config.withdrawalOption === "Fixed") {
    return (
      <div className="space-y-4 md:space-y-6 py-3 md:py-4">
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
            className="w-full bg-[#ff5e14] hover:bg-[#e54d00] text-white py-4 md:py-6 text-base md:text-lg"
            disabled={!withdrawPurpose || withdrawPurpose.length < 10 || config.isWithdrawPending || isLoading}
          >
            {isLoading || config.isWithdrawPending ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Processing...
              </>
            ) : (
              <>
                <WithdrawIcon className="h-5 w-5 mr-2" />
                Get Fixed Cookie (
                {config.fixedAmount
                  ? formatTokenAmount(BigInt(config.fixedAmount), tokenDecimals || 18, tokenSymbol || "ETH")
                  : `0 ${tokenSymbol || "ETH"}`}
                )
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
      <div className="py-4 md:py-8 relative min-h-[400px] md:min-h-[500px]">
        {/* Cookie Details Section - Centered and using full width */}
        <div className="cookie-details-container">
          <h3 className="text-[#c0ff00] text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-center">Cookie Details</h3>

          <div className="cookie-details-grid mb-8">
            <div className="cookie-detail-item">
              <span className="cookie-detail-label">Amount</span>
              <span className="cookie-detail-value">
                {config.fixedAmount
                  ? formatTokenAmount(BigInt(config.fixedAmount), tokenDecimals || 18, tokenSymbol || "ETH")
                  : `0 ${tokenSymbol || "ETH"}`}
              </span>
            </div>

            <div className="cookie-detail-item">
              <span className="cookie-detail-label">Type</span>
              <span className="cookie-detail-value">Fixed Amount</span>
            </div>

            <div className="cookie-detail-item">
              <span className="cookie-detail-label">Cooldown</span>
              <span className="cookie-detail-value">
                {config.withdrawalInterval
                  ? (() => {
                      try {
                        const seconds = Number(config.withdrawalInterval)
                        if (seconds === 60) return "1 minute"
                        if (seconds < 60) return `${seconds} seconds`
                        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`
                        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`
                        return `${Math.floor(seconds / 86400)} days`
                      } catch (e) {
                        return "None"
                      }
                    })()
                  : "None"}
              </span>
            </div>

            <div className="cookie-detail-item">
              <span className="cookie-detail-label">One-time only</span>
              <span className="cookie-detail-value">{config.oneTimeWithdrawal ? "Yes" : "No"}</span>
            </div>
          </div>

          <p className="text-gray-300 text-center text-lg max-w-2xl mx-auto">
            By clicking the button below, you'll receive{" "}
            <span className="text-[#c0ff00] font-medium">
              {formatTokenAmount(BigInt(config.fixedAmount), tokenDecimals || 18, tokenSymbol || "ETH")}
            </span>{" "}
            from this jar.
            {Number(config.lastWithdrawalWhitelist) > 0 &&
              " After withdrawal, a cooldown period will be applied before you can withdraw again."}
          </p>
        </div>

        {/* Get Cookie Button - Fixed position at bottom right */}
        <button
          onClick={handleWithdrawWhitelist}
          className="cookie-button-animation get-cookie-btn w-36 h-36 md:w-48 md:h-48 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={config.isWithdrawPending || isLoading}
        >
          {isLoading || config.isWithdrawPending ? (
            <>
              <span className="animate-spin text-3xl mb-2">⟳</span>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <WithdrawIcon className="h-8 w-8 md:h-12 md:w-12 mb-2 md:mb-3" />
              <span className="font-bold text-xl md:text-2xl">GET COOKIE</span>
              <span className="text-sm mt-1">Click to withdraw</span>
            </>
          )}
        </button>
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
              const value = e.target.value
              const result = checkDecimals(value, tokenDecimals || 18)
              setAmountError(result.error)
              if (result.value !== null) {
                setWithdrawAmount(result.value)
              }
            }}
            className={`border-[#f0e6d8] bg-white text-[#3c2a14] ${amountError ? "border-red-500" : ""}`}
          />
          {amountError ? (
            <p className="text-sm text-red-500">{amountError}</p>
          ) : (
            <p className="text-sm text-[#8b7355]">
              Maximum withdrawal:{" "}
              {config.maxWithdrawal
                ? formatTokenAmount(BigInt(config.maxWithdrawal), tokenDecimals || 18, tokenSymbol || "ETH")
                : `0 ${tokenSymbol || "ETH"}`}
            </p>
          )}
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
              !!amountError ||
              config.isWithdrawPending ||
              isLoading
            }
          >
            {isLoading || config.isWithdrawPending ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Processing...
              </>
            ) : (
              <>
                <WithdrawIcon className="h-4 w-4 mr-2" />
                Get Cookie ({withdrawAmount || "0"} {tokenSymbol || "ETH"})
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
              const value = e.target.value
              const result = checkDecimals(value, tokenDecimals || 18)
              setAmountError(result.error)
              if (result.value !== null) {
                setWithdrawAmount(result.value)
              }
            }}
            className={`border-[#f0e6d8] bg-white text-[#3c2a14] ${amountError ? "border-red-500" : ""}`}
          />
          {amountError ? (
            <p className="text-sm text-red-500">{amountError}</p>
          ) : (
            <p className="text-sm text-[#8b7355]">
              Maximum withdrawal:{" "}
              {config.maxWithdrawal
                ? formatTokenAmount(BigInt(config.maxWithdrawal), tokenDecimals || 18, tokenSymbol || "ETH")
                : `0 ${tokenSymbol || "ETH"}`}
            </p>
          )}
        </div>

        <div className="pt-2">
          <Button
            onClick={handleWithdrawWhitelistVariable}
            className="w-full bg-[#ff5e14] hover:bg-[#e54d00] text-white"
            disabled={
              !withdrawAmount || Number(withdrawAmount) <= 0 || !!amountError || config.isWithdrawPending || isLoading
            }
          >
            {isLoading || config.isWithdrawPending ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Processing...
              </>
            ) : (
              <>
                <WithdrawIcon className="h-4 w-4 mr-2" />
                Get Cookie ({withdrawAmount || "0"} {tokenSymbol || "ETH"})
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return null
}
