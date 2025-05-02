"use client"

import { keccak256, toUtf8Bytes } from "ethers"
import { useAccount } from "wagmi"
import { useReadContracts } from "wagmi"
import { cookieJarAbi } from "../generated" // assuming this exists

/**
 * Enum for Access Type
 */
enum AccessType {
  Whitelist = 0,
  NFTGated = 1,
}

/**
 * Enum for Withdrawal Type Options
 */
enum WithdrawalTypeOptions {
  Fixed = 0,
  Variable = 1,
}

/**
 * Hook to read all configuration values from the CookieJar contract
 * @returns All configuration values and loading/error states
 */
// export const useCookieJarConfig = (address: `0x${string}`) => {
//   const account = useAccount()
//   const userAddress = account.address as `0x${string}`
//   const cacheRef = useRef<{
//     address: string
//     data: any
//     timestamp: number
//   } | null>(null)

//   // Add cache validation before making requests
//   const shouldRefetch =
//     !cacheRef.current || cacheRef.current.address !== address || Date.now() - cacheRef.current.timestamp > 30000 // 30 seconds cache

//   // Modify the query options to use the cache
//   const queryOptions = {
//     enabled: shouldRefetch,
//   }

//   // Use queryOptions in all your queries
//   const accessType = useReadCookieJarAccessType({ address, query: queryOptions })
//   const admin = useReadCookieJarJarOwner({ address, query: queryOptions })
//   const withdrawalOption = useReadCookieJarWithdrawalOption({ address, query: queryOptions })
//   const fixedAmount = useReadCookieJarFixedAmount({ address, query: queryOptions })
//   const maxWithdrawal = useReadCookieJarMaxWithdrawal({ address, query: queryOptions })
//   const withdrawalInterval = useReadCookieJarWithdrawalInterval({ address, query: queryOptions })
//   const strictPurpose = useReadCookieJarStrictPurpose({ address, query: queryOptions })
//   const emergencyWithdrawalEnabled = useReadCookieJarEmergencyWithdrawalEnabled({ address, query: queryOptions })
//   const oneTimeWithdrawal = useReadCookieJarOneTimeWithdrawal({
//     address,
//     query: queryOptions,
//   })

//   const pastWithdrawals = useReadCookieJarGetWithdrawalDataArray({
//     address,
//     query: queryOptions,
//   })
//   const feeCollector = useReadCookieJarFeeCollector({ address, query: queryOptions })
//   // Encode role names to bytes32, same as Solidity
//   const JAR_OWNER = keccak256(toUtf8Bytes("JAR_OWNER")) as `0x${string}`
//   const JAR_BLACKLISTED = keccak256(toUtf8Bytes("JAR_BLACKLISTED")) as `0x${string}`
//   const JAR_WHITELISTED = keccak256(toUtf8Bytes("JAR_WHITELISTED")) as `0x${string}`

//   // Now use it in the function call
//   const whitelist = useReadCookieJarHasRole({
//     address,
//     args: [JAR_WHITELISTED, userAddress],
//     query: queryOptions,
//   })

//   const blacklist = useReadCookieJarHasRole({
//     address,
//     args: [JAR_BLACKLISTED, userAddress],
//     query: queryOptions,
//   })
//   const lastWithdrawalWhitelist = useReadCookieJarLastWithdrawalWhitelist({
//     address,
//     args: [userAddress],
//     query: queryOptions,
//   })
//   const lastWithdrawalNft = useReadCookieJarLastWithdrawalNft({
//     address,
//     args: [userAddress],
//     query: queryOptions,
//   })
//   const balance = useReadCookieJarCurrencyHeldByJar({
//     address,
//     query: queryOptions,
//   })
//   const currency = useReadCookieJarCurrency({ address, query: queryOptions })

//   const isLoading = [
//     accessType.isLoading,
//     admin.isLoading,
//     withdrawalOption.isLoading,
//     fixedAmount.isLoading,
//     maxWithdrawal.isLoading,
//     withdrawalInterval.isLoading,
//     strictPurpose.isLoading,
//     emergencyWithdrawalEnabled.isLoading,
//     oneTimeWithdrawal.isLoading,
//     pastWithdrawals.isLoading,
//     feeCollector.isLoading,
//     whitelist.isLoading,
//     blacklist.isLoading,
//     lastWithdrawalWhitelist.isLoading,
//     lastWithdrawalNft.isLoading,
//     currency.isLoading,
//     balance.isLoading,
//   ].some(Boolean)

//   const hasError = [
//     accessType.isError,
//     admin.isError,
//     withdrawalOption.isError,
//     fixedAmount.isError,
//     maxWithdrawal.isError,
//     withdrawalInterval.isError,
//     strictPurpose.isError,
//     emergencyWithdrawalEnabled.isError,
//     oneTimeWithdrawal.isError,
//     feeCollector.isError,
//     whitelist.isError,
//     blacklist.isError,
//     currency.isError,
//     balance.isError,
//   ].some(Boolean)

//   const errors = [
//     accessType.error,
//     admin.error,
//     withdrawalOption.error,
//     fixedAmount.error,
//     maxWithdrawal.error,
//     withdrawalInterval.error,
//     strictPurpose.error,
//     emergencyWithdrawalEnabled.error,
//     oneTimeWithdrawal.error,
//     pastWithdrawals.error,
//     feeCollector.error,
//     whitelist.error,
//     blacklist.error,
//     lastWithdrawalWhitelist.error,
//     lastWithdrawalNft.error,
//     currency.error,
//     balance.error,
//   ].filter(Boolean)

//   useEffect(() => {
//     if (!isLoading && !hasError && accessType.data !== undefined) {
//       cacheRef.current = {
//         address: address,
//         data: {
//           // Store all the data here
//           accessType: accessType.data,
//           admin: admin.data,
//           withdrawalOption: withdrawalOption.data,
//           fixedAmount: fixedAmount.data,
//           maxWithdrawal: maxWithdrawal.data,
//           withdrawalInterval: withdrawalInterval.data,
//           strictPurpose: strictPurpose.data,
//           emergencyWithdrawalEnabled: emergencyWithdrawalEnabled.data,
//           oneTimeWithdrawal: oneTimeWithdrawal.data,
//           pastWithdrawals: pastWithdrawals.data,
//           feeCollector: feeCollector.data,
//           whitelist: whitelist.data,
//           blacklist: blacklist.data,
//           lastWithdrawalWhitelist: lastWithdrawalWhitelist.data,
//           lastWithdrawalNft: lastWithdrawalNft.data,
//           balance: balance.data,
//           currency: currency.data,
//         },
//         timestamp: Date.now(),
//       }
//     }
//   }, [
//     isLoading,
//     hasError,
//     address,
//     accessType.data,
//     admin.data,
//     withdrawalOption.data,
//     fixedAmount.data,
//     maxWithdrawal.data,
//     withdrawalInterval.data,
//     strictPurpose.data,
//     emergencyWithdrawalEnabled.data,
//     oneTimeWithdrawal.data,
//     pastWithdrawals.data,
//     feeCollector.data,
//     whitelist.data,
//     blacklist.data,
//     lastWithdrawalWhitelist.data,
//     lastWithdrawalNft.data,
//     currency.data,
//     balance.data,
//   ])

//   return {
//     config: {
//       JAR_OWNER: JAR_OWNER,
//       contractAddress: address as `0x${string}`,
//       accessType: accessType.data !== undefined ? AccessType[accessType.data] : undefined,
//       admin: admin.data,
//       withdrawalOption: withdrawalOption.data !== undefined ? WithdrawalTypeOptions[withdrawalOption.data] : undefined,
//       fixedAmount: fixedAmount.data,
//       maxWithdrawal: maxWithdrawal.data,
//       withdrawalInterval: withdrawalInterval.data,
//       strictPurpose: strictPurpose.data,
//       emergencyWithdrawalEnabled: emergencyWithdrawalEnabled.data,
//       oneTimeWithdrawal: oneTimeWithdrawal.data,
//       pastWithdrawals: pastWithdrawals.data,
//       feeCollector: feeCollector.data,
//       whitelist: whitelist.data,
//       blacklist: blacklist.data,
//       lastWithdrawalWhitelist: lastWithdrawalWhitelist.data,
//       lastWithdrawalNft: lastWithdrawalNft.data,
//       balance: balance.data,
//       currency: currency.data,
//       metadata: undefined, // Add this line
//     },
//     isLoading,
//     hasError,
//     errors,
//   }
// }

/**
 *
 * Optimised
 */

export const useCookieJarConfig = (address: `0x${string}`) => {
  const { address: userAddress } = useAccount()

  const JAR_OWNER = keccak256(toUtf8Bytes("JAR_OWNER")) as `0x${string}`
  const JAR_BLACKLISTED = keccak256(toUtf8Bytes("JAR_BLACKLISTED")) as `0x${string}`
  const JAR_WHITELISTED = keccak256(toUtf8Bytes("JAR_WHITELISTED")) as `0x${string}`

  const { data, isLoading, isError, error, refetch } = useReadContracts({
    contracts: [
      { address, abi: cookieJarAbi, functionName: "accessType" },
      { address, abi: cookieJarAbi, functionName: "jarOwner" },
      { address, abi: cookieJarAbi, functionName: "withdrawalOption" },
      { address, abi: cookieJarAbi, functionName: "fixedAmount" },
      { address, abi: cookieJarAbi, functionName: "maxWithdrawal" },
      { address, abi: cookieJarAbi, functionName: "withdrawalInterval" },
      { address, abi: cookieJarAbi, functionName: "strictPurpose" },
      { address, abi: cookieJarAbi, functionName: "emergencyWithdrawalEnabled" },
      { address, abi: cookieJarAbi, functionName: "oneTimeWithdrawal" },
      { address, abi: cookieJarAbi, functionName: "getWithdrawalDataArray" },
      { address, abi: cookieJarAbi, functionName: "feeCollector" },
      { address, abi: cookieJarAbi, functionName: "hasRole", args: [JAR_WHITELISTED, userAddress!] },
      { address, abi: cookieJarAbi, functionName: "hasRole", args: [JAR_BLACKLISTED, userAddress!] },
      { address, abi: cookieJarAbi, functionName: "lastWithdrawalWhitelist", args: [userAddress!] },
      { address, abi: cookieJarAbi, functionName: "lastWithdrawalNFT", args: [userAddress!] },
      { address, abi: cookieJarAbi, functionName: "currencyHeldByJar" },
      { address, abi: cookieJarAbi, functionName: "currency" },
    ],
    allowFailure: true,
  })

  const AccessType = ["Whitelist", "NFTGated"]
  const WithdrawalTypeOptions = ["Fixed", "Variable"]

  return {
    config: {
      JAR_OWNER,
      contractAddress: address,
      accessType: data?.[0]?.result !== undefined ? AccessType[data[0].result as number] : undefined,
      admin: data?.[1]?.result,
      withdrawalOption: data?.[2]?.result !== undefined ? WithdrawalTypeOptions[data[2].result as number] : undefined,
      fixedAmount: data?.[3]?.result,
      maxWithdrawal: data?.[4]?.result,
      withdrawalInterval: data?.[5]?.result,
      strictPurpose: data?.[6]?.result,
      emergencyWithdrawalEnabled: data?.[7]?.result,
      oneTimeWithdrawal: data?.[8]?.result,
      pastWithdrawals: data?.[9]?.result,
      feeCollector: data?.[10]?.result,
      whitelist: data?.[11]?.result,
      blacklist: data?.[12]?.result,
      lastWithdrawalWhitelist: data?.[13]?.result,
      lastWithdrawalNft: data?.[14]?.result,
      balance: data?.[15]?.result,
      currency: data?.[16]?.result,
      metadata: undefined,
    },
    isLoading,
    hasError: isError,
    errors: error ? [error] : [],
    refetch: async () => {
      // Use the refetch function from useReadContracts
      const result = await refetch()
      return result
    },
  }
}
