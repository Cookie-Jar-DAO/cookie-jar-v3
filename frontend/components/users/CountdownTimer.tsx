"use client"

import type React from "react"
import { useEffect, useState } from "react"

interface CountdownTimerProps {
  lastWithdrawalTimestamp: number // seconds
  interval: number // seconds
  onComplete?: () => void // callback when timer reaches zero
}

const formatTimeLeft = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0")
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0")
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")
  return `${hrs}:${mins}:${secs}`
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ lastWithdrawalTimestamp, interval, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000)
      const nextWithdrawalTime = lastWithdrawalTimestamp + interval
      const remaining = nextWithdrawalTime - now

      if (remaining <= 0) {
        setTimeLeft(0)
        setIsComplete(true)
        if (onComplete) onComplete()
      } else {
        setTimeLeft(remaining)
      }
    }

    updateCountdown() // call immediately
    const intervalId = setInterval(updateCountdown, 1000)

    return () => clearInterval(intervalId)
  }, [lastWithdrawalTimestamp, interval, onComplete])

  return (
    <div className="w-full flex flex-col items-center justify-center py-8">
      <h2 className="text-3xl font-bold text-[#3c2a14] mb-6 text-center">Time Until Next Withdrawal</h2>

      <div className="bg-white rounded-xl p-6 shadow-md border border-[#f0e6d8] w-full max-w-md mx-auto text-center mb-6">
        <span className="text-5xl font-mono font-bold text-[#ff5e14]">
          {isComplete ? "00:00:00" : formatTimeLeft(timeLeft)}
        </span>
      </div>

      <p className="text-lg font-medium text-[#8b7355] text-center">
        {isComplete ? "You can withdraw now" : "Cooldown period active"}
      </p>
    </div>
  )
}
