"use client"

import { useState, useEffect } from "react"
import { useChainId } from "wagmi"
import { useReadCookieJarRegistryGetAllJars } from "../generated"
import { contractAddresses } from "../config/supported-networks"

interface JarData {
  jarAddress: string
  currency: string
  jarCreator: string
  metadata: string
  registrationTime: number
  accessType: number
  withdrawalOption: number
  fixedAmount: number
  maxWithdrawal: number
  withdrawalInterval: number
  strictPurpose: boolean
  emergencyWithdrawalEnabled: boolean
}

export function useCookieJarData() {
  const [cookieJarsData, setCookieJarsData] = useState<Array<JarData>>([])
  const [error, setError] = useState<Error | null>(null)
  const [shouldFetchJar, setShouldFetchJar] = useState(true)

  // Get the current chain ID from the connected wallet
  const chainId = useChainId()

  // Get the registry address for the current chain ID
  // Check if the current chainId has a registry address configured

    const registryAddress = chainId 
    ? contractAddresses.cookieJarRegistry[chainId] : undefined
    
  // Log if no registry address is found for the current chain
  useEffect(() => {
    if (chainId && !registryAddress) {
      console.warn(`No registry address found for chain ID: ${chainId}`)
    }
  }, [chainId, registryAddress])

  // Query: Get the jar data
  const {
    data: jarResponse,
    isSuccess: isJarSuccess,
    isLoading: isJarLoading,
    error: jarError,
  } = useReadCookieJarRegistryGetAllJars({
    address: registryAddress,
    args: [],
    query: {
      enabled: shouldFetchJar && !!registryAddress,
    },
  })
  console.log(jarResponse)
  useEffect(() => {
    if (isJarSuccess && jarResponse) {
      try {
        // Map jarResponse to match JarData structure
        const formattedData: JarData[] = jarResponse.map((jar: any) => ({
          jarAddress: jar.jarAddress,
          currency: jar.currency,
          jarCreator: jar.jarCreator,
          metadata: jar.metadata,
          registrationTime: Number(jar.registrationTime),
          accessType: Number(jar.accessType),
          withdrawalOption: Number(jar.withdrawalOption),
          fixedAmount: Number(jar.fixedAmount),
          maxWithdrawal: Number(jar.maxWithdrawal),
          withdrawalInterval: Number(jar.withdrawalInterval),
          strictPurpose: Boolean(jar.strictPurpose),
          emergencyWithdrawalEnabled: Boolean(jar.emergencyWithdrawalEnabled),
        }))

        setCookieJarsData(formattedData)
        setShouldFetchJar(false)
      } catch (err) {
        setError(err as Error)
      }
    }
  }, [jarResponse, isJarSuccess])

  return {
    cookieJarsData,
    isLoading: isJarLoading,
    error: error || jarError,
  }
}
