import {
  mainnet,
  base,
  optimism,
  arbitrum, 
  gnosis,
  sepolia,
  baseSepolia,
  celo,
  optimismSepolia,
  celoAlfajores
} from 'wagmi/chains'
import { createConfig, createStorage, cookieStorage, http } from 'wagmi'
import { Address } from 'viem'
import { Chain } from '@rainbow-me/rainbowkit'

// For wagmi provider - use proper wagmi chain types
export const supportedChains: readonly [Chain, ...Chain[]] = [
  base,
  celo,
  gnosis,
  optimism,
  baseSepolia, 
  optimismSepolia,

]

interface ContractAddresses {
  cookieJarFactory:Record<number, Address>
  cookieJarRegistry:Record<number, Address>
}

// Define the contract addresses for supported networks
export const contractAddresses: ContractAddresses = {
  cookieJarFactory: {
    [gnosis.id]: "0x86dBf7076202FDf89792038B97e41aC8A4A8Bef9",
    [base.id]:"0x86dBf7076202FDf89792038B97e41aC8A4A8Bef9",
    [optimism.id]: "0x86dBf7076202FDf89792038B97e41aC8A4A8Bef9",
    [celo.id]:"0x86dBf7076202FDf89792038B97e41aC8A4A8Bef9",
    [baseSepolia.id]: "0x86dBf7076202FDf89792038B97e41aC8A4A8Bef9" ,
    [optimismSepolia.id]: "0x86dBf7076202FDf89792038B97e41aC8A4A8Bef9",
    [mainnet.id]:"0x86dBf7076202FDf89792038B97e41aC8A4A8Bef9"
  },
  cookieJarRegistry:{}
}

// Get environment variables
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ""
const infuraId = process.env.NEXT_PUBLIC_INFURA_ID || ""

// Export the Wagmi config with proper SSR support
export function getWagmiConfig() {
  return createConfig({
    chains: supportedChains,
    ssr: true, // Enable SSR support
    storage: createStorage({ 
      storage: cookieStorage, // Use cookie storage for SSR
    }),
    transports: {
      [base.id]: http(`https://base-mainnet.infura.io/v3/${infuraId}`),
      [optimism.id]: http(`https://optimism-mainnet.infura.io/v3/${infuraId}`),
      [gnosis.id]: http(`https://gnosis-mainnet.infura.io/v3/${infuraId}`),
      [baseSepolia.id]: http(`https://sepolia.base.org`),
      [optimismSepolia.id]: http(`https://sepolia.optimism.io`),
      [celo.id]: http(`https://forno.celo.org`),
    },
  })
}

// Keep the old export for backward compatibility during transition
export const wagmiConfig = getWagmiConfig()

