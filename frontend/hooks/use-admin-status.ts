"use client"

import { useState, useEffect, useCallback } from "react"
import { useAccount } from "wagmi"
import { keccak256, toUtf8Bytes } from "ethers"
import { ethers } from "ethers"

export function useAdminStatus(jarAddresses: string[]) {
  const [adminJars, setAdminJars] = useState<Record<string, boolean>>({})
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false)
  const { address: userAddress } = useAccount()

  // Move checkAdminStatus outside useEffect and make it a useCallback
  const checkAdminStatus = useCallback(async () => {
    if (!userAddress || jarAddresses.length === 0) return

    setIsCheckingAdmin(true)
    console.log("Checking admin status for", userAddress, "on", jarAddresses.length, "jars")

    // Create a provider
    const provider = window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null
    if (!provider) {
      console.error("No provider available")
      setIsCheckingAdmin(false)
      return
    }

    try {
      // Try different role names that might be used in the contract
      // The contract might use JAR_ADMIN, JAR_OWNER, or just ADMIN
      const JAR_ADMIN = keccak256(toUtf8Bytes("JAR_ADMIN")) as `0x${string}`
      const JAR_OWNER = keccak256(toUtf8Bytes("JAR_OWNER")) as `0x${string}`
      const ADMIN = keccak256(toUtf8Bytes("ADMIN")) as `0x${string}`

      console.log("Checking roles:", {
        JAR_ADMIN,
        JAR_OWNER,
        ADMIN,
      })

      const adminStatuses: Record<string, boolean> = {}

      // Process in batches to avoid rate limiting
      const batchSize = 10
      for (let i = 0; i < jarAddresses.length; i += batchSize) {
        const batch = jarAddresses.slice(i, i + batchSize)
        console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(jarAddresses.length / batchSize)}`)

        // Create promises for all checks at once
        const promises = batch.map(async (jarAddress) => {
          try {
            // First, try to check if the user is the jar owner directly
            const contract = new ethers.Contract(
              jarAddress,
              [
                {
                  inputs: [],
                  name: "jarOwner",
                  outputs: [{ name: "", type: "address" }],
                  stateMutability: "view",
                  type: "function",
                },
                {
                  inputs: [
                    { name: "role", type: "bytes32" },
                    { name: "account", type: "address" },
                  ],
                  name: "hasRole",
                  outputs: [{ name: "", type: "bool" }],
                  stateMutability: "view",
                  type: "function",
                },
              ],
              provider,
            )

            // Try to get the jar owner first
            try {
              const owner = await contract.jarOwner()
              if (owner && owner.toLowerCase() === userAddress.toLowerCase()) {
                console.log(`User is the owner of jar ${jarAddress}`)
                adminStatuses[jarAddress] = true
                return
              }
            } catch (error) {
              console.log(`Jar ${jarAddress} doesn't have jarOwner method, trying hasRole`)
            }

            // Try all possible role names
            let isAdmin = false

            try {
              isAdmin = await contract.hasRole(JAR_ADMIN, userAddress)
              if (isAdmin) {
                console.log(`User has JAR_ADMIN role for jar ${jarAddress}`)
                adminStatuses[jarAddress] = true
                return
              }
            } catch (error) {
              console.log(`Error checking JAR_ADMIN role for ${jarAddress}:`, error)
            }

            try {
              isAdmin = await contract.hasRole(JAR_OWNER, userAddress)
              if (isAdmin) {
                console.log(`User has JAR_OWNER role for jar ${jarAddress}`)
                adminStatuses[jarAddress] = true
                return
              }
            } catch (error) {
              console.log(`Error checking JAR_OWNER role for ${jarAddress}:`, error)
            }

            try {
              isAdmin = await contract.hasRole(ADMIN, userAddress)
              if (isAdmin) {
                console.log(`User has ADMIN role for jar ${jarAddress}`)
                adminStatuses[jarAddress] = true
                return
              }
            } catch (error) {
              console.log(`Error checking ADMIN role for ${jarAddress}:`, error)
            }

            // If we get here, the user is not an admin
            adminStatuses[jarAddress] = false
          } catch (error) {
            console.error(`Error checking admin status for ${jarAddress}:`, error)
            adminStatuses[jarAddress] = false
          }
        })

        // Wait for all promises in this batch
        await Promise.all(promises)

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < jarAddresses.length) {
          await new Promise((resolve) => setTimeout(resolve, 50))
        }
      }

      // Update state with all results at once
      console.log("Admin statuses:", adminStatuses)
      setAdminJars(adminStatuses)
    } catch (error) {
      console.error("Error checking admin status:", error)
    } finally {
      setIsCheckingAdmin(false)
    }
  }, [userAddress, jarAddresses])

  // Use the checkAdminStatus function in useEffect
  useEffect(() => {
    if (userAddress && jarAddresses.length > 0) {
      checkAdminStatus()
    }
  }, [userAddress, jarAddresses, checkAdminStatus])

  // Now refreshAdminStatus can call checkAdminStatus directly
  const refreshAdminStatus = async () => {
    if (userAddress && jarAddresses.length > 0) {
      setAdminJars({}) // Clear previous admin statuses
      await checkAdminStatus()
    }
  }

  return {
    adminJars,
    isCheckingAdmin,
    refreshAdminStatus,
  }
}
