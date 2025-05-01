"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useReadCookieJarHasRole, useReadCookieJarAccessType } from "@/generated"
import { keccak256, toUtf8Bytes } from "ethers"
import { ethers } from "ethers" // Import ethers

// First, let's update the NFTGate interface to match the actual structure
export interface NFTGate {
  nftAddress: `0x${string}`
  nftType: number // Instead of tokenId, isERC1155, minBalance
}

export function useNFTOwnership(jarAddress: string) {
  const [hasRequiredNFT, setHasRequiredNFT] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)
  const [nftOwnershipDetails, setNftOwnershipDetails] = useState<
    {
      nftAddress: string
      tokenId: string
      isOwned: boolean
    }[]
  >([])
  const [nftGates, setNftGates] = useState<NFTGate[]>([])
  const { address: userAddress } = useAccount()

  // Encode role name to bytes32, same as Solidity
  const JAR_WHITELISTED = keccak256(toUtf8Bytes("JAR_WHITELISTED")) as `0x${string}`
  const JAR_ADMIN = keccak256(toUtf8Bytes("JAR_ADMIN")) as `0x${string}`

  // Check if user has the JAR_WHITELISTED role
  const { data: isWhitelisted, isLoading: isLoadingWhitelist } = useReadCookieJarHasRole({
    address: jarAddress as `0x${string}`,
    args: userAddress ? [JAR_WHITELISTED, userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress && !!jarAddress,
    },
  })

  // Check if user is an admin
  const { data: isAdmin, isLoading: isLoadingAdmin } = useReadCookieJarHasRole({
    address: jarAddress as `0x${string}`,
    args: userAddress ? [JAR_ADMIN, userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress && !!jarAddress,
    },
  })

  // Check access type first
  const { data: accessType } = useReadCookieJarAccessType({
    address: jarAddress as `0x${string}`,
    query: {
      enabled: !!jarAddress,
    },
  })

  // Check NFT ownership for each gate
  useEffect(() => {
    const checkNFTOwnership = async () => {
      if (!userAddress || !jarAddress) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      let ownsAnyNFT = false
      const ownershipDetails: {
        nftAddress: string
        tokenId: string
        isOwned: boolean
      }[] = []

      try {
        // Only proceed with NFT checks if this is an NFT-gated jar (accessType === 1)
        if (accessType !== 1) {
          setNftGates([])
          setNftOwnershipDetails([])
          setHasRequiredNFT(!!isWhitelisted || !!isAdmin)
          setIsLoading(false)
          return
        }

        // Get NFT gates directly using ethers.js
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum)

          try {
            // Create a contract instance
            const contract = new ethers.Contract(
              jarAddress,
              [
                {
                  inputs: [],
                  name: "accessType",
                  outputs: [{ name: "", type: "uint8" }],
                  stateMutability: "view",
                  type: "function",
                },
                {
                  inputs: [{ name: "", type: "uint256" }],
                  name: "nftGates",
                  outputs: [
                    { name: "nftAddress", type: "address" },
                    { name: "nftType", type: "uint8" },
                  ],
                  stateMutability: "view",
                  type: "function",
                },
              ],
              provider,
            )

            // Get the number of NFT gates by trying indices until we get an error
            const gates: NFTGate[] = []
            let index = 0
            let hasMoreGates = true

            while (hasMoreGates && index < 10) {
              // Limit to 10 gates to prevent infinite loops
              try {
                const gate = await contract.nftGates(index)
                if (gate && gate.nftAddress !== "0x0000000000000000000000000000000000000000") {
                  gates.push({
                    nftAddress: gate.nftAddress,
                    nftType: Number(gate.nftType),
                  })
                }
                index++
              } catch (error) {
                hasMoreGates = false
              }
            }

            setNftGates(gates)

            // Check ownership for each gate
            for (const gate of gates) {
              const nftAddress = gate.nftAddress
              const nftType = gate.nftType

              // Determine properties based on nftType
              // Assuming: 0 = ERC721, 1 = ERC1155, 2 = Soulbound
              const isERC1155 = nftType === 1
              // For simplicity, we'll use a default tokenId of 0 and minBalance of 1
              const tokenId = BigInt(0)
              const minBalance = BigInt(1)

              let isOwned = false

              try {
                if (isERC1155) {
                  // For ERC1155, check balance
                  const erc1155Contract = new ethers.Contract(
                    nftAddress,
                    ["function balanceOf(address account, uint256 id) view returns (uint256)"],
                    provider,
                  )

                  const balance = await erc1155Contract.balanceOf(userAddress, tokenId)
                  isOwned = balance >= minBalance
                } else {
                  // For ERC721 or Soulbound
                  // Check overall balance for the collection
                  const erc721Contract = new ethers.Contract(
                    nftAddress,
                    ["function balanceOf(address owner) view returns (uint256)"],
                    provider,
                  )

                  const balance = await erc721Contract.balanceOf(userAddress)
                  isOwned = balance >= minBalance
                }
              } catch (error) {
                console.error(`Error checking NFT ownership for ${nftAddress}:`, error)
                isOwned = false
              }

              ownershipDetails.push({
                nftAddress: nftAddress,
                tokenId: tokenId.toString(),
                isOwned,
              })

              if (isOwned) {
                ownsAnyNFT = true
              }
            }

            setNftOwnershipDetails(ownershipDetails)
          } catch (error) {
            console.error("Error getting NFT gates:", error)
            setNftGates([])
            setNftOwnershipDetails([])
          }
        }

        // User has required NFT if they own any of the NFTs, are whitelisted, or are an admin
        setHasRequiredNFT(ownsAnyNFT || !!isWhitelisted || !!isAdmin)
      } catch (error) {
        console.error("Error checking NFT ownership:", error)
        setHasRequiredNFT(!!isWhitelisted || !!isAdmin) // Fallback to role check
      } finally {
        setIsLoading(false)
      }
    }

    if (!isLoadingWhitelist && !isLoadingAdmin && userAddress) {
      checkNFTOwnership()
    }
  }, [userAddress, accessType, isWhitelisted, isAdmin, isLoadingWhitelist, isLoadingAdmin, jarAddress])

  return {
    hasRequiredNFT,
    isLoading,
    nftGates,
    nftOwnershipDetails,
  }
}

// Add a new function to check NFT access for multiple jars
export async function checkBatchNFTAccess(
  jarAddresses: string[],
  userAddress: string | undefined,
  provider: ethers.BrowserProvider,
): Promise<Record<string, boolean>> {
  if (!userAddress || !provider) {
    return {}
  }

  const results: Record<string, boolean> = {}

  // Process in batches to avoid rate limiting
  const batchSize = 5
  for (let i = 0; i < jarAddresses.length; i += batchSize) {
    const batch = jarAddresses.slice(i, i + batchSize)

    // Process batch in parallel
    await Promise.all(
      batch.map(async (jarAddress) => {
        try {
          // Create a contract instance
          const contract = new ethers.Contract(
            jarAddress,
            [
              {
                inputs: [],
                name: "accessType",
                outputs: [{ name: "", type: "uint8" }],
                stateMutability: "view",
                type: "function",
              },
              {
                inputs: [{ name: "", type: "uint256" }],
                name: "nftGates",
                outputs: [
                  { name: "nftAddress", type: "address" },
                  { name: "nftType", type: "uint8" },
                ],
                stateMutability: "view",
                type: "function",
              },
            ],
            provider,
          )

          // Check if jar is NFT-gated
          const accessType = await contract.accessType()
          if (Number(accessType) !== 1) {
            results[jarAddress] = false
            return
          }

          // Get NFT gates by trying indices until we get an error
          const gates: NFTGate[] = []
          let index = 0
          let hasMoreGates = true

          while (hasMoreGates && index < 10) {
            // Limit to 10 gates to prevent infinite loops
            try {
              const gate = await contract.nftGates(index)
              if (gate && gate.nftAddress !== "0x0000000000000000000000000000000000000000") {
                gates.push({
                  nftAddress: gate.nftAddress,
                  nftType: Number(gate.nftType),
                })
              }
              index++
            } catch (error) {
              hasMoreGates = false
            }
          }

          // If no gates, mark as no access
          if (!gates || gates.length === 0) {
            results[jarAddress] = false
            return
          }

          // Check ownership for each gate
          let hasAccess = false
          for (const gate of gates) {
            const nftAddress = gate.nftAddress
            const nftType = gate.nftType

            // Check if user owns this NFT
            try {
              if (nftType === 1) {
                // ERC1155
                const erc1155Contract = new ethers.Contract(
                  nftAddress,
                  ["function balanceOf(address account, uint256 id) view returns (uint256)"],
                  provider,
                )
                const balance = await erc1155Contract.balanceOf(userAddress, 0)
                if (balance > 0) {
                  hasAccess = true
                  break
                }
              } else {
                // ERC721 or other
                const erc721Contract = new ethers.Contract(
                  nftAddress,
                  ["function balanceOf(address owner) view returns (uint256)"],
                  provider,
                )
                const balance = await erc721Contract.balanceOf(userAddress)
                if (balance > 0) {
                  hasAccess = true
                  break
                }
              }
            } catch (error) {
              console.error(`Error checking NFT ownership for ${nftAddress}:`, error)
            }
          }

          results[jarAddress] = hasAccess
        } catch (error) {
          console.error(`Error checking NFT access for ${jarAddress}:`, error)
          results[jarAddress] = false
        }
      }),
    )

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < jarAddresses.length) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  return results
}
