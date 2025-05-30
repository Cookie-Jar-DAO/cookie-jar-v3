"use client"
//deprecated
//this file isn't being used anywhere 
//5/27/25 <3 MSG

import { useState, useRef, type ReactNode } from "react"
import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
  type AuthenticationStatus,
} from "@rainbow-me/rainbowkit"
import { useAccount, useSignMessage, useChainId } from "wagmi"

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

export function TermsAndConditionsAuth({ children }: { children: ReactNode }) {
  const { address } = useAccount()
  const chainId = useChainId()
  const [authStatus, setAuthStatus] = useState<AuthenticationStatus>("unauthenticated")
  const { signMessageAsync } = useSignMessage()

  // Use a ref to track if we're currently in the authentication process
  const isAuthenticating = useRef(false)

  // Create a custom authentication adapter
  const authAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      return "cookie-jar-v3-terms-" + Date.now().toString()
    },

    createMessage: ({ nonce, address, chainId }: { nonce: string; address: `0x${string}`; chainId: number }) => {
      return `${TERMS_MESSAGE}\n\nWallet: ${address}\nChain ID: ${chainId}\nNonce: ${nonce}`
    },

    verify: async ({ message, signature }: { message: string; signature: string }) => {
      // In a production app, you might want to verify the signature on your backend
      // and store that the user has accepted the terms
      console.log("User signed terms and conditions", { message, signature })

      // For now, we'll just consider any signature as valid
      return true
    },

    signOut: async () => {
      setAuthStatus("unauthenticated")
    },

    // This is the key method that gets called when a wallet connects
    signIn: async ({ address, chainId }) => {
      // Prevent multiple authentication attempts
      if (isAuthenticating.current) return

      try {
        isAuthenticating.current = true
        setAuthStatus("loading")

        // Get the nonce
        const nonce = await authAdapter.getNonce()

        // Create the message to sign
        const message = authAdapter.createMessage({ nonce, address, chainId })

        // Request signature from the user
        const signature = await signMessageAsync({ message })

        // Verify the signature
        await authAdapter.verify({ message, signature })

        // If verification succeeds, set status to authenticated
        setAuthStatus("authenticated")
        return { address, chainId }
      } catch (error) {
        console.error("Error during authentication", error)
        setAuthStatus("unauthenticated")
        throw error // Important: throw the error to signal authentication failure
      } finally {
        isAuthenticating.current = false
      }
    },
  })

  return (
    <RainbowKitAuthenticationProvider adapter={authAdapter} status={authStatus}>
      {children}
    </RainbowKitAuthenticationProvider>
  )
}
