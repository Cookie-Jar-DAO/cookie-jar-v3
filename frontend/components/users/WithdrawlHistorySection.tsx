"use client"

import type React from "react"
import { formatEther } from "viem"
import { motion } from "framer-motion"

// Export the Withdrawal interface so it can be imported elsewhere
export interface Withdrawal {
  amount: bigint
  purpose: string
}

interface WithdrawalHistorySectionProps {
  pastWithdrawals?: Withdrawal[]
}

export const WithdrawalHistorySection: React.FC<WithdrawalHistorySectionProps> = ({ pastWithdrawals = [] }) => {
  // Helper function to format wei to ETH with proper decimal places
  const formatWeiToEth = (weiAmount: bigint): string => {
    try {
      // Convert wei to ETH using formatEther from viem
      const ethValue = formatEther(weiAmount)

      // Format to 6 decimal places maximum
      const formattedValue = Number.parseFloat(ethValue).toFixed(6)

      // Remove trailing zeros after decimal point
      return formattedValue.replace(/\.?0+$/, "") + " ETH"
    } catch (error) {
      console.error("Error formatting wei to ETH:", error)
      return weiAmount.toString() + " wei"
    }
  }

  return (
    <motion.div
      className="mt-4 md:mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-xl font-bold mb-4 text-white">Past Withdrawals from this Jar</h1>
      {pastWithdrawals.length > 0 ? (
        <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          <ul className="space-y-4">
            {pastWithdrawals.map((withdrawal, index) => (
              <motion.li
                key={index}
                className="border border-[#333333] p-3 md:p-4 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] transition-all duration-300 shadow-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="flex flex-col md:flex-row md:justify-between gap-2 md:gap-3">
                  <div className="bg-[#333333] px-4 py-2 rounded-lg">
                    <p className="font-medium text-white">
                      <span className="text-gray-400">Amount:</span>{" "}
                      <span className="text-[#C3FF00] font-bold">{formatWeiToEth(withdrawal.amount)}</span>
                    </p>
                  </div>
                  <div className="flex-grow bg-[#333333] px-4 py-2 rounded-lg">
                    <p className="font-medium text-white">
                      <span className="text-gray-400">Purpose:</span>{" "}
                      <span className="text-white">{withdrawal.purpose || "No purpose provided"}</span>
                    </p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      ) : (
        <motion.div
          className="text-center py-8 md:py-12 px-4 md:px-6 text-gray-300 bg-[#2a2a2a] rounded-lg border border-[#333333] shadow-inner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center justify-center">
            <svg
              className="w-16 h-16 mb-4 text-[#C3FF00]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <p className="text-lg font-medium">No withdrawal history available</p>
            <p className="text-sm text-gray-400 mt-2">When withdrawals are made, they will appear here</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
