"use client"

// NFTGatedWithdrawalSection.tsx
import type React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ETH_ADDRESS, useTokenInfo, parseTokenAmount, formatTokenAmount } from "@/lib/utils/token-utils"

interface NFTGatedWithdrawalSectionProps {
  config: any // Ideally this would be more specifically typed
  withdrawAmount: string
  setWithdrawAmount: (value: string) => void
  gateAddress: string
  setGateAddress: (value: string) => void
  tokenId: string
  setTokenId: (value: string) => void
  handleWithdrawNFT: () => void
  handleWithdrawNFTVariable: () => void
}

export const NFTGatedWithdrawalSection: React.FC<NFTGatedWithdrawalSectionProps> = ({
  config,
  withdrawAmount,
  setWithdrawAmount,
  gateAddress,
  setGateAddress,
  tokenId,
  setTokenId,
  handleWithdrawNFT,
  handleWithdrawNFTVariable,
}) => {
  // Get token information using the token utils
  const { symbol: tokenSymbol, decimals: tokenDecimals } = useTokenInfo(
    config?.currency !== ETH_ADDRESS ? config?.currency : undefined
  );
  // Fixed amount NFT-gated withdrawal
  if (config.strictPurpose && config.withdrawalOption === "FIXED") {
    return (
      <div className="flex flex-col gap-4">
        <Input
          type="text"
          placeholder="Enter GateAddress"
          value={gateAddress}
          onChange={(e) => setGateAddress(e.target.value)}
          className="w-full"
        />
        <Input
          type="text"
          placeholder="Enter TokenId"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          className="w-full"
        />
        <Button
          onClick={handleWithdrawNFT}
          className="w-full bg-[#ff5e14] hover:bg-[#e54d00] text-white"
          disabled={config.isWithdrawPending}
        >
          {config.isWithdrawPending ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Processing...
            </>
          ) : (
            <>Get Cookie with NFT ({config.fixedAmount ? formatTokenAmount(BigInt(config.fixedAmount), tokenDecimals, tokenSymbol) : `0 ${tokenSymbol}`})</>
          )}
        </Button>
      </div>
    )
  }

  // Variable amount NFT-gated withdrawal
  if (config.strictPurpose && config.withdrawalOption === "Variable") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Input
            type="text"
            placeholder="Enter Amount"
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
            className="w-full"
          />
          <p className="text-sm text-[#8b7355]">
            Maximum withdrawal: {config.maxWithdrawal ? formatTokenAmount(BigInt(config.maxWithdrawal), tokenDecimals, tokenSymbol) : `0 ${tokenSymbol}`}
          </p>
        </div>
        <Input
          type="text"
          placeholder="Enter GateAddress"
          value={gateAddress}
          onChange={(e) => setGateAddress(e.target.value)}
          className="w-full"
        />
        <Input
          type="text"
          placeholder="Enter TokenId"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          className="w-full"
        />
        <Button
          onClick={handleWithdrawNFTVariable}
          className="w-full bg-[#ff5e14] hover:bg-[#e54d00] text-white"
          disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || !gateAddress || !tokenId || config.isWithdrawPending}
        >
          {config.isWithdrawPending ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Processing...
            </>
          ) : (
            <>Get Cookie with NFT ({withdrawAmount || "0"} {tokenSymbol})</>
          )}
        </Button>
      </div>
    )
  }

  return null
}
