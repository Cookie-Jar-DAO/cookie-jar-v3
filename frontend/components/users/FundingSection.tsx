"use client"

// FundingSection.tsx
import type React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useChainId } from 'wagmi'
import { getNativeCurrency } from '@/config/supported-networks'

interface FundingSectionProps {
  amount: string
  setAmount: (value: string) => void
  onSubmit: (value: string) => void
}

export const FundingSection: React.FC<FundingSectionProps> = ({ amount, setAmount, onSubmit }) => {
  const chainId = useChainId();
  const nativeCurrency = getNativeCurrency(chainId);

  return (
    <div className="flex flex-col gap-4 mb-6">
      <Input
        type="text"
        placeholder={`Enter amount (in smallest unit so it can handle both ${nativeCurrency.symbol} and currency deposits.)`}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full"
      />
      <Button onClick={() => onSubmit(amount)} className="w-full">
        Fund CookieJar with Currency
      </Button>
    </div>
  )
}
