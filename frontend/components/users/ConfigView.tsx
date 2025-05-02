"use client"

// Main ConfigView component that uses all the above components
import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { useWriteCookieJarWithdrawWhitelistMode, useWriteCookieJarWithdrawNftMode } from "../../generated"
import { ConfigDetailsSection } from "./ConfigDetailsSection"
import { WhitelistWithdrawalSection } from "./WhitelistWithdrawalSection"
import { NFTGatedWithdrawalSection } from "./NFTGatedWithdrawalSection"
import { WithdrawalHistorySection } from "./WithdrawlHistorySection"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins } from "lucide-react"
import { FundingSection } from "./FundingSection"

interface ConfigViewProps {
  config: any // Ideally this would be more specifically typed
  tokenAddress: string
  setTokenAddress: (value: string) => void
  amount: string
  setAmount: (value: string) => void
  onSubmit: (value: string) => void
  refetchData?: () => Promise<any> // Add this new prop
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
  refetchData,
}) => {
  // State management
  const [withdrawAmount, setWithdrawAmount] = useState<string>("")
  const [withdrawPurpose, setWithdrawPurpose] = useState<string>("")
  const [gateAddress, setGateAddress] = useState<string>("")
  const [tokenId, setTokenId] = useState<string>("")
  const [isApprovalSuccess, setIsApprovalSuccess] = useState(false)
  const [approvalCompleted, setApprovalCompleted] = useState(false)
  const [isWithdrawWhitelistSuccess, setIsWithdrawWhitelistSuccess] = useState(false)
  const [isWithdrawNFTSuccess, setIsWithdrawNFTSuccess] = useState(false)

  // Check conditions for showing different UI sections
  const showUserFunctionsWhitelisted = config?.whitelist === true && config?.accessType === "Whitelist"
  const showUserFunctionsNFTGated = config?.accessType === "NFTGated"
  console.log(config?.accessType)

  // Contract hooks
  const {
    writeContract: withdrawWhitelistMode,
    data: withdrawWhitelistModeData,
    error: withdrawWhitelistModeError,
    isSuccess: withdrawWhitelistSuccess,
  } = useWriteCookieJarWithdrawWhitelistMode()

  const {
    writeContract: withdrawNFTMode,
    data: withdrawNFTModeData,
    error: withdrawNFTModeError,
    isSuccess: withdrawNFTSuccess,
  } = useWriteCookieJarWithdrawNftMode()

  useEffect(() => {
    if (withdrawWhitelistSuccess) {
      setIsWithdrawWhitelistSuccess(true)
    }
  }, [withdrawWhitelistSuccess])

  useEffect(() => {
    if (withdrawNFTSuccess) {
      setIsWithdrawNFTSuccess(true)
    }
  }, [withdrawNFTSuccess])

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

    // Format the balance based on whether it's ETH or a token
    if (config.currency === "0x0000000000000000000000000000000000000003") {
      // For ETH, convert from wei to ETH
      const ethBalance = Number(config.balance) / 1e18
      return ethBalance.toFixed(4) + " ETH"
    } else {
      // For tokens, just display the raw value
      return config.balance.toString() + " Tokens"
    }
  }, [config.balance, config.currency])

  useEffect(() => {
    // If deposit or withdrawal was successful, refetch data
    if (isApprovalSuccess && approvalCompleted && refetchData) {
      // Wait a bit for the transaction to be processed
      setTimeout(async () => {
        await refetchData()
      }, 2000)
    }
  }, [isApprovalSuccess, approvalCompleted, refetchData])

  // Also add a similar effect for withdrawals:
  useEffect(() => {
    if ((isWithdrawWhitelistSuccess || isWithdrawNFTSuccess) && refetchData) {
      // Wait a bit for the transaction to be processed
      setTimeout(async () => {
        await refetchData()
      }, 2000)
    }
  }, [isWithdrawWhitelistSuccess, isWithdrawNFTSuccess, refetchData])

  return (
    <div className="space-y-8">
      {/* Funding Section */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary to-primary-light">
          <CardTitle className="text-xl flex items-center text-primary-foreground">
            <Coins className="h-5 w-5 mr-2" />
            Fund Cookie Jar
          </CardTitle>
          <p className="text-primary-foreground/80 text-sm">Current Balance: {formattedBalance}</p>
        </CardHeader>
        <CardContent className="p-6 bg-background-paper">
          <FundingSection
            amount={amount}
            setAmount={setAmount}
            onSubmit={onSubmit}
            walletBalance={config.userWalletBalance}
            isAdmin={config.isAdmin}
          />
        </CardContent>
      </Card>

      {/* Configuration Details */}
      <Card className="border-border shadow-sm">
        <CardHeader className="bg-background-light">
          <CardTitle className="text-xl text-text-primary">Jar Configuration</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ConfigDetailsSection config={config} />
        </CardContent>
      </Card>

      {/* Withdrawal Sections */}
      {showUserFunctionsWhitelisted && (
        <Card className="border-border shadow-sm">
          <CardHeader className="bg-background-light">
            <CardTitle className="text-xl text-text-primary">Whitelist Withdrawal</CardTitle>
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
        <Card className="border-border shadow-sm">
          <CardHeader className="bg-background-light">
            <CardTitle className="text-xl text-text-primary">NFT-Gated Withdrawal</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <NFTGatedWithdrawalSection
              config={config}
              withdrawPurpose={withdrawPurpose}
              setWithdrawPurpose={setWithdrawPurpose}
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
      <Card className="border-border shadow-sm">
        <CardHeader className="bg-background-light">
          <CardTitle className="text-xl text-text-primary">Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <WithdrawalHistorySection pastWithdrawals={config.pastWithdrawals} />
        </CardContent>
      </Card>
    </div>
  )
}
