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
            {connectors.filter(connector => 
              !(connector.id === 'injected' && connector.name === 'Injected')
            ).length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No wallets detected</p>
                <p className="text-sm text-gray-400 mt-2">
                  Please install a wallet extension to continue
                </p>
              </div>
            )}

            {connectors
              .filter(connector => 
                !(connector.id === 'injected' && connector.name === 'Injected')
              )
              .map((connector) => {
              const isConnecting = connectingConnector === connector.id;
              const isDisabled = isPending || isConnecting;

              return (
                <Button
                  key={connector.uid}
                  onClick={() => handleConnect(connector)}
                  disabled={isDisabled}
                  variant="outline"
                  className="w-full h-auto p-4 justify-start bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-[#ff5e14] transition-all duration-200 flex-shrink-0"
                >
                  <div className="flex items-center gap-4 w-full min-w-0">
                    <div className="p-2 rounded-lg flex-shrink-0 bg-gray-50 text-gray-600 relative">
                      {isConnecting ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Wallet className="w-6 h-6" />
                      )}
                    </div>
                    
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium text-[#3c2a14] truncate">
                        {connector.name}
                      </div>
                      <div className="text-sm text-[#8b7355] truncate">
                        {isConnecting ? "Connecting..." : `Connect using ${connector.name}`}
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