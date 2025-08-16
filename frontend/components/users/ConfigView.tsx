"use client"

// Main ConfigView component that uses all the above components
import type React from "react"
import { useState, useMemo } from "react"
import { useWriteCookieJarWithdrawWhitelistMode, useWriteCookieJarWithdrawNftMode } from "../../generated"
import { ConfigDetailsSection } from "./ConfigDetailsSection"
import { WhitelistWithdrawalSection } from "./WhitelistWithdrawalSection"
import { NFTGatedWithdrawalSection } from "./NFTGatedWithdrawalSection"
import { WithdrawalHistorySection } from "./WithdrawlHistorySection"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Coins, ArrowDownToLine } from "lucide-react"
import { useChainId } from 'wagmi'
import { getNativeCurrency } from '@/config/supported-networks'

interface ConfigViewProps {
  config: any // Ideally this would be more specifically typed
  tokenAddress: string
  setTokenAddress: (value: string) => void
  amount: string
  setAmount: (value: string) => void
  onSubmit: (value: string) => void
}

interface Withdrawal {
  amount: bigint
  purpose: string
}

export const ConfigView: React.FC<ConfigViewProps> = ({
  config,
  amount,
  tokenAddress,
  setTokenAddress,
  setAmount,
  onSubmit,
}) => {
  const chainId = useChainId();
  const nativeCurrency = getNativeCurrency(chainId);

  // State management
  const [withdrawAmount, setWithdrawAmount] = useState<string>("")
  const [withdrawPurpose, setWithdrawPurpose] = useState<string>("")
  const [gateAddress, setGateAddress] = useState<string>("")
  const [tokenId, setTokenId] = useState<string>("")

  // Check conditions for showing different UI sections
  const showUserFunctionsWhitelisted = config?.whitelist === true && config?.accessType === "Whitelist"
  const showUserFunctionsNFTGated = config?.accessType === "NFTGated"

  // Contract hooks
  const {
    writeContract: withdrawWhitelistMode,
    data: withdrawWhitelistModeData,
    error: withdrawWhitelistModeError,
  } = useWriteCookieJarWithdrawWhitelistMode()

  const {
    writeContract: withdrawNFTMode,
    data: withdrawNFTModeData,
    error: withdrawNFTModeError,
  } = useWriteCookieJarWithdrawNftMode()

  // Handler functions
  const handleWithdrawWhitelist = () => {
    if (!config.contractAddress || !config.fixedAmount) return

    withdrawWhitelistMode({
      address: config.contractAddress,
      args: [config.fixedAmount, withdrawPurpose],
    })
  }

  const handleWithdrawWhitelistVariable = () => {
    if (!config.contractAddress) return

    withdrawWhitelistMode({
      address: config.contractAddress,
      args: [BigInt(withdrawAmount || "0"), withdrawPurpose],
    })
  }

  const handleWithdrawNFT = () => {
    if (!config.contractAddress || !config.fixedAmount || !gateAddress) return

    withdrawNFTMode({
      address: config.contractAddress,
      args: [config.fixedAmount, withdrawPurpose, gateAddress as `0x${string}`, BigInt(tokenId || "0")],
    })
  }

  const handleWithdrawNFTVariable = () => {
    if (!config.contractAddress || !gateAddress) return

    withdrawNFTMode({
      address: config.contractAddress,
      args: [BigInt(withdrawAmount || "0"), withdrawPurpose, gateAddress as `0x${string}`, BigInt(tokenId || "0")],
    })
  }

  // Memoize the balance display to prevent unnecessary re-renders
  const formattedBalance = useMemo(() => {
    if (!config.balance) return "0"

    // Format the balance based on whether it's native currency or a token
    if (config.currency === "0x0000000000000000000000000000000000000003") {
      // For native currency, convert from wei to native units
      const nativeBalance = Number(config.balance) / 1e18
      return nativeBalance.toFixed(4) + " " + nativeCurrency.symbol
    } else {
      // For tokens, just display the raw value
      return config.balance.toString() + " Tokens"
    }
  }, [config.balance, config.currency, nativeCurrency.symbol])

  return (
    <div className="space-y-8">
      {/* Funding Section */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#ff5e14] to-[#ff8e14] text-white">
          <CardTitle className="text-xl flex items-center">
            <Coins className="h-5 w-5 mr-2" />
            Fund Cookie Jar
          </CardTitle>
          <p className="text-white/80 text-sm">Current Balance: {formattedBalance}</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="fundAmount" className="block text-[#3c2a14] font-medium mb-2">
                  Amount to Deposit
                </label>
                <Input
                  id="fundAmount"
                  type="text"
                  placeholder={
                    config.currency === "0x0000000000000000000000000000000000000003" ? `0.1 ${nativeCurrency.symbol}` : "1000 Tokens"
                  }
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-[#f0e6d8] bg-white text-[#3c2a14]"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => onSubmit(amount)}
                  className="w-full bg-[#ff5e14] hover:bg-[#e54d00] text-white h-10"
                  disabled={!amount || Number(amount) <= 0}
                >
                  <ArrowDownToLine className="h-4 w-4 mr-2" />
                  Fund Jar
                </Button>
              </div>
            </div>

            {config.currency !== "0x0000000000000000000000000000000000000003" && (
              <div className="pt-2">
                <p className="text-sm text-[#8b7355]">
                  Note: For ERC20 tokens, you'll need to approve the token transfer before depositing.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Details */}
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-[#fff8f0]">
          <CardTitle className="text-xl text-[#3c2a14]">Jar Configuration</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ConfigDetailsSection config={config} />
        </CardContent>
      </Card>

      {/* Withdrawal Sections */}
      {showUserFunctionsWhitelisted && (
        <Card className="border-none shadow-sm">
          <CardHeader className="bg-[#fff8f0]">
            <CardTitle className="text-xl text-[#3c2a14]">Whitelist Withdrawal</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <WhitelistWithdrawalSection
              config={config}
              withdrawPurpose={withdrawPurpose}
              setWithdrawPurpose={setWithdrawPurpose}
              withdrawAmount={withdrawAmount}
              setWithdrawAmount={setWithdrawAmount}
              handleWithdrawWhitelist={handleWithdrawWhitelist}
              handleWithdrawWhitelistVariable={handleWithdrawWhitelistVariable}
            />
          </CardContent>
        </Card>
      )}

      {showUserFunctionsNFTGated && (
        <Card className="border-none shadow-sm">
          <CardHeader className="bg-[#fff8f0]">
            <CardTitle className="text-xl text-[#3c2a14]">NFT-Gated Withdrawal</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <NFTGatedWithdrawalSection
              config={config}
              withdrawAmount={withdrawAmount}
              setWithdrawAmount={setWithdrawAmount}
              gateAddress={gateAddress}
              setGateAddress={setGateAddress}
              tokenId={tokenId}
              setTokenId={setTokenId}
              handleWithdrawNFT={handleWithdrawNFT}
              handleWithdrawNFTVariable={handleWithdrawNFTVariable}
            />
          </CardContent>
        </Card>
      )}

      {/* Withdrawal History */}
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-[#fff8f0]">
          <CardTitle className="text-xl text-[#3c2a14]">Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <WithdrawalHistorySection pastWithdrawals={config.pastWithdrawals} />
        </CardContent>
      </Card>
    </div>
  )
}
