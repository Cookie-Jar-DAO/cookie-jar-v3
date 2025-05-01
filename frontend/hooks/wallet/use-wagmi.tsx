"use client"

import { useAccount, useBalance, useChainId, useSwitchChain } from "wagmi"

export function useWagmi() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { data: balance } = useBalance({
    address,
  })

  return {
    address,
    isConnected,
    chainId,
    balance,
    switchNetwork: (chainId: number) => switchChain({ chainId }),
  }
}
