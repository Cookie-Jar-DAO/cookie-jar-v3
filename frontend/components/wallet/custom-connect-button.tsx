"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState, useEffect, memo } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount, useSignMessage, useChainId, useDisconnect } from "wagmi"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/design/use-toast"

// Terms and conditions message that users will sign
const TERMS_MESSAGE = `Welcome to Cookie Jar V3!

By signing this message, you agree to our Terms of Service and Privacy Policy:


1. You acknowledge these smart contracts haven't been professionally audited
2. You acknowledge you are using this app at your own risk. We aren't responsible for any losses you may experience. 
3. You agree to use the platform in compliance with applicable laws
4. You acknowledge that smart contracts may contain bugs or vulnerabilities
5. You understand that transactions on the blockchain are irreversible
6. You are responsible for securing your wallet and private keys

Date: ${new Date().toISOString().split("T")[0]}
`

export function CustomConnectButton({ className }: { className?: string }) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { signMessageAsync } = useSignMessage()
  const { disconnect } = useDisconnect()
  const [showTerms, setShowTerms] = useState(false)
  const [isSigningTerms, setIsSigningTerms] = useState(false)
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false)
  const { toast } = useToast()

  // Add this useEffect to log wallet connection status
  useEffect(() => {
    console.log("Wallet connection status changed:", {
      isConnected,
      address,
      ethereum: typeof window !== "undefined" ? !!window.ethereum : false,
    })
  }, [isConnected, address])

  // Check if user has already accepted terms (could be stored in localStorage)
  const checkTermsAccepted = () => {
    const accepted = localStorage.getItem(`terms-accepted-${address}`)
    return !!accepted
  }

  // Store that user has accepted terms
  const storeTermsAccepted = () => {
    if (address) {
      localStorage.setItem(`terms-accepted-${address}`, "true")
    }
  }

  // Handle wallet connection
  const handleConnect = async () => {
    if (isConnected && !hasAcceptedTerms && !checkTermsAccepted()) {
      setShowTerms(true)
    }
  }

  // Handle terms acceptance
  const handleAcceptTerms = async () => {
    if (!address || !chainId) return

    try {
      setIsSigningTerms(true)

      // Create the message with nonce, address and chain ID
      const nonce = Date.now().toString()
      const message = `${TERMS_MESSAGE}

Wallet: ${address}
Chain ID: ${chainId}
Nonce: ${nonce}`

      // Request signature from the user
      const signature = await signMessageAsync({ message })

      // Store that user has accepted terms
      storeTermsAccepted()
      setHasAcceptedTerms(true)
      setShowTerms(false)

      console.log("User signed terms and conditions", { message, signature })
    } catch (error) {
      console.error("Error during terms signing", error)
      // If user rejected the signature, disconnect the wallet
      disconnect()
    } finally {
      setIsSigningTerms(false)
    }
  }

  // Handle terms rejection
  const handleRejectTerms = () => {
    setShowTerms(false)
    disconnect()
  }

  return (
    <>
      <ConnectButton.Custom>
        {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
          const ready = mounted && authenticationStatus !== "loading"
          const connected =
            ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated")

          // If connected but hasn't accepted terms, show terms dialog
          if (connected && !hasAcceptedTerms && !checkTermsAccepted()) {
            setTimeout(() => setShowTerms(true), 500)
          }

          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
              className={className}
            >
              {(() => {
                if (!connected) {
                  return (
                    <Button
                      onClick={openConnectModal}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                    >
                      Connect Wallet
                    </Button>
                  )
                }

                if (chain.unsupported) {
                  return (
                    <Button onClick={openChainModal} variant="destructive">
                      Wrong network
                    </Button>
                  )
                }

                return (
                  <div className="flex items-center gap-2">
                    <Button onClick={openAccountModal} variant="outline" size="sm" className="flex items-center gap-1">
                      {chain.hasIcon && (
                        <div className="w-4 h-4">
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? "Chain icon"}
                              src={chain.iconUrl || "/placeholder.svg"}
                              className="w-4 h-4"
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </Button>

                    <Button onClick={openChainModal} variant="outline" size="sm" className="flex items-center gap-1">
                      Change Networks
                    </Button>
                  </div>
                )
              })()}
            </div>
          )
        }}
      </ConnectButton.Custom>

      {/* Terms and Conditions Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
            <DialogDescription>Please read and accept our terms and conditions to continue.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto p-4 border rounded-md my-4">
            <pre className="whitespace-pre-wrap font-sans text-sm">{TERMS_MESSAGE}</pre>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <Button variant="outline" onClick={handleRejectTerms}>
              Decline
            </Button>
            <Button variant="cookie" onClick={handleAcceptTerms} disabled={isSigningTerms}>
              {isSigningTerms ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing...
                </>
              ) : (
                "Accept & Sign"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const MemoizedCustomConnectButton = memo(CustomConnectButton)
