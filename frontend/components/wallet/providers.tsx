'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { type State, WagmiProvider } from 'wagmi'
import { getWagmiConfig } from '@/config/supported-networks'
import { RainbowKitProviderWrapper } from './rainbow-kit-provider'

type Props = {
  children: ReactNode
  initialState: State | undefined
}

export function Providers({ children, initialState }: Props) {
  // Create config and query client only once using useState
  const [config] = useState(() => getWagmiConfig())
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProviderWrapper>
          {children}
        </RainbowKitProviderWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  )
} 