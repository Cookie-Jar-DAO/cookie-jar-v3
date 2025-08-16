"use client"

// ConfigDetailsSection.tsx
import type React from "react"
import { Separator } from "@/components/ui/separator"
import { ConfigItem } from "./ConfigItem"
import { formatEther } from "viem"
import { formatTime, formatValue, formatAddress } from "../../utils"
import { CountdownTimer } from "./CountdownTimer" // adjust path as needed
import { useChainId } from 'wagmi'
import { getNativeCurrency } from '@/config/supported-networks'

interface ConfigDetailsSectionProps {
  config: any // Ideally this would be more specifically typed
}

export const ConfigDetailsSection: React.FC<ConfigDetailsSectionProps> = ({ config }) => {
  const chainId = useChainId();
  const nativeCurrency = getNativeCurrency(chainId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ConfigItem label="Access Type" value={formatValue(config.accessType)} highlight />
      <ConfigItem label="Admin" value={formatAddress(config.admin || "")} />
      <ConfigItem label="Withdrawal Option" value={formatValue(config.withdrawalOption)} highlight />
      <ConfigItem
        label="Fixed Amount"
        value={
          config.currency === "0x0000000000000000000000000000000000000003"
            ? `${formatEther(BigInt(config.fixedAmount))} ${nativeCurrency.symbol}`
            : `${formatValue(config.fixedAmount)} Tokens`
        }
      />
      <ConfigItem
        label="Currency"
        value={
          config.currency === "0x0000000000000000000000000000000000000003"
            ? `${nativeCurrency.symbol} (Native)`
            : formatAddress(config.currency)
        }
        highlight
      />

      <Separator className="col-span-1 md:col-span-2 my-2" />
      <ConfigItem
        label="Max Withdrawal"
        value={config.maxWithdrawal ? formatEther(BigInt(config.maxWithdrawal)) : "N/A"}
      />
      <ConfigItem
        label="Withdrawal Interval"
        value={formatTime(config.withdrawalInterval ? Number(config.withdrawalInterval) : undefined)}
      />
      <ConfigItem label="Strict Purpose" value={formatValue(config.strictPurpose)} boolean />
      <ConfigItem label="Emergency Withdrawal" value={formatValue(config.emergencyWithdrawalEnabled)} boolean />
      <ConfigItem label="One Time Withdrawal" value={formatValue(config.oneTimeWithdrawal)} boolean />
      <Separator className="col-span-1 md:col-span-2 my-2" />
      <ConfigItem label="Fee Collector" value={formatAddress(config.feeCollector || "")} />
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">Whitelisted</span>
        <span
          className={`text-base font-medium break-words px-3 py-1 rounded-md text-white ${config.whitelist ? "bg-green-500" : "bg-red-500"
            }`}
        >
          {config.whitelist ? "You are whitelisted" : "You are not whitelisted"}
        </span>
      </div>
      <ConfigItem label="Blacklisted" value={formatValue(config.blacklist)} boolean />
      <ConfigItem
        label="Last Withdrawal Whitelist"
        value={new Date(Number(config.lastWithdrawalWhitelist) * 1000).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          dateStyle: "medium",
          timeStyle: "short",
        })}
      />

      <CountdownTimer
        lastWithdrawalTimestamp={Number(config.lastWithdrawalWhitelist)}
        interval={Number(config.withdrawalInterval)}
      />

      <ConfigItem label="Last Withdrawal NFT" value={formatValue(config.lastWithdrawalNft?.toString())} />
    </div>
  )
}
