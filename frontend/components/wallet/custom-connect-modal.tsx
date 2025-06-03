"use client"

import { useState, useEffect } from 'react'
import { useConnect, useConnectors } from 'wagmi'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from 'lucide-react'

interface CustomConnectModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CustomConnectModal({ isOpen, onClose }: CustomConnectModalProps) {
  const connectors = useConnectors()
  const { connect, status, error } = useConnect()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleConnect = (connector: any) => {
    connect({ connector })
    onClose()
  }

  const getConnectorIcon = (connectorId: string) => {
    switch (connectorId) {
      case 'metaMask':
        return '🦊'
      case 'walletConnect':
        return '🔗'
      case 'coinbaseWallet':
        return '🔵'
      case 'injected':
        return '📱'
      default:
        return '💼'
    }
  }

  const getConnectorName = (connector: any) => {
    switch (connector.id) {
      case 'metaMask':
        return 'MetaMask'
      case 'walletConnect':
        return 'WalletConnect'
      case 'coinbaseWallet':
        return 'Coinbase Wallet'
      case 'injected':
        return 'Injected Wallet'
      default:
        return connector.name || 'Unknown Wallet'
    }
  }

  if (!mounted) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Connect a Wallet
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to Cookie Jar V3
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {connectors.map((connector) => (
            <Button
              key={connector.id}
              variant="outline"
              className="w-full justify-start h-12 px-4"
              onClick={() => handleConnect(connector)}
              disabled={status === 'pending' || !connector.ready}
            >
              <span className="text-xl mr-3">
                {getConnectorIcon(connector.id)}
              </span>
              <span className="flex-1 text-left">
                {getConnectorName(connector)}
              </span>
              {status === 'pending' && (
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
              )}
              {!connector.ready && (
                <span className="text-xs text-gray-500 ml-2">Not Ready</span>
              )}
            </Button>
          ))}
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center mt-4">
            {error.message}
          </div>
        )}

        <div className="text-center text-sm text-gray-500 mt-4">
          By connecting, you agree to our Terms of Service
        </div>
      </DialogContent>
    </Dialog>
  )
} 