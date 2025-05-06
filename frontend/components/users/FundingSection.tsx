"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatEther } from "viem"
import { Wallet } from "lucide-react"

interface FundingSectionProps {
  amount: string
  setAmount: (amount: string) => void
  onSubmit: (amount: string) => void
  walletBalance?: bigint
  isAdmin?: boolean
}

export function FundingSection({ amount, setAmount, onSubmit, walletBalance, isAdmin = false }: FundingSectionProps) {
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }
    onSubmit(amount)
  }

  const setPercentage = (percentage: number) => {
    if (!walletBalance) return

    try {
      const maxAmount = formatEther(walletBalance)
      const calculatedAmount = (Number.parseFloat(maxAmount) * percentage).toFixed(6)
      setAmount(calculatedAmount)
      setError(null)
    } catch (error) {
      console.error("Error calculating percentage:", error)
      setError("Error calculating amount")
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 md:gap-8 py-3 md:py-4">
        {/* Deposit Details Section */}
        <div className="bg-[#222222] p-4 md:p-6 rounded-xl border border-[#333333] flex-1">
          <h3 className="text-[#c0ff00] text-xl font-bold mb-4">Deposit Details</h3>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center border-b border-[#333333] pb-2">
              <span className="text-gray-300">Your Balance:</span>
              <span className="text-white font-medium">
                {walletBalance ? formatEther(walletBalance).substring(0, 8) : "0"} ETH
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <label htmlFor="amount" className="text-gray-300">
                Amount to {isAdmin ? "Deposit" : "Donate"}
              </label>
              <Input
                id="amount"
                type="text"
                placeholder="0.1 ETH"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setError(null)
                }}
                className="bg-[#333333] border-[#444444] text-white focus:border-[#c0ff00] focus:ring-[#c0ff00]"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="grid grid-cols-4 gap-2 mt-4">
              <Button
                type="button"
                onClick={() => setPercentage(0.25)}
                className="bg-[#333333] hover:bg-[#444444] text-[#c0ff00] border border-[#444444]"
              >
                25%
              </Button>
              <Button
                type="button"
                onClick={() => setPercentage(0.5)}
                className="bg-[#333333] hover:bg-[#444444] text-[#c0ff00] border border-[#444444]"
              >
                50%
              </Button>
              <Button
                type="button"
                onClick={() => setPercentage(0.75)}
                className="bg-[#333333] hover:bg-[#444444] text-[#c0ff00] border border-[#444444]"
              >
                75%
              </Button>
              <Button
                type="button"
                onClick={() => setPercentage(1)}
                className="bg-[#333333] hover:bg-[#444444] text-[#c0ff00] border border-[#444444]"
              >
                Max
              </Button>
            </div>
          </div>

          <p className="text-gray-400 text-sm">
            By clicking the button, you'll {isAdmin ? "deposit" : "donate"} the specified amount to this jar.
          </p>
        </div>

        {/* Deposit Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleSubmit}
            className="bg-[#c0ff00] hover:bg-[#a8e600] text-black font-bold flex flex-col items-center justify-center text-lg md:text-xl shadow-lg rounded-lg w-40 h-40 md:w-56 md:h-56 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 animate-appear"
          >
            <Wallet className="h-8 w-8 md:h-10 md:w-10 mb-2 md:mb-3" />
            <span className="font-bold text-xl md:text-2xl">{isAdmin ? "DEPOSIT" : "DONATE"}</span>
            <span className="text-sm mt-2">Click to {isAdmin ? "deposit" : "donate"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
