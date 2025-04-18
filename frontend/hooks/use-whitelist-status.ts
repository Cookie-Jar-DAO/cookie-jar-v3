"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { keccak256, toUtf8Bytes } from "ethers"
import { useReadCookieJarHasRole } from "@/generated"

export function useWhitelistStatus(jarAddress: string) {
  const [isWhitelisted, setIsWhitelisted] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)
  const { address: userAddress } = useAccount()

  // Encode role name to bytes32, same as Solidity
  const JAR_WHITELISTED = keccak256(toUtf8Bytes("JAR_WHITELISTED")) as `0x${string}`

  // Use the contract hook to check whitelist status
  const { data, isLoading: isLoadingRole } = useReadCookieJarHasRole({
    address: jarAddress as `0x${string}`,
    args: userAddress ? [JAR_WHITELISTED, userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress && !!jarAddress,
    },
  })

  useEffect(() => {
    if (!isLoadingRole) {
      setIsWhitelisted(!!data)
      setIsLoading(false)
    }
  }, [data, isLoadingRole])

  return { isWhitelisted, isLoading }
}
