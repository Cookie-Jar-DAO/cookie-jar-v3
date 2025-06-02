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
  celoAlfajores,
} from 'wagmi/chains';
import { createConfig, createStorage, cookieStorage, http } from 'wagmi';
import { 
  injected, 
  metaMask, 
  coinbaseWallet, 
  walletConnect 
} from 'wagmi/connectors';
import { Address } from 'viem';
import { Chain } from '@rainbow-me/rainbowkit';

// Define supported chains
export const supportedChains: readonly [Chain, ...Chain[]] = [
  base,
  celo,
  gnosis,
  optimism,
  baseSepolia,
  optimismSepolia,
];

// Define contract addresses for supported networks
interface ContractAddresses {
  cookieJarFactory: Record<number, Address>;
  cookieJarRegistry: Record<number, Address>;
}

export const contractAddresses: ContractAddresses = {
  cookieJarFactory: {
    [gnosis.id]: '0x86dBf7076202FDf89792038B97e41aC8A4A8Bef9',
    [base.id]: '0x86dBf7076202FDf89792038B97e41aC8A4A8Bef9',
    [optimism.id]: '0x86dBf7076202FDf89792038B97e41aC8A4A8Bef9',
    [celo.id]: '0x86dBf7076202FDf89792038B97e41aC8A4A8Bef9',
    [baseSepolia.id]: '0x86dBf7076202FDf89792038B97e41aC8A4A8Bef9',
    [optimismSepolia.id]: '0x86dBf7076202FDf89792038B97e41aC8A4A8Bef9',
    [mainnet.id]: '0x86dBf7076202FDf89792038B97e41aC8A4A8Bef9',
  },
  cookieJarRegistry: {},
};

// Retrieve environment variables
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '';
const infuraId = process.env.NEXT_PUBLIC_INFURA_ID || '';

// Create connectors conditionally based on environment
function getConnectors() {
  // Check if we're on the client side
  if (typeof window !== 'undefined') {
    // Client-side: Use RainbowKit connectors for proper wallet UI
    try {
      const { connectorsForWallets } = require('@rainbow-me/rainbowkit');
      const {
        injectedWallet,
        metaMaskWallet,
        coinbaseWallet: coinbaseWalletRK,
        walletConnectWallet,
      } = require('@rainbow-me/rainbowkit/wallets');

      return connectorsForWallets(
        [
          {
            groupName: 'Recommended',
            wallets: [
              metaMaskWallet,
              coinbaseWalletRK,
              walletConnectWallet,
              injectedWallet,
            ],
          },
        ],
        {
          appName: 'Cookie Jar V3',
          projectId,
        }
      );
    } catch (error) {
      // Fallback to wagmi connectors if RainbowKit import fails
      console.warn('Failed to load RainbowKit connectors, falling back to wagmi connectors');
      return [
        injected(),
        metaMask(),
        coinbaseWallet({ appName: 'Your App Name' }),
        walletConnect({ projectId }),
      ];
    }
  } else {
    // Server-side: Use basic wagmi connectors for SSR
    return [
      injected(),
      metaMask(),
      coinbaseWallet({ appName: 'Your App Name' }),
      walletConnect({ projectId }),
    ];
  }
}

// Export the Wagmi configuration with SSR support
export function getWagmiConfig() {
  return createConfig({
    chains: supportedChains,
    connectors: getConnectors(),
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [base.id]: http(`https://base-mainnet.infura.io/v3/${infuraId}`),
      [optimism.id]: http(`https://optimism-mainnet.infura.io/v3/${infuraId}`),
      [gnosis.id]: http(`https://gnosis-mainnet.infura.io/v3/${infuraId}`),
      [baseSepolia.id]: http('https://sepolia.base.org'),
      [optimismSepolia.id]: http('https://sepolia.optimism.io'),
      [celo.id]: http('https://forno.celo.org'),
    },
  });
}

// Export the configuration for use in your application
export const wagmiConfig = getWagmiConfig();
