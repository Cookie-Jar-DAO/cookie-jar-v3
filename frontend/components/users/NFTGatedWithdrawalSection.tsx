"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Check, X, ArrowDownToLine } from "lucide-react"
import { useNFTOwnership } from "@/hooks/use-nft-ownership"
import { ETH_ADDRESS, useTokenInfo, formatTokenAmount } from "@/lib/utils/token-utils"

interface NFTGatedWithdrawalSectionProps {
  config: any
  withdrawPurpose: string
  setWithdrawPurpose: (value: string) => void
  withdrawAmount: string
  setWithdrawAmount: (value: string) => void
  gateAddress: string
  setGateAddress: (value: string) => void
  tokenId: string
  setTokenId: (value: string) => void
  handleWithdrawNFT: () => void
  handleWithdrawNFTVariable: () => void
  iconType?: "download" | "upload" // New prop to control icon type
  isLoading?: boolean // Add this prop
}

export const NFTGatedWithdrawalSection: React.FC<NFTGatedWithdrawalSectionProps> = ({
  config,
  withdrawPurpose,
  setWithdrawPurpose,
  withdrawAmount,
  setWithdrawAmount,
  gateAddress,
  setGateAddress,
  tokenId,
  setTokenId,
  handleWithdrawNFT,
  handleWithdrawNFTVariable,
  iconType,
  isLoading,
}) => {
  const isPurposeInvalid = config.strictPurpose && withdrawPurpose.trim().length < 10

  // Get NFT ownership information
  const { nftGates, nftOwnershipDetails, isLoading: isLoadingNFTs } = useNFTOwnership(config.contractAddress)

  // Get token information using the token utils
  const { symbol: tokenSymbol, decimals: tokenDecimals } = useTokenInfo(
    config?.currency !== ETH_ADDRESS ? config?.currency : undefined,
  )

  // Auto-fill the first owned NFT if available
  React.useEffect(() => {
    if (nftOwnershipDetails && nftOwnershipDetails.length > 0) {
      const ownedNFT = nftOwnershipDetails.find((nft) => nft.isOwned)
      if (ownedNFT && !gateAddress) {
        setGateAddress(ownedNFT.nftAddress)
        setTokenId(ownedNFT.tokenId)
      }
    }
  }, [nftOwnershipDetails, gateAddress, setGateAddress, setTokenId])

  // Helper function to format cooldown time in a simple way
  const formatCooldownTime = (seconds: number) => {
    if (!seconds) return "None"

    try {
      if (seconds === 60) return "1 minute"
      if (seconds < 60) return `${seconds} seconds`
      if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`
      if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`
      return `${Math.floor(seconds / 86400)} days`
    } catch (e) {
      return "None"
    }
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-[#222222] border-[#c0ff00] text-[#c0ff00]">
        <Info className="h-4 w-4" />
        <AlertDescription>
          This jar requires NFT ownership for withdrawals. Please enter the NFT contract address and token ID of your
          NFT.
        </AlertDescription>
      </Alert>

      {/* Display required NFTs */}
      {nftGates && nftGates.length > 0 && (
        <div className="bg-[#222222] p-4 rounded-lg border border-[#333333]">
          <h3 className="text-[#c0ff00] font-medium mb-2">Required NFTs</h3>
          <div className="space-y-2">
            {isLoadingNFTs ? (
              <p className="text-gray-300">Checking NFT ownership...</p>
            ) : (
              nftOwnershipDetails.map((nft, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">
                      <span className="font-medium">NFT:</span> {nft.nftAddress.substring(0, 6)}...
                      {nft.nftAddress.substring(nft.nftAddress.length - 4)}
                      {nft.tokenId !== "0" && <span> (Token ID: {nft.tokenId})</span>}
                    </p>
                  </div>
                  <div>
                    {nft.isOwned ? (
                      <span className="flex items-center text-green-400">
                        <Check className="h-4 w-4 mr-1" /> Owned
                      </span>
                    ) : (
                      <span className="flex items-center text-red-400">
                        <X className="h-4 w-4 mr-1" /> Not Owned
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* For Fixed Amount NFT-gated withdrawals, show new layout */}
      {config.withdrawalOption === "Fixed" && (
        <div className="py-4 relative min-h-[600px]">
          {/* Cookie Details Section - Centered and using full width */}
          <div className="cookie-details-container">
            <h3 className="text-[#c0ff00] text-3xl font-bold mb-8 text-center">Cookie Details</h3>

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
                <span className="cookie-detail-value">{formatCooldownTime(Number(config.withdrawalInterval))}</span>
              </div>

              <div className="cookie-detail-item">
                <span className="cookie-detail-label">One-time only</span>
                <span className="cookie-detail-value">{config.oneTimeWithdrawal ? "Yes" : "No"}</span>
              </div>
            </div>

            {config.strictPurpose && (
              <div className="mt-4 mb-6">
                <label htmlFor="withdrawPurpose" className="block text-[#c0ff00] font-medium mb-2">
                  Withdrawal Purpose
                </label>
                <Textarea
                  id="withdrawPurpose"
                  placeholder="Enter the purpose of your withdrawal (required)"
                  value={withdrawPurpose}
                  onChange={(e) => setWithdrawPurpose(e.target.value)}
                  className="min-h-24 border-[#333333] bg-[#222222] text-white"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Please provide a detailed explanation (minimum 10 characters)
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="space-y-2">
                <label htmlFor="nftAddress" className="block text-[#c0ff00] font-medium">
                  NFT Contract Address
                </label>
                <Input
                  id="nftAddress"
                  type="text"
                  placeholder="0x..."
                  value={gateAddress}
                  onChange={(e) => setGateAddress(e.target.value)}
                  className="border-[#333333] bg-[#222222] text-white"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="tokenId" className="block text-[#c0ff00] font-medium">
                  NFT Token ID
                </label>
                <Input
                  id="tokenId"
                  type="text"
                  placeholder="Enter token ID"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  className="border-[#333333] bg-[#222222] text-white"
                />
              </div>
            </div>
          </div>

          {/* Get Cookie Button - Fixed position at bottom right */}
          <button
            onClick={handleWithdrawNFT}
            className="cookie-button-animation get-cookie-btn w-48 h-48 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              !gateAddress ||
              !tokenId ||
              (config.strictPurpose && withdrawPurpose.length < 10) ||
              config.isWithdrawPending ||
              isLoading
            }
          >
            {config.isWithdrawPending || isLoading ? (
              <>
                <span className="animate-spin text-3xl mb-2">⟳</span>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <ArrowDownToLine className="h-12 w-12 mb-3" />
                <span className="font-bold text-2xl">GET COOKIE</span>
                <span className="text-xs mt-1">Click to withdraw</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* For Variable Amount NFT-gated withdrawals, keep the original layout */}
      {config.withdrawalOption === "Variable" && (
        <>
          {config.strictPurpose && (
            <div className="space-y-2">
              <label htmlFor="withdrawPurpose" className="block text-[#c0ff00] font-medium">
                Withdrawal Purpose
              </label>
              <Textarea
                id="withdrawPurpose"
                placeholder="Enter the purpose of your withdrawal (required)"
                value={withdrawPurpose}
                onChange={(e) => setWithdrawPurpose(e.target.value)}
                className="min-h-24 border-[#333333] bg-[#222222] text-white"
              />
              <p className="text-sm text-gray-400">
                Please provide a detailed explanation for this withdrawal (minimum 10 characters)
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="nftAddress" className="block text-[#c0ff00] font-medium">
              NFT Contract Address
            </label>
            <Input
              id="nftAddress"
              type="text"
              placeholder="0x..."
              value={gateAddress}
              onChange={(e) => setGateAddress(e.target.value)}
              className="border-[#333333] bg-[#222222] text-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tokenId" className="block text-[#c0ff00] font-medium">
              NFT Token ID
            </label>
            <Input
              id="tokenId"
              type="text"
              placeholder="Enter token ID"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              className="border-[#333333] bg-[#222222] text-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="withdrawAmount" className="block text-[#c0ff00] font-medium">
              Withdrawal Amount {tokenSymbol && `(${tokenSymbol})`}
            </label>
            <Input
              id="withdrawAmount"
              type="text"
              placeholder={`Enter amount`}
              value={withdrawAmount}
              onChange={(e) => {
                // Only allow numbers and decimal points with validation based on decimal precision
                const value = e.target.value
                if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                  // Validate that the number of decimal places doesn't exceed the token's decimal precision
                  const parts = value.split(".")
                  if (
                    parts.length === 1 || // No decimal point
                    parts[1].length <= (tokenDecimals || 18) // Has decimal point but not exceeding max decimals
                  ) {
                    setWithdrawAmount(value)
                  }
                }
              }}
              className="border-[#333333] bg-[#222222] text-white"
            />
            <p className="text-sm text-gray-400">
              Maximum withdrawal:{" "}
              {config.maxWithdrawal
                ? formatTokenAmount(BigInt(config.maxWithdrawal), tokenDecimals || 18, tokenSymbol || "ETH")
                : `0 ${tokenSymbol || "ETH"}`}
            </p>
          </div>

          <button
            onClick={handleWithdrawNFTVariable}
            className="w-full bg-[#c0ff00] hover:bg-[#a8e600] text-black font-bold px-8 py-6 rounded-lg flex items-center justify-center gap-3 text-xl shadow-lg transform transition-transform hover:scale-105 mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={
              !gateAddress ||
              !tokenId ||
              !withdrawAmount ||
              Number(withdrawAmount) <= 0 ||
              (config.strictPurpose && withdrawPurpose.length < 10) ||
              config.isWithdrawPending ||
              isLoading
            }
          >
            {config.isWithdrawPending || isLoading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Processing...
              </>
            ) : (
              <>
                <ArrowDownToLine className="h-8 w-8 mr-2" />
                <div className="flex flex-col items-start">
                  <span>GET COOKIE WITH NFT</span>
                  <span className="text-sm font-normal">
                    ({withdrawAmount || "0"} {tokenSymbol || "ETH"})
                  </span>
                </div>
              </>
            )}
          </button>
        </>
      )}
    </div>
  )
}
