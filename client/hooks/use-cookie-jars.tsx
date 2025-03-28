"use client"

import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { useAccount } from "wagmi"
import { getFactoryContract, getJarContract, getNetworkByChainId, networks } from "@/lib/contracts"
import { useToast } from "@/hooks/use-toast"

export type JarData = {
  id: string
  address: string
  name: string
  description: string
  network: string
  networkExplorer: string
  accessType: string
  balance: string
  token: string
  tokenAddress: string
  tokenDecimals: number
  maxWithdrawal: string
  cooldownPeriod: string
  requirePurpose: boolean
  fixedWithdrawalAmount: boolean
  emergencyWithdrawalEnabled: boolean
  isEligible: boolean
  lastWithdrawal: number
  isBlacklisted?: boolean
  owner?: string
  admins?: string[]
  withdrawalHistory: {
    user: string
    amount: string
    purpose: string
    timestamp: number
  }[]
}

export function useCookieJars() {
  const { address, isConnected } = useAccount()
  const [jars, setJars] = useState<JarData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Function to fetch details for a specific jar
  const fetchJarDetails = useCallback(
    async (jarAddress: string, networkKey: string, provider: ethers.BrowserProvider) => {
      try {
        const network = getNetworkByChainId(Number(await provider.getNetwork().then((n) => n.chainId)))
        const jar = getJarContract(provider, jarAddress)
        const factory = getFactoryContract(provider, networkKey)
        const signer = await provider.getSigner()
        const userAddress = await signer.getAddress()

        // Fetch jar config
        const config = await jar.jarConfig()
        const [
          name,
          description,
          maxWithdrawalAmount,
          cooldownPeriod,
          requirePurpose,
          fixedWithdrawalAmount,
          emergencyWithdrawalEnabled,
        ] = config

        // Check if jar is blacklisted
        const isBlacklisted = await factory.blacklistedJars(jarAddress)

        // Determine access type
        const useWhitelist = await jar.useWhitelist()
        const accessType = useWhitelist ? "Whitelist" : "NFT Gated"

        // Check eligibility
        let isEligible = false
        if (userAddress) {
          isEligible = await jar.isEligibleToWithdraw(userAddress)
        }

        // Get last withdrawal time
        let lastWithdrawal = 0
        if (userAddress) {
          const lastWithdrawalBN = await jar.lastWithdrawalTime(userAddress)
          lastWithdrawal = Number(lastWithdrawalBN) * 1000 // Convert to milliseconds
        }

        // Get token info (assuming ETH for now, would need to be updated for ERC20)
        const tokenAddress = ethers.ZeroAddress // ETH
        const token = "ETH"
        const tokenDecimals = 18

        // Get balance
        const balanceBN = await jar.getBalance(tokenAddress)
        const balance = ethers.formatUnits(balanceBN, tokenDecimals)

        // Get withdrawal history
        const historyLength = await jar.getWithdrawalHistoryLength()
        const historyPromises = []

        // Limit to last 10 for performance
        const startIndex = Math.max(0, Number(historyLength) - 10)
        for (let i = startIndex; i < Number(historyLength); i++) {
          historyPromises.push(jar.withdrawalHistory(i))
        }

        const historyResults = await Promise.all(historyPromises)
        const withdrawalHistory = historyResults
          .map((result) => ({
            user: result[0],
            amount: ethers.formatUnits(result[1], tokenDecimals),
            purpose: result[2],
            timestamp: Number(result[3]) * 1000, // Convert to milliseconds
          }))
          .reverse() // Most recent first

        return {
          id: jarAddress,
          address: jarAddress,
          name,
          description,
          network: network?.name || "Unknown",
          networkExplorer: network?.blockExplorer || "",
          accessType,
          balance,
          token,
          tokenAddress,
          tokenDecimals,
          maxWithdrawal: ethers.formatUnits(maxWithdrawalAmount, tokenDecimals),
          cooldownPeriod: cooldownPeriod.toString(),
          requirePurpose,
          fixedWithdrawalAmount,
          emergencyWithdrawalEnabled,
          isEligible,
          lastWithdrawal,
          isBlacklisted,
          withdrawalHistory,
        }
      } catch (err) {
        console.error(`Error fetching jar ${jarAddress}:`, err)
        return null
      }
    },
    [],
  )

  // Function to fetch all jars from the factory
  const fetchJars = useCallback(async () => {
    if (!isConnected || !window.ethereum) {
      setJars([])
      setLoading(false)
      setError("Wallet not connected")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const provider = new ethers.BrowserProvider(window.ethereum)
      const network = await provider.getNetwork()
      const chainId = Number(network.chainId)

      const networkInfo = getNetworkByChainId(chainId)
      if (!networkInfo) {
        setError("Unsupported network")
        setLoading(false)
        return
      }

      const networkKey = Object.keys(networks).find((key) => networks[key as keyof typeof networks].chainId === chainId)

      if (!networkKey) {
        setError("Network not found")
        setLoading(false)
        return
      }

      const factory = getFactoryContract(provider, networkKey)
      const jarCount = await factory.getCookieJarsCount()

      const jarPromises = []
      for (let i = 0; i < Number(jarCount); i++) {
        jarPromises.push(factory.cookieJars(i))
      }

      const jarAddresses = await Promise.all(jarPromises)

      // Fetch details for each jar
      const jarDetailsPromises = jarAddresses.map(async (jarAddress) => {
        return fetchJarDetails(jarAddress, networkKey, provider)
      })

      const jarsData = await Promise.all(jarDetailsPromises)
      setJars(jarsData.filter(Boolean) as JarData[])
    } catch (err) {
      console.error("Error fetching jars:", err)
      setError("Failed to fetch jars")
      toast({
        title: "Error",
        description: "Failed to fetch cookie jars",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [isConnected, toast, fetchJarDetails])

  // Function to fetch a single jar by address
  const fetchJar = useCallback(
    async (jarAddress: string) => {
      if (!isConnected || !window.ethereum) {
        setError("Wallet not connected")
        return null
      }

      try {
        setLoading(true)
        setError(null)

        const provider = new ethers.BrowserProvider(window.ethereum)
        const network = await provider.getNetwork()
        const chainId = Number(network.chainId)

        const networkInfo = getNetworkByChainId(chainId)
        if (!networkInfo) {
          setError("Unsupported network")
          setLoading(false)
          return null
        }

        const networkKey = Object.keys(networks).find(
          (key) => networks[key as keyof typeof networks].chainId === chainId,
        )

        if (!networkKey) {
          setError("Network not found")
          setLoading(false)
          return null
        }

        return await fetchJarDetails(jarAddress, networkKey, provider)
      } catch (err) {
        console.error("Error fetching jar:", err)
        setError("Failed to fetch jar details")
        toast({
          title: "Error",
          description: "Failed to fetch jar details",
          variant: "destructive",
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [isConnected, fetchJarDetails, toast],
  )

  // Load jars when wallet is connected or chain changes
  useEffect(() => {
    if (isConnected) {
      fetchJars()
    }
  }, [isConnected, fetchJars])

  return {
    jars,
    loading,
    error,
    fetchJars,
    fetchJar,
  }
}

