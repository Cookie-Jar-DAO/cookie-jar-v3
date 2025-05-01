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

1. You are responsible for securing your wallet and private keys
2. You understand the risks associated with blockchain transactions
3. You agree to use the platform in compliance with applicable laws
4. You acknowledge that smart contracts may contain bugs or vulnerabilities
5. You understand that transactions on the blockchain are irreversible

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
                    <button
                      className="flex items-center gap-2 text-white hover:text-[#C3FF00] transition-colors"
                      onClick={openConnectModal}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#C3FF00]"
                      >
                        <path
                          d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 12C16 10.8954 16.8954 10 18 10C19.1046 10 20 10.8954 20 12C20 13.1046 19.1046 14 18 14C16.8954 14 16 13.1046 16 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Connect Wallet
                    </button>
                  )
                }

                if (chain.unsupported) {
                  return (
                    <Button onClick={openChainModal} variant="destructive" size="sm">
                      Wrong network
                    </Button>
                  )
                }

                return (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={openChainModal}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 bg-transparent border-[#555555] text-white hover:text-[#C3FF00] hover:bg-transparent"
                    >
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

                    <Button
                      onClick={openAccountModal}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 bg-transparent border-[#555555] text-white hover:text-[#C3FF00] hover:bg-transparent"
                    >
                      {/* Replace ENS display with truncated address */}
                      {account.address
                        ? `${account.address.substring(0, 6)}...${account.address.substring(account.address.length - 4)}`
                        : "Unknown"}
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
        <DialogContent className="sm:max-w-md bg-[#393939] text-white border-[#555555]">
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
            <DialogDescription className="text-gray-300">
              Please read and accept our terms and conditions to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto p-4 border rounded-md my-4 border-[#555555] bg-[#2A2A2A]">
            <pre className="whitespace-pre-wrap font-sans text-sm text-white">{TERMS_MESSAGE}</pre>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <Button
              variant="outline"
              onClick={handleRejectTerms}
              className="border-[#555555] text-white hover:text-[#C3FF00] hover:bg-transparent"
            >
              Decline
            </Button>
            <Button
              onClick={handleAcceptTerms}
              disabled={isSigningTerms}
              className="bg-[#C3FF00] text-black hover:bg-[#A3DF00]"
            >
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
