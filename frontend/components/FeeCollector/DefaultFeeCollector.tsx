"use client"

import React, { useState } from "react"
import { useWriteCookieJarUpdateFeeCollector } from "../../generated"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import { LoadingOverlay } from "@/components/design/loading-overlay"

const DefaultFeeCollector = ({ contractAddress }: { contractAddress: `0x${string}` }) => {
  const [newFeeCollectorAddress, setNewFeeCollectorAddress] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)

  const {
    writeContract: updateFeeCollector,
    data: feeCollectorData,
    error: feeCollectorError,
    isSuccess: isTransactionSuccess,
    isError,
  } = useWriteCookieJarUpdateFeeCollector()

  // Update success state when transaction succeeds
  React.useEffect(() => {
    if (isTransactionSuccess) {
      setIsSuccess(true)
      setNewFeeCollectorAddress("")
      setIsLoading(false)

      // Reset success message after 5 seconds
      const timer = setTimeout(() => {
        setIsSuccess(false)
      }, 5000)

      return () => clearTimeout(timer)
    }

    if (isError) {
      setIsLoading(false)
    }
  }, [isTransactionSuccess, isError])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!newFeeCollectorAddress || !newFeeCollectorAddress.startsWith("0x")) return

    setIsLoading(true)

    try {
      await updateFeeCollector({
        address: contractAddress,
        args: [newFeeCollectorAddress as `0x${string}`],
      })
    } catch (error: unknown) {
      console.error("Fee collector update error:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-medium">Fee Collector Management</h3>
        <p className="text-muted-foreground">
          As the current fee collector, you can transfer this role to another address.
        </p>

        {isSuccess && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Fee collector updated successfully! Transaction hash: {feeCollectorData?.slice(0, 10)}...
            </AlertDescription>
          </Alert>
        )}

        {isError && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">
              {feeCollectorError?.message || "Failed to update fee collector. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="feeCollectorAddress" className="text-sm font-medium">
              New Fee Collector Address
            </label>
            <Input
              id="feeCollectorAddress"
              type="text"
              value={newFeeCollectorAddress}
              onChange={(e) => setNewFeeCollectorAddress(e.target.value)}
              placeholder="0x..."
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Enter the Ethereum address that will become the new fee collector
            </p>
          </div>

          <Button type="submit" disabled={!newFeeCollectorAddress.startsWith("0x")} className="w-full sm:w-auto">
            {"Update Fee Collector"}
          </Button>
        </form>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">About Fee Collector Role</h4>
        <p className="text-sm text-muted-foreground">
          The fee collector receives a percentage of all transactions processed through this CookieJar. Transferring
          this role will give another address these privileges.
        </p>
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay isOpen={isLoading} message="Updating fee collector..." onClose={() => setIsLoading(false)} />
    </div>
  )
}

export default DefaultFeeCollector
