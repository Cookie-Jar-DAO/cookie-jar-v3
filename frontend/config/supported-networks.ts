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
import { Chain, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { Address } from 'viem'

// For RainbowKit provider
export const supportedChains: readonly [Chain, ...Chain[]] = [
  base,
  celo,
  gnosis,
  optimism,
  baseSepolia, 
  optimismSepolia,
  // celoAlfajores,
  // Mainnets
  // mainnet,

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

// Export the Wagmi config
export const wagmiConfig = getDefaultConfig({
  appName: "Cookie Jar V3",
  projectId,
  chains: supportedChains,
  ssr: true,
  transports: {
    [base.id]: http(`https://base-mainnet.infura.io/v3/${infuraId}`),
    [optimism.id]: http(`https://optimism-mainnet.infura.io/v3/${infuraId}`),
    [arbitrum.id]: http(`https://arbitrum-mainnet.infura.io/v3/${infuraId}`),
    [gnosis.id]: http(`https://gnosis-mainnet.infura.io/v3/${infuraId}`),
    [baseSepolia.id]: http(`https://sepolia.base.org`),
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${infuraId}`),
    [mainnet.id]: http(`https://mainnet.infura.io/v3/${infuraId}`),
    [optimismSepolia.id]: http(`https://sepolia.optimism.io`),
    [celoAlfajores.id]: http(`https://alfajores-forno.celo-testnet.org`),
    [celo.id]: http(`https://forno.celo.org`),
  },
})

