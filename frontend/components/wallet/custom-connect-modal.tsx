"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/design/use-toast";
import { Loader2, Wallet, ExternalLink, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useConnect, useAccount, Connector } from "wagmi";

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Connector metadata with real wallet logos
const connectorConfig: Record<string, {
  name: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  priority: number;
  walletType: string; // For deduplication
}> = {
  metaMask: {
    name: "MetaMask",
    description: "Connect using MetaMask wallet",
    icon: (
      <img 
        src="https://images.ctfassets.net/clixtyxoaeas/4rnpEzy1ATWRKVBOLxZ1Fm/a74dc1eed36d23d7ea6030383a4d5163/MetaMask-icon-fox.svg"
        alt="MetaMask"
        className="w-6 h-6"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23f59e0b'%3E%3Cpath d='M12 2l3.09 6.26L22 9l-5.55 5.41L18 21l-6-3.16L6 21l1.55-6.59L2 9l6.91-.74L12 2z'/%3E%3C/svg%3E";
        }}
      />
    ),
    bgColor: "bg-orange-50 hover:bg-orange-100",
    textColor: "text-orange-600",
    priority: 1,
    walletType: "metamask",
  },
  brave: {
    name: "Brave Wallet",
    description: "Connect using Brave Wallet",
    icon: (
      <img 
        src="https://brave.com/static-assets/images/brave-logo-sans-text.svg" 
        alt="Brave"
        className="w-6 h-6"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%237c3aed'%3E%3Cpath d='M12 2l3.09 6.26L22 9l-5.55 5.41L18 21l-6-3.16L6 21l1.55-6.59L2 9l6.91-.74L12 2z'/%3E%3C/svg%3E";
        }}
      />
    ),
    bgColor: "bg-purple-50 hover:bg-purple-100",
    textColor: "text-purple-600",
    priority: 2,
    walletType: "brave",
  },
  phantom: {
    name: "Phantom",
    description: "Connect using Phantom",
    icon: (
      <img 
        src="https://cdn.brandfetch.io/id_HKIytUb/theme/light/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B" 
        alt="Phantom"
        className="w-6 h-6 rounded"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%238b5cf6'%3E%3Cpath d='M12 2l3.09 6.26L22 9l-5.55 5.41L18 21l-6-3.16L6 21l1.55-6.59L2 9l6.91-.74L12 2z'/%3E%3C/svg%3E";
        }}
      />
    ),
    bgColor: "bg-violet-50 hover:bg-violet-100",
    textColor: "text-violet-600",
    priority: 3,
    walletType: "phantom",
  },
  walletConnect: {
    name: "WalletConnect",
    description: "Scan with WalletConnect to connect",
    icon: (
      <img 
        src="https://avatars.githubusercontent.com/u/37784886?s=200&v=4" 
        alt="WalletConnect"
        className="w-6 h-6 rounded"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%233b82f6'%3E%3Cpath d='M12 2l3.09 6.26L22 9l-5.55 5.41L18 21l-6-3.16L6 21l1.55-6.59L2 9l6.91-.74L12 2z'/%3E%3C/svg%3E";
        }}
      />
    ),
    bgColor: "bg-blue-50 hover:bg-blue-100",
    textColor: "text-blue-600",
    priority: 4,
    walletType: "walletconnect",
  },
  coinbaseWallet: {
    name: "Coinbase Wallet",
    description: "Connect using Coinbase Wallet",
    icon: (
      <img 
        src="https://avatars.githubusercontent.com/u/18060234?s=200&v=4" 
        alt="Coinbase"
        className="w-6 h-6 rounded"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%236366f1'%3E%3Cpath d='M12 2l3.09 6.26L22 9l-5.55 5.41L18 21l-6-3.16L6 21l1.55-6.59L2 9l6.91-.74L12 2z'/%3E%3C/svg%3E";
        }}
      />
    ),
    bgColor: "bg-indigo-50 hover:bg-indigo-100",
    textColor: "text-indigo-600",
    priority: 5,
    walletType: "coinbase",
  },
};

export function CustomConnectModal({ isOpen, onClose }: ConnectModalProps) {
  const { connect, connectors, error, isPending } = useConnect();
  const { isConnected } = useAccount();
  const { toast } = useToast();
  const [connectingConnector, setConnectingConnector] = useState<string | null>(null);

  // Close modal when connected
  useEffect(() => {
    if (isConnected) {
      onClose();
      setConnectingConnector(null);
    }
  }, [isConnected, onClose]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
      setConnectingConnector(null);
    }
  }, [error, toast]);

  const handleConnect = async (connector: Connector) => {
    try {
      setConnectingConnector(connector.id);
      await connect({ connector });
    } catch (err) {
      console.error("Connection error:", err);
      setConnectingConnector(null);
    }
  };

  const getConnectorInfo = (connector: Connector) => {
    // For injected connectors, try to detect specific wallet
    if (connector.id === 'injected') {
      // Check if specific wallet is available
      if (typeof window !== 'undefined' && window.ethereum) {
        if (window.ethereum.isMetaMask) {
          return { ...connectorConfig.metaMask, key: 'metamask-injected' };
        }
        if (window.ethereum.isBraveWallet) {
          return { ...connectorConfig.brave, key: 'brave-injected' };
        }
        if (window.ethereum.isPhantom) {
          return { ...connectorConfig.phantom, key: 'phantom-injected' };
        }
      }
      // Skip generic injected if we can't identify it specifically
      return null;
    }

    // Try to match by ID or name for other connectors
    const configKey = Object.keys(connectorConfig).find(key => 
      connector.id.toLowerCase().includes(key.toLowerCase()) ||
      connector.name.toLowerCase().includes(key.toLowerCase())
    );
    
    if (configKey) {
      return { ...connectorConfig[configKey], key: configKey };
    }

    // Default fallback for unknown connectors
    return {
      name: connector.name,
      description: `Connect using ${connector.name}`,
      icon: <Wallet className="w-6 h-6" />,
      bgColor: "bg-gray-50 hover:bg-gray-100",
      textColor: "text-gray-600",
      priority: 999,
      walletType: 'unknown',
      key: connector.id,
    };
  };

  // Process connectors with deduplication and filtering
  const processedConnectors = connectors
    .map(connector => ({
      connector,
      info: getConnectorInfo(connector)
    }))
    .filter(({ info }) => info !== null) // Remove injected connectors we can't identify
    .reduce((acc, current) => {
      // Deduplicate by wallet type
      const existing = acc.find(item => item.info.walletType === current.info!.walletType);
      if (!existing) {
        acc.push(current as { connector: Connector; info: NonNullable<ReturnType<typeof getConnectorInfo>> });
      }
      return acc;
    }, [] as Array<{ connector: Connector; info: NonNullable<ReturnType<typeof getConnectorInfo>> }>)
    .sort((a, b) => (a.info.priority || 999) - (b.info.priority || 999));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#3c2a14]">
            <Wallet className="w-5 h-5 text-[#ff5e14]" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-[#8b7355]">
            Choose your preferred wallet to connect to Cookie Jar V3
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-1">
          <div className="space-y-3 py-4">
            {processedConnectors.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No wallets detected</p>
                <p className="text-sm text-gray-400 mt-2">
                  Please install a wallet extension to continue
                </p>
              </div>
            )}

            {processedConnectors.map(({ connector, info }) => {
              const isConnecting = connectingConnector === connector.id;
              const isDisabled = isPending || isConnecting;

              return (
                <Button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  disabled={isDisabled}
                  variant="outline"
                  className={`w-full h-auto p-4 justify-start ${info.bgColor} border-2 border-transparent hover:border-[#ff5e14] transition-all duration-200 flex-shrink-0`}
                >
                  <div className="flex items-center gap-4 w-full min-w-0">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${info.bgColor} ${info.textColor} relative`}>
                      {isConnecting ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        info.icon
                      )}
                    </div>
                    
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium text-[#3c2a14] truncate">
                        {info.name}
                      </div>
                      <div className="text-sm text-[#8b7355] truncate">
                        {isConnecting ? "Connecting..." : info.description}
                      </div>
                    </div>

                    {!isConnecting && (
                      <ExternalLink className="w-4 h-4 text-[#8b7355] flex-shrink-0" />
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 