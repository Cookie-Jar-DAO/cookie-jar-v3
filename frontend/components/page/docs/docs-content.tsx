"use client"

import { useEffect } from "react"

interface DocsContentProps {
  activeItem: string
}

export function DocsContent({ activeItem }: DocsContentProps) {
  // Scroll to top when active item changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activeItem])

  const renderContent = () => {
    switch (activeItem) {
      case "introduction":
        return (
          <>
            <h1 className="text-4xl font-bold text-white mb-6">Introduction to Cookie Jar</h1>
            <p className="text-[#AAAAAA] text-lg mb-6">
              Cookie Jar is a platform for creating controlled token pools with customizable access rules, withdrawal
              limits, and transparent tracking. It allows teams, communities, and organizations to manage shared funds
              in a transparent and accountable way.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">What is Cookie Jar?</h2>
            <p className="text-[#AAAAAA] mb-6">
              Cookie Jar is a decentralized platform built on Ethereum that enables the creation and management of
              shared token pools. These "jars" can be configured with various access controls, withdrawal rules, and
              transparency features to suit different use cases.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Key Features</h2>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong className="text-[#C3FF00]">Dual Access Control:</strong> Choose between whitelist or NFT-gated
                access to control who can withdraw from your jar.
              </li>
              <li>
                <strong className="text-[#C3FF00]">Configurable Withdrawals:</strong> Set fixed or variable withdrawal
                amounts with customizable cooldown periods.
              </li>
              <li>
                <strong className="text-[#C3FF00]">Purpose Tracking:</strong> Require users to explain withdrawals with
                on-chain transparency for accountability.
              </li>
              <li>
                <strong className="text-[#C3FF00]">Multi-Asset Support:</strong> Support for ETH and any ERC20 token
                with a simple fee structure.
              </li>
              <li>
                <strong className="text-[#C3FF00]">Multi-Admin:</strong> Assign multiple administrators to manage your
                jar with flexible permissions.
              </li>
              <li>
                <strong className="text-[#C3FF00]">Customizable Settings:</strong> Easily configure jar settings to
                match your specific use case and requirements.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Use Cases</h2>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong className="text-[#C3FF00]">DAO Treasury Management:</strong> Create controlled spending pools
                for different initiatives.
              </li>
              <li>
                <strong className="text-[#C3FF00]">Community Funds:</strong> Manage shared resources with transparent
                withdrawal tracking.
              </li>
              <li>
                <strong className="text-[#C3FF00]">Team Expense Accounts:</strong> Set up expense accounts with
                predefined withdrawal limits.
              </li>
              <li>
                <strong className="text-[#C3FF00]">Grant Distribution:</strong> Distribute funds to grantees with
                purpose tracking.
              </li>
              <li>
                <strong className="text-[#C3FF00]">Project Budgets:</strong> Allocate and track spending for specific
                projects.
              </li>
            </ul>
          </>
        )

      case "installation":
        return (
          <>
            <h1 className="text-4xl font-bold text-white mb-6">Getting Started with Cookie Jar</h1>
            <p className="text-[#AAAAAA] text-lg mb-6">
              This guide will help you get started with Cookie Jar, from connecting your wallet to creating your first
              jar.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Prerequisites</h2>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>A Web3 wallet (MetaMask, Rainbow, etc.)</li>
              <li>ETH or tokens on a supported network</li>
              <li>Basic understanding of Ethereum transactions</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Supported Networks</h2>
            <p className="text-[#AAAAAA] mb-4">Cookie Jar is available on the following networks:</p>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong className="text-[#C3FF00]">Base:</strong> Ethereum L2 scaling solution by Coinbase
              </li>
              <li>
                <strong className="text-[#C3FF00]">Optimism:</strong> Ethereum L2 with optimistic rollups
              </li>
              <li>
                <strong className="text-[#C3FF00]">Gnosis Chain:</strong> Stable, community-owned Ethereum sidechain
              </li>
              <li>
                <strong className="text-[#C3FF00]">Base Sepolia:</strong> Testnet for Base network
              </li>
              <li>
                <strong className="text-[#C3FF00]">Arbitrum:</strong> Ethereum L2 with optimistic rollups (coming soon)
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Connecting Your Wallet</h2>
            <p className="text-[#AAAAAA] mb-4">To use Cookie Jar, you'll need to connect your Web3 wallet:</p>
            <ol className="list-decimal pl-6 space-y-3 text-[#AAAAAA]">
              <li>Click the "Connect Wallet" button in the sidebar</li>
              <li>Select your preferred wallet provider</li>
              <li>Approve the connection request in your wallet</li>
              <li>Accept the terms and conditions by signing a message</li>
            </ol>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Navigating the Interface</h2>
            <p className="text-[#AAAAAA] mb-4">The Cookie Jar interface consists of several main sections:</p>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong className="text-[#C3FF00]">Home:</strong> Overview of the platform
              </li>
              <li>
                <strong className="text-[#C3FF00]">Explore Jars:</strong> Browse existing cookie jars
              </li>
              <li>
                <strong className="text-[#C3FF00]">Create Jar:</strong> Set up a new cookie jar
              </li>
              <li>
                <strong className="text-[#C3FF00]">Documentation:</strong> Learn how to use the platform
              </li>
              <li>
                <strong className="text-[#C3FF00]">Profile:</strong> View your account information
              </li>
            </ul>
          </>
        )

      case "cookie-jars":
        return (
          <>
            <h1 className="text-4xl font-bold text-white mb-6">Understanding Cookie Jars</h1>
            <p className="text-[#AAAAAA] text-lg mb-6">
              Cookie Jars are the core component of the platform. They are smart contract-based token pools with
              customizable rules for access and withdrawals.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Anatomy of a Cookie Jar</h2>
            <p className="text-[#AAAAAA] mb-4">Each Cookie Jar consists of several key components:</p>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong className="text-[#C3FF00]">Owner/Admin:</strong> The address that has administrative rights over
                the jar
              </li>
              <li>
                <strong className="text-[#C3FF00]">Currency:</strong> The token type stored in the jar (ETH or ERC20)
              </li>
              <li>
                <strong className="text-[#C3FF00]">Access Control:</strong> Rules determining who can withdraw from the
                jar
              </li>
              <li>
                <strong className="text-[#C3FF00]">Withdrawal Rules:</strong> Conditions for how funds can be withdrawn
              </li>
              <li>
                <strong className="text-[#C3FF00]">Purpose Tracking:</strong> Optional requirement for withdrawal
                justification
              </li>
              <li>
                <strong className="text-[#C3FF00]">Emergency Controls:</strong> Optional features for emergency
                situations
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Jar Lifecycle</h2>
            <ol className="list-decimal pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong className="text-[#C3FF00]">Creation:</strong> A jar is created with specific configuration
                settings
              </li>
              <li>
                <strong className="text-[#C3FF00]">Funding:</strong> ETH or tokens are deposited into the jar
              </li>
              <li>
                <strong className="text-[#C3FF00]">Access Management:</strong> Whitelist addresses or set NFT gates
              </li>
              <li>
                <strong className="text-[#C3FF00]">Withdrawals:</strong> Authorized users withdraw funds according to
                rules
              </li>
              <li>
                <strong className="text-[#C3FF00]">Maintenance:</strong> Admin updates settings as needed
              </li>
            </ol>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Jar Types and Use Cases</h2>
            <div className="space-y-4 text-[#AAAAAA]">
              <div>
                <h3 className="text-xl font-bold text-[#C3FF00] mb-2">Team Treasury</h3>
                <p>
                  A jar with whitelist access for team members, with fixed withdrawal amounts and purpose tracking for
                  expense management.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#C3FF00] mb-2">Community Fund</h3>
                <p>
                  A jar with NFT-gated access for community members, with variable withdrawal amounts and cooldown
                  periods to prevent abuse.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#C3FF00] mb-2">Grant Distribution</h3>
                <p>
                  A jar with whitelist access for grantees, with fixed withdrawal amounts and strict purpose
                  requirements for accountability.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#C3FF00] mb-2">Project Budget</h3>
                <p>
                  A jar with whitelist access for project contributors, with variable withdrawal amounts and emergency
                  withdrawal enabled for the project lead.
                </p>
              </div>
            </div>
          </>
        )

      case "access-control":
        return (
          <>
            <h1 className="text-4xl font-bold text-white mb-6">Access Control</h1>
            <p className="text-[#AAAAAA] text-lg mb-6">
              Cookie Jar offers two primary methods for controlling who can access and withdraw from a jar: Whitelist
              Mode and NFT-Gated Mode.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Whitelist Mode</h2>
            <p className="text-[#AAAAAA] mb-4">
              In Whitelist Mode, only explicitly approved addresses can withdraw funds from the jar.
            </p>

            <h3 className="text-xl font-bold text-[#C3FF00] mt-6 mb-2">Key Features</h3>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong>Explicit Permission:</strong> Each address must be individually approved by an admin
              </li>
              <li>
                <strong>Fine-Grained Control:</strong> Admins can add or remove addresses at any time
              </li>
              <li>
                <strong>Simplicity:</strong> Straightforward to understand and manage
              </li>
            </ul>

            <h3 className="text-xl font-bold text-[#C3FF00] mt-6 mb-2">Best For</h3>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>Small teams with known members</li>
              <li>Projects with limited, well-defined participants</li>
              <li>Situations requiring high control over access</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">NFT-Gated Mode</h2>
            <p className="text-[#AAAAAA] mb-4">
              In NFT-Gated Mode, access is granted to holders of specific NFTs, allowing for more dynamic and scalable
              access control.
            </p>

            <h3 className="text-xl font-bold text-[#C3FF00] mt-6 mb-2">Key Features</h3>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong>Token-Based Access:</strong> Anyone holding the specified NFT can access the jar
              </li>
              <li>
                <strong>Multiple Collections:</strong> Support for up to 5 different NFT collections
              </li>
              <li>
                <strong>Flexible Types:</strong> Support for ERC721, ERC1155, and Soulbound tokens
              </li>
              <li>
                <strong>Minimum Balance:</strong> Configurable minimum token balance requirements
              </li>
            </ul>

            <h3 className="text-xl font-bold text-[#C3FF00] mt-6 mb-2">Best For</h3>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>DAOs with NFT-based membership</li>
              <li>Communities with existing NFT collections</li>
              <li>Projects with frequently changing participants</li>
              <li>Situations where access rights should be transferable</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Blacklist Feature</h2>
            <p className="text-[#AAAAAA] mb-4">
              Both access control modes support a blacklist feature, allowing admins to block specific addresses from
              accessing the jar, even if they would otherwise be eligible.
            </p>

            <h3 className="text-xl font-bold text-[#C3FF00] mt-6 mb-2">Use Cases</h3>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>Blocking addresses that have abused the system</li>
              <li>Temporarily restricting access during maintenance</li>
              <li>Implementing compliance requirements</li>
            </ul>
          </>
        )

      case "withdrawal-rules":
        return (
          <>
            <h1 className="text-4xl font-bold text-white mb-6">Withdrawal Rules</h1>
            <p className="text-[#AAAAAA] text-lg mb-6">
              Cookie Jar offers flexible withdrawal rules to control how and when funds can be withdrawn from a jar.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Fixed vs. Variable Withdrawals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-[#333333] p-6 rounded-lg">
                <h3 className="text-xl font-bold text-[#C3FF00] mb-4">Fixed Withdrawals</h3>
                <p className="text-[#AAAAAA] mb-4">
                  In Fixed mode, each withdrawal must be for an exact, predefined amount.
                </p>
                <h4 className="text-lg font-semibold text-white mb-2">Benefits:</h4>
                <ul className="list-disc pl-6 space-y-2 text-[#AAAAAA]">
                  <li>Predictable withdrawal amounts</li>
                  <li>Simpler accounting and tracking</li>
                  <li>Reduced risk of fund depletion</li>
                </ul>
                <h4 className="text-lg font-semibold text-white mt-4 mb-2">Best For:</h4>
                <ul className="list-disc pl-6 space-y-2 text-[#AAAAAA]">
                  <li>Regular stipends or allowances</li>
                  <li>Fixed-budget initiatives</li>
                  <li>Standardized expense reimbursements</li>
                </ul>
              </div>

              <div className="bg-[#333333] p-6 rounded-lg">
                <h3 className="text-xl font-bold text-[#C3FF00] mb-4">Variable Withdrawals</h3>
                <p className="text-[#AAAAAA] mb-4">
                  In Variable mode, users can withdraw any amount up to a configurable maximum.
                </p>
                <h4 className="text-lg font-semibold text-white mb-2">Benefits:</h4>
                <ul className="list-disc pl-6 space-y-2 text-[#AAAAAA]">
                  <li>Flexibility for different needs</li>
                  <li>Adaptability to changing circumstances</li>
                  <li>Only withdraw what's needed</li>
                </ul>
                <h4 className="text-lg font-semibold text-white mt-4 mb-2">Best For:</h4>
                <ul className="list-disc pl-6 space-y-2 text-[#AAAAAA]">
                  <li>Project funds with varying expenses</li>
                  <li>Community treasuries</li>
                  <li>Discretionary spending accounts</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Cooldown Periods</h2>
            <p className="text-[#AAAAAA] mb-4">
              Cooldown periods enforce a waiting time between withdrawals for each user, preventing rapid draining of
              funds.
            </p>

            <h3 className="text-xl font-bold text-[#C3FF00] mt-6 mb-2">Configuration Options</h3>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong>Time-Based:</strong> Set in days (converted to seconds on-chain)
              </li>
              <li>
                <strong>Per-User Tracking:</strong> Each user has their own cooldown timer
              </li>
              <li>
                <strong>Customizable:</strong> From minutes to months depending on use case
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Purpose Requirements</h2>
            <p className="text-[#AAAAAA] mb-4">
              The "Strict Purpose" feature requires users to provide a reason for each withdrawal, enhancing
              transparency and accountability.
            </p>

            <h3 className="text-xl font-bold text-[#C3FF00] mt-6 mb-2">Key Features</h3>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong>On-Chain Storage:</strong> Purpose statements are stored permanently on the blockchain
              </li>
              <li>
                <strong>Minimum Length:</strong> Enforces a minimum character count for meaningful explanations
              </li>
              <li>
                <strong>Public Visibility:</strong> Anyone can view withdrawal purposes for transparency
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Emergency Withdrawal</h2>
            <p className="text-[#AAAAAA] mb-4">
              The optional emergency withdrawal feature allows jar admins to withdraw all funds in case of urgent
              situations.
            </p>

            <h3 className="text-xl font-bold text-[#C3FF00] mt-6 mb-2">Important Considerations</h3>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>Can be enabled or disabled during jar creation</li>
              <li>Only accessible to jar admins</li>
              <li>Should be used responsibly and only in genuine emergencies</li>
              <li>All emergency withdrawals are logged on-chain for accountability</li>
            </ul>
          </>
        )

      case "creating-a-jar":
        return (
          <>
            <h1 className="text-4xl font-bold text-white mb-6">Creating a Cookie Jar</h1>
            <p className="text-[#AAAAAA] text-lg mb-6">
              This guide walks you through the process of creating a new Cookie Jar with your desired configuration.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Step 1: Basic Information</h2>
            <p className="text-[#AAAAAA] mb-4">Start by providing the fundamental details for your jar:</p>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong className="text-[#C3FF00]">Network:</strong> Select the blockchain network for your jar (e.g.,
                Base, Optimism)
              </li>
              <li>
                <strong className="text-[#C3FF00]">Jar Owner:</strong> Set the address that will have admin rights
                (defaults to your address)
              </li>
              <li>
                <strong className="text-[#C3FF00]">Currency Type:</strong> Choose between ETH (native) or an ERC20 token
              </li>
              <li>
                <strong className="text-[#C3FF00]">Token Address:</strong> If using an ERC20 token, provide the contract
                address
              </li>
              <li>
                <strong className="text-[#C3FF00]">Jar Description:</strong> Add a description to help users understand
                the jar's purpose
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Step 2: Access Control</h2>
            <p className="text-[#AAAAAA] mb-4">Configure who can access and withdraw from your jar:</p>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong className="text-[#C3FF00]">Access Type:</strong> Choose between Whitelist or NFT-Gated access
              </li>
              <li>
                <strong className="text-[#C3FF00]">NFT Addresses & Types (if NFT-Gated):</strong> Add up to 5 NFT
                collections that grant access
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Step 3: Withdrawal Options</h2>
            <p className="text-[#AAAAAA] mb-4">Define how funds can be withdrawn from your jar:</p>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong className="text-[#C3FF00]">Withdrawal Option:</strong> Choose between Fixed or Variable
                withdrawals
              </li>
              <li>
                <strong className="text-[#C3FF00]">Fixed Amount (if Fixed):</strong> Set the exact amount for each
                withdrawal
              </li>
              <li>
                <strong className="text-[#C3FF00]">Maximum Withdrawal (if Variable):</strong> Set the maximum amount per
                withdrawal
              </li>
              <li>
                <strong className="text-[#C3FF00]">Withdrawal Interval:</strong> Set the cooldown period between
                withdrawals (in days)
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Step 4: Additional Features</h2>
            <p className="text-[#AAAAAA] mb-4">Configure additional options for your jar:</p>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong className="text-[#C3FF00]">Strict Purpose:</strong> Require users to provide a reason for
                withdrawals
              </li>
              <li>
                <strong className="text-[#C3FF00]">Emergency Withdrawal:</strong> Allow admins to withdraw all funds in
                emergencies
              </li>
              <li>
                <strong className="text-[#C3FF00]">One Time Withdrawal:</strong> Limit whitelisted users to a single
                withdrawal
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Step 5: Review & Create</h2>
            <p className="text-[#AAAAAA] mb-4">Review your jar configuration and create your jar:</p>
            <ol className="list-decimal pl-6 space-y-3 text-[#AAAAAA]">
              <li>Verify all settings are correct</li>
              <li>Click the "Create Cookie Jar" button</li>
              <li>Confirm the transaction in your wallet</li>
              <li>Wait for the transaction to be confirmed on the blockchain</li>
              <li>You'll be redirected to your new jar once creation is complete</li>
            </ol>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">After Creation</h2>
            <p className="text-[#AAAAAA] mb-4">Once your jar is created, you'll need to:</p>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong className="text-[#C3FF00]">Fund the Jar:</strong> Deposit ETH or tokens into your jar
              </li>
              <li>
                <strong className="text-[#C3FF00]">Manage Access:</strong> Add addresses to the whitelist or configure
                NFT gates
              </li>
              <li>
                <strong className="text-[#C3FF00]">Share the Jar:</strong> Provide the jar address to authorized users
              </li>
            </ul>

            <div className="bg-[#333333] p-6 rounded-lg mt-8">
              <h3 className="text-xl font-bold text-[#C3FF00] mb-4">Important Notes</h3>
              <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
                <li>Creating a jar requires a small gas fee for the transaction</li>
                <li>All jar settings are immutable after creation, except for access control lists</li>
                <li>Make sure to test your jar configuration on a testnet first if you're unsure</li>
              </ul>
            </div>
          </>
        )

      case "managing-a-jar":
        return (
          <>
            <h1 className="text-4xl font-bold text-white mb-6">Managing a Cookie Jar</h1>
            <p className="text-[#AAAAAA] text-lg mb-6">
              This guide covers the various administrative functions available to jar owners and admins.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Admin Dashboard</h2>
            <p className="text-[#AAAAAA] mb-4">
              As a jar admin, you'll have access to the Admin Controls tab when viewing your jar. This dashboard
              provides several management functions organized into categories:
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Ownership Management</h2>
            <p className="text-[#AAAAAA] mb-4">Control who has administrative rights over the jar:</p>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong className="text-[#C3FF00]">Transfer Jar Ownership:</strong> Transfer full admin rights to
                another address
              </li>
              <li>
                <strong className="text-[#C3FF00]">Add Admin:</strong> Grant admin privileges to additional addresses
              </li>
              <li>
                <strong className="text-[#C3FF00]">Remove Admin:</strong> Revoke admin privileges from an address
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Access Control Management</h2>
            <p className="text-[#AAAAAA] mb-4">Manage who can access and withdraw from the jar:</p>

            <h3 className="text-xl font-bold text-[#C3FF00] mt-6 mb-2">Whitelist Management</h3>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong>Add to Whitelist:</strong> Grant withdrawal permission to an address
              </li>
              <li>
                <strong>Remove from Whitelist:</strong> Revoke withdrawal permission from an address
              </li>
              <li>
                <strong>Batch Operations:</strong> Add or remove multiple addresses at once
              </li>
            </ul>

            <h3 className="text-xl font-bold text-[#C3FF00] mt-6 mb-2">Blacklist Management</h3>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong>Add to Blacklist:</strong> Block an address from withdrawing
              </li>
              <li>
                <strong>Remove from Blacklist:</strong> Unblock a previously blacklisted address
              </li>
            </ul>

            <h3 className="text-xl font-bold text-[#C3FF00] mt-6 mb-2">NFT Gate Management</h3>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong>Add NFT Gate:</strong> Add a new NFT collection that grants access
              </li>
              <li>
                <strong>Remove NFT Gate:</strong> Remove an existing NFT gate
              </li>
              <li>
                <strong>Update NFT Gate:</strong> Modify the parameters of an existing gate
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Emergency Functions</h2>
            <p className="text-[#AAAAAA] mb-4">Handle urgent situations:</p>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong className="text-[#C3FF00]">Emergency Withdrawal:</strong> Withdraw all funds from the jar (if
                enabled during creation)
              </li>
              <li>
                <strong className="text-[#C3FF00]">Pause Withdrawals:</strong> Temporarily prevent all withdrawals
              </li>
            </ul>

            <div className="bg-[#333333] p-6 rounded-lg mt-8">
              <h3 className="text-xl font-bold text-[#C3FF00] mb-4">Best Practices</h3>
              <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
                <li>Regularly review the whitelist/blacklist to ensure it's up to date</li>
                <li>Consider using a multi-sig wallet as the jar owner for additional security</li>
                <li>Document all administrative actions for transparency</li>
                <li>Use emergency functions only when absolutely necessary</li>
                <li>Test changes on a small scale before applying them broadly</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Monitoring Activity</h2>
            <p className="text-[#AAAAAA] mb-4">Keep track of jar activity:</p>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong className="text-[#C3FF00]">Withdrawal History:</strong> View all withdrawals, including amounts,
                recipients, and purposes
              </li>
              <li>
                <strong className="text-[#C3FF00]">Deposit History:</strong> Track all deposits made to the jar
              </li>
              <li>
                <strong className="text-[#C3FF00]">Admin Action Log:</strong> Review all administrative actions taken
              </li>
            </ul>
          </>
        )

      case "withdrawing-funds":
        return (
          <>
            <h1 className="text-4xl font-bold text-white mb-6">Withdrawing Funds</h1>
            <p className="text-[#AAAAAA] text-lg mb-6">
              This guide explains how to withdraw funds from a Cookie Jar as an authorized user.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Eligibility Requirements</h2>
            <p className="text-[#AAAAAA] mb-4">
              Before attempting to withdraw, ensure you meet the following requirements:
            </p>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong className="text-[#C3FF00]">Access Permission:</strong> Your address must be whitelisted or you
                must hold the required NFT
              </li>
              <li>
                <strong className="text-[#C3FF00]">Not Blacklisted:</strong> Your address must not be on the jar's
                blacklist
              </li>
              <li>
                <strong className="text-[#C3FF00]">Cooldown Period:</strong> Sufficient time must have passed since your
                last withdrawal
              </li>
              <li>
                <strong className="text-[#C3FF00]">One-Time Limit:</strong> If the jar has one-time withdrawal enabled,
                you must not have withdrawn before
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Withdrawal Process</h2>
            <ol className="list-decimal pl-6 space-y-3 text-[#AAAAAA]">
              <li>Navigate to the jar's page</li>
              <li>Connect your wallet if not already connected</li>
              <li>Select the "Withdraw Funds" tab</li>
              <li>Follow the specific withdrawal process based on the jar's configuration</li>
            </ol>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Withdrawal Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-[#333333] p-6 rounded-lg">
                <h3 className="text-xl font-bold text-[#C3FF00] mb-4">Whitelist Withdrawal</h3>
                <p className="text-[#AAAAAA] mb-4">For jars using whitelist access control:</p>
                <ol className="list-decimal pl-6 space-y-2 text-[#AAAAAA]">
                  <li>Verify your address is whitelisted</li>
                  <li>For fixed withdrawals, simply click "Withdraw Fixed Amount"</li>
                  <li>For variable withdrawals, enter your desired amount and click "Withdraw"</li>
                  <li>If purpose tracking is enabled, provide a detailed explanation</li>
                  <li>Confirm the transaction in your wallet</li>
                </ol>
              </div>

              <div className="bg-[#333333] p-6 rounded-lg">
                <h3 className="text-xl font-bold text-[#C3FF00] mb-4">NFT-Gated Withdrawal</h3>
                <p className="text-[#AAAAAA] mb-4">For jars using NFT-gated access control:</p>
                <ol className="list-decimal pl-6 space-y-2 text-[#AAAAAA]">
                  <li>Enter the NFT contract address you own</li>
                  <li>Enter the token ID of your NFT</li>
                  <li>For fixed withdrawals, click "Withdraw NFT-Gated Mode"</li>
                  <li>For variable withdrawals, enter your desired amount</li>
                  <li>If purpose tracking is enabled, provide a detailed explanation</li>
                  <li>Confirm the transaction in your wallet</li>
                </ol>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Purpose Requirements</h2>
            <p className="text-[#AAAAAA] mb-4">If the jar has strict purpose requirements enabled:</p>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>You must provide a detailed explanation for your withdrawal</li>
              <li>The explanation must meet the minimum character requirement (typically 10 characters)</li>
              <li>Your purpose will be permanently stored on the blockchain for transparency</li>
              <li>Be specific and honest about the intended use of the funds</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Cooldown Periods</h2>
            <p className="text-[#AAAAAA] mb-4">Understanding and managing cooldown periods:</p>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>Each jar has a configured cooldown period between withdrawals</li>
              <li>The interface will show you the time remaining until your next withdrawal</li>
              <li>Attempting to withdraw before the cooldown expires will result in a failed transaction</li>
              <li>Cooldown periods are tracked separately for each user</li>
            </ul>

            <div className="bg-[#333333] p-6 rounded-lg mt-8">
              <h3 className="text-xl font-bold text-[#C3FF00] mb-4">Troubleshooting</h3>
              <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
                <li>
                  <strong>Transaction Fails:</strong> Check your eligibility, cooldown period, and jar balance
                </li>
                <li>
                  <strong>Cannot See Withdraw Tab:</strong> You may not have the necessary access permissions
                </li>
                <li>
                  <strong>Purpose Not Accepted:</strong> Ensure your explanation meets the minimum length requirement
                </li>
                <li>
                  <strong>NFT Not Recognized:</strong> Verify you're using the correct NFT contract address and token ID
                </li>
              </ul>
            </div>
          </>
        )

      case "smart-contracts":
        return (
          <>
            <h1 className="text-4xl font-bold text-white mb-6">Smart Contract Reference</h1>
            <p className="text-[#AAAAAA] text-lg mb-6">
              This section provides technical details about the Cookie Jar smart contracts for developers.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Contract Architecture</h2>
            <p className="text-[#AAAAAA] mb-4">The Cookie Jar platform consists of three main smart contracts:</p>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong className="text-[#C3FF00]">CookieJar:</strong> The main contract that implements all jar
                functionality
              </li>
              <li>
                <strong className="text-[#C3FF00]">CookieJarFactory:</strong> Factory contract for creating and tracking
                CookieJar instances
              </li>
              <li>
                <strong className="text-[#C3FF00]">CookieJarRegistry:</strong> Registry contract that stores metadata
                about all created jars
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">CookieJar Contract</h2>
            <p className="text-[#AAAAAA] mb-4">The core contract implementing jar functionality:</p>

            <h3 className="text-xl font-bold text-[#C3FF00] mt-6 mb-2">Key Structures</h3>
            <div className="bg-[#333333] p-4 rounded-lg mb-6 overflow-x-auto border border-[#444444]">
              <pre className="text-white">
                {`struct JarConfig {
    string name;
    string description;
    uint256 maxWithdrawalAmount;
    uint256 cooldownPeriod;
    bool requirePurpose;
    bool fixedWithdrawalAmount;
    bool emergencyWithdrawalEnabled;
}

struct NFTGate {
    address nftAddress;
    uint256 tokenId;
    bool isERC1155;
    uint256 minBalance;
}

struct WithdrawalRecord {
    address user;
    address token;
    uint256 amount;
    string purpose;
    uint256 timestamp;
}`}
              </pre>
            </div>

            <h3 className="text-xl font-bold text-[#C3FF00] mt-6 mb-2">Main Functions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-white">Deposit Functions</h4>
                <ul className="list-disc pl-6 space-y-2 text-[#AAAAAA]">
                  <li>
                    <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                      depositETH()
                    </code>{" "}
                    - Deposit ETH to the jar
                  </li>
                  <li>
                    <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                      depositERC20(address _token, uint256 _amount)
                    </code>{" "}
                    - Deposit ERC20 tokens
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white">Withdrawal Functions</h4>
                <ul className="list-disc pl-6 space-y-2 text-[#AAAAAA]">
                  <li>
                    <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                      withdrawETH(uint256 _amount, string calldata _purpose)
                    </code>{" "}
                    - Withdraw ETH
                  </li>
                  <li>
                    <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                      withdrawERC20(address _token, uint256 _amount, string calldata _purpose)
                    </code>{" "}
                    - Withdraw ERC20 tokens
                  </li>
                  <li>
                    <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                      emergencyWithdraw(address _token)
                    </code>{" "}
                    - Emergency withdrawal (admin only)
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white">Access Control Functions</h4>
                <ul className="list-disc pl-6 space-y-2 text-[#AAAAAA]">
                  <li>
                    <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                      addToWhitelist(address _user)
                    </code>{" "}
                    - Add address to whitelist
                  </li>
                  <li>
                    <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                      removeFromWhitelist(address _user)
                    </code>{" "}
                    - Remove address from whitelist
                  </li>
                  <li>
                    <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                      addToBlacklist(address _user)
                    </code>{" "}
                    - Add address to blacklist
                  </li>
                  <li>
                    <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                      removeFromBlacklist(address _user)
                    </code>{" "}
                    - Remove address from blacklist
                  </li>
                  <li>
                    <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                      addNFTGate(address _nftAddress, uint256 _tokenId, bool _isERC1155, uint256 _minBalance)
                    </code>{" "}
                    - Add NFT gate
                  </li>
                  <li>
                    <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                      removeNFTGate(uint256 _index)
                    </code>{" "}
                    - Remove NFT gate
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white">Admin Functions</h4>
                <ul className="list-disc pl-6 space-y-2 text-[#AAAAAA]">
                  <li>
                    <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                      setAdmin(address _admin, bool _status)
                    </code>{" "}
                    - Set or remove admin
                  </li>
                  <li>
                    <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                      setFeeCollector(address _newFeeCollector)
                    </code>{" "}
                    - Set fee collector
                  </li>
                  <li>
                    <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                      updateJarConfig(...)
                    </code>{" "}
                    - Update jar configuration
                  </li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">CookieJarFactory Contract</h2>
            <p className="text-[#AAAAAA] mb-4">Factory contract for creating new CookieJar instances:</p>

            <h3 className="text-xl font-bold text-[#C3FF00] mt-6 mb-2">Key Functions</h3>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  createCookieJar(...)
                </code>{" "}
                - Create a new CookieJar with specified parameters
              </li>
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  updateFeeCollector(address _newFeeCollector)
                </code>{" "}
                - Update the fee collector address
              </li>
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  updateCreationFee(uint256 _newFee)
                </code>{" "}
                - Update the jar creation fee
              </li>
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  blacklistJar(address _jarAddress, bool _isBlacklisted)
                </code>{" "}
                - Blacklist or unblacklist a jar
              </li>
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  blacklistOwner(address _ownerAddress, bool _isBlacklisted)
                </code>{" "}
                - Blacklist or unblacklist an owner
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">CookieJarRegistry Contract</h2>
            <p className="text-[#AAAAAA] mb-4">Registry contract that stores metadata about all created jars:</p>

            <h3 className="text-xl font-bold text-[#C3FF00] mt-6 mb-2">Key Functions</h3>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  registerCookieJar(address _jarAddress, address _creator, string memory _name, string memory
                  _description, bool _useWhitelist)
                </code>{" "}
                - Register a new jar
              </li>
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  getUserJars(address _user)
                </code>{" "}
                - Get all jars created by a user
              </li>
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  getUserJarsCount(address _user)
                </code>{" "}
                - Get the number of jars created by a user
              </li>
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  isGloballyWhitelisted(address _user)
                </code>{" "}
                - Check if a user is globally whitelisted
              </li>
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  isGloballyBlacklisted(address _user)
                </code>{" "}
                - Check if a user is globally blacklisted
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Contract Addresses</h2>
            <p className="text-[#AAAAAA] mb-4">Deployed contract addresses on supported networks:</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-[#444444]">
                <thead>
                  <tr className="bg-[#333333]">
                    <th className="p-3 text-left text-white">Network</th>
                    <th className="p-3 text-left text-white">CookieJarFactory</th>
                    <th className="p-3 text-left text-white">CookieJarRegistry</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#444444] hover:bg-[#2A2A2A]">
                    <td className="p-3 text-[#C3FF00]">Base Sepolia</td>
                    <td className="p-3 text-[#AAAAAA]">0x2B51eDBf0Cb6c7914dc68a2FFb1359A67ED49ACb</td>
                    <td className="p-3 text-[#AAAAAA]">0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t</td>
                  </tr>
                  <tr className="border-b border-[#444444] hover:bg-[#2A2A2A]">
                    <td className="p-3 text-[#C3FF00]">Base</td>
                    <td className="p-3 text-[#AAAAAA]">0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t</td>
                    <td className="p-3 text-[#AAAAAA]">0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t</td>
                  </tr>
                  <tr className="border-b border-[#444444] hover:bg-[#2A2A2A]">
                    <td className="p-3 text-[#C3FF00]">Optimism</td>
                    <td className="p-3 text-[#AAAAAA]">0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t</td>
                    <td className="p-3 text-[#AAAAAA]">0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )

      case "javascript-sdk":
        return (
          <>
            <h1 className="text-4xl font-bold text-white mb-6">JavaScript SDK</h1>
            <p className="text-[#AAAAAA] text-lg mb-6">
              The Cookie Jar JavaScript SDK allows developers to interact with Cookie Jar contracts from JavaScript
              applications.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Installation</h2>
            <div className="bg-[#333333] p-4 rounded-lg mb-6 overflow-x-auto border border-[#444444]">
              <pre className="text-white">
                {`npm install @cookie-jar/sdk
# or
yarn add @cookie-jar/sdk`}
              </pre>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Basic Usage</h2>
            <div className="bg-[#333333] p-4 rounded-lg mb-6 overflow-x-auto border border-[#444444]">
              <pre className="text-white">
                {`import { CookieJarSDK } from '@cookie-jar/sdk';

// Initialize the SDK
const cookieJar = new CookieJarSDK({
  network: 'base-sepolia',
  provider: window.ethereum, // or any other provider
});

// Get all jars
const jars = await cookieJar.getAllJars();

// Get a specific jar
const myJar = await cookieJar.getJar('0x1234...5678');

// Create a new jar
const newJar = await cookieJar.createJar({
  name: 'Team Treasury',
  description: 'Funds for team expenses',
  accessType: 'whitelist',
  withdrawalOption: 'fixed',
  fixedAmount: '0.1',
  withdrawalInterval: 86400, // 1 day in seconds
  strictPurpose: true,
  emergencyWithdrawalEnabled: true,
});`}
              </pre>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Key Features</h2>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong className="text-[#C3FF00]">TypeScript Support:</strong> Full TypeScript definitions for all
                functions and types
              </li>
              <li>
                <strong className="text-[#C3FF00]">Provider Flexibility:</strong> Works with any Ethereum provider
                (MetaMask, WalletConnect, etc.)
              </li>
              <li>
                <strong className="text-[#C3FF00]">Multi-Network Support:</strong> Supports all networks where Cookie
                Jar is deployed
              </li>
              <li>
                <strong className="text-[#C3FF00]">Comprehensive API:</strong> Methods for all Cookie Jar contract
                functions
              </li>
              <li>
                <strong className="text-[#C3FF00]">Event Handling:</strong> Subscribe to contract events for real-time
                updates
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">API Reference</h2>
            <p className="text-[#AAAAAA] mb-4">
              The SDK provides methods for interacting with all aspects of Cookie Jar contracts:
            </p>

            <h3 className="text-xl font-bold text-[#C3FF00] mt-6 mb-2">Jar Management</h3>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  getAllJars()
                </code>{" "}
                - Get all jars
              </li>
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  getJar(address)
                </code>{" "}
                - Get a specific jar
              </li>
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  getUserJars(address)
                </code>{" "}
                - Get jars created by a user
              </li>
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  createJar(options)
                </code>{" "}
                - Create a new jar
              </li>
            </ul>

            <h3 className="text-xl font-bold text-[#C3FF00] mt-6 mb-2">Deposits and Withdrawals</h3>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  depositETH(jarAddress, amount)
                </code>{" "}
                - Deposit ETH to a jar
              </li>
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  depositERC20(jarAddress, tokenAddress, amount)
                </code>{" "}
                - Deposit ERC20 tokens
              </li>
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  withdrawETH(jarAddress, amount, purpose)
                </code>{" "}
                - Withdraw ETH
              </li>
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  withdrawERC20(jarAddress, tokenAddress, amount, purpose)
                </code>{" "}
                - Withdraw ERC20 tokens
              </li>
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  emergencyWithdraw(jarAddress, tokenAddress)
                </code>{" "}
                - Emergency withdrawal (admin only)
              </li>
            </ul>

            <h3 className="text-xl font-bold text-[#C3FF00] mt-6 mb-2">Access Control</h3>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  addToWhitelist(jarAddress, userAddress)
                </code>{" "}
                - Add address to whitelist
              </li>
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  removeFromWhitelist(jarAddress, userAddress)
                </code>{" "}
                - Remove address from whitelist
              </li>
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  addToBlacklist(jarAddress, userAddress)
                </code>{" "}
                - Add address to blacklist
              </li>
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  removeFromBlacklist(jarAddress, userAddress)
                </code>{" "}
                - Remove address from blacklist
              </li>
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  addNFTGate(jarAddress, nftAddress, tokenId, isERC1155, minBalance)
                </code>{" "}
                - Add NFT gate
              </li>
              <li>
                <code className="bg-[#333333] text-white border border-[#444444] px-1 py-0.5 rounded">
                  removeNFTGate(jarAddress, index)
                </code>{" "}
                - Remove NFT gate
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Example: Creating and Managing a Jar</h2>
            <div className="bg-[#333333] p-4 rounded-lg mb-6 overflow-x-auto border border-[#444444]">
              <pre className="text-white">
                {`import { CookieJarSDK } from '@cookie-jar/sdk';

// Initialize the SDK
const cookieJar = new CookieJarSDK({
  network: 'base',
  provider: window.ethereum,
});

// Create a new jar
async function createTeamJar() {
  const newJar = await cookieJar.createJar({
    name: 'Team Treasury',
    description: 'Funds for team expenses',
    accessType: 'whitelist',
    withdrawalOption: 'fixed',
    fixedAmount: '0.1',
    withdrawalInterval: 86400, // 1 day in seconds
    strictPurpose: true,
    emergencyWithdrawalEnabled: true,
  });
  
  console.log('New jar created:', newJar.address);
  
  // Add team members to whitelist
  await cookieJar.addToWhitelist(newJar.address, '0x1234...5678');
  await cookieJar.addToWhitelist(newJar.address, '0x8765...4321');
  
  // Fund the jar
  await cookieJar.depositETH(newJar.address, '1.0');
  
  return newJar;
}

// Monitor jar activity
function monitorJar(jarAddress) {
  cookieJar.onWithdrawal(jarAddress, (event) => {
    console.log('Withdrawal:', {
      user: event.user,
      amount: event.amount,
      purpose: event.purpose,
      timestamp: new Date(event.timestamp * 1000),
    });
  });
}

// Execute
createTeamJar().then(jar => monitorJar(jar.address));`}
              </pre>
            </div>
          </>
        )

      case "faq":
        return (
          <>
            <h1 className="text-4xl font-bold text-white mb-6">Frequently Asked Questions</h1>
            <p className="text-[#AAAAAA] text-lg mb-6">Find answers to common questions about Cookie Jar.</p>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">General Questions</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#C3FF00] mb-2">What is Cookie Jar?</h3>
                    <p className="text-[#AAAAAA]">
                      Cookie Jar is a platform for creating controlled token pools with customizable access rules,
                      withdrawal limits, and transparent tracking. It allows teams, communities, and organizations to
                      manage shared funds in a transparent and accountable way.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#C3FF00] mb-2">What networks does Cookie Jar support?</h3>
                    <p className="text-[#AAAAAA]">
                      Cookie Jar currently supports Base, Optimism, Gnosis Chain, and Base Sepolia (testnet). Support
                      for Arbitrum is coming soon.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#C3FF00] mb-2">Is there a fee for using Cookie Jar?</h3>
                    <p className="text-[#AAAAAA]">
                      Yes, Cookie Jar charges a 1% fee on all deposits. This fee is automatically deducted and sent to
                      the fee collector address. There are no additional fees for withdrawals or other operations.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#C3FF00] mb-2">Can I use Cookie Jar with any token?</h3>
                    <p className="text-[#AAAAAA]">
                      Cookie Jar supports ETH (native) and any standard ERC20 token. Non-standard tokens may not work
                      correctly and are not officially supported.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Creating and Managing Jars</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#C3FF00] mb-2">Can I change jar settings after creation?</h3>
                    <p className="text-[#AAAAAA]">
                      Most jar settings are immutable after creation for security reasons. However, you can still manage
                      access control (whitelist/blacklist/NFT gates) and transfer ownership after creation.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#C3FF00] mb-2">How many NFT gates can I add to a jar?</h3>
                    <p className="text-[#AAAAAA]">
                      You can add up to 5 different NFT gates to a single jar. Each gate can be for a different NFT
                      collection or for different token IDs within the same collection.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#C3FF00] mb-2">
                      Can I transfer jar ownership to another address?
                    </h3>
                    <p className="text-[#AAAAAA]">
                      Yes, jar owners can transfer ownership to another address using the "Transfer Jar Ownership"
                      function in the Admin Controls tab.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#C3FF00] mb-2">
                      What happens if I lose access to the jar owner address?
                    </h3>
                    <p className="text-[#AAAAAA]">
                      If you lose access to the jar owner address, you will not be able to perform administrative
                      functions on the jar. It's recommended to use a multi-sig wallet as the jar owner for important
                      jars to prevent this issue.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Withdrawals and Access</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#C3FF00] mb-2">Why can't I withdraw from a jar?</h3>
                    <p className="text-[#AAAAAA]">There could be several reasons:</p>
                    <ul className="list-disc pl-6 space-y-2 text-[#AAAAAA]">
                      <li>Your address is not whitelisted or you don't hold the required NFT</li>
                      <li>Your address is blacklisted</li>
                      <li>You haven't waited for the cooldown period since your last withdrawal</li>
                      <li>The jar has one-time withdrawal enabled and you've already withdrawn</li>
                      <li>The jar doesn't have sufficient funds</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#C3FF00] mb-2">
                      What happens if I sell my NFT that grants access to a jar?
                    </h3>
                    <p className="text-[#AAAAAA]">
                      If you sell or transfer an NFT that grants access to an NFT-gated jar, you will lose access to
                      that jar. The new owner of the NFT will gain access to the jar.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#C3FF00] mb-2">
                      Can I withdraw more than the maximum amount?
                    </h3>
                    <p className="text-[#AAAAAA]">
                      No, the maximum withdrawal amount is enforced by the smart contract and cannot be exceeded. For
                      variable withdrawals, you can make multiple withdrawals over time, but each one is subject to the
                      cooldown period.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#C3FF00] mb-2">
                      Are withdrawal purposes visible to everyone?
                    </h3>
                    <p className="text-[#AAAAAA]">
                      Yes, if a jar has strict purpose requirements enabled, all withdrawal purposes are stored on the
                      blockchain and are publicly visible for transparency.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Technical Questions</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#C3FF00] mb-2">Are Cookie Jar contracts audited?</h3>
                    <p className="text-[#AAAAAA]">
                      Yes, Cookie Jar contracts have undergone security audits by independent security firms. Audit
                      reports are available on our GitHub repository.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#C3FF00] mb-2">
                      Can I integrate Cookie Jar into my own application?
                    </h3>
                    <p className="text-[#AAAAAA]">
                      Yes, you can integrate Cookie Jar using our JavaScript SDK or by directly interacting with the
                      smart contracts. See the JavaScript SDK and Smart Contract Reference sections for more
                      information.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#C3FF00] mb-2">Is the Cookie Jar code open source?</h3>
                    <p className="text-[#AAAAAA]">
                      Yes, all Cookie Jar smart contracts and frontend code are open source and available on GitHub
                      under the MIT license.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#C3FF00] mb-2">How can I contribute to Cookie Jar?</h3>
                    <p className="text-[#AAAAAA]">
                      We welcome contributions from the community! You can contribute by submitting pull requests to our
                      GitHub repository, reporting bugs, or suggesting new features.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )

      case "troubleshooting":
        return (
          <>
            <h1 className="text-4xl font-bold text-white mb-6">Troubleshooting</h1>
            <p className="text-[#AAAAAA] text-lg mb-6">
              Solutions for common issues you might encounter when using Cookie Jar.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Wallet Connection Issues</h2>
            <div className="space-y-6">
              <div className="bg-[#333333] p-6 rounded-lg">
                <h3 className="text-xl font-bold text-[#C3FF00] mb-2">Problem: Cannot connect wallet</h3>
                <p className="text-[#AAAAAA] mb-4">If you're having trouble connecting your wallet to Cookie Jar:</p>
                <h4 className="text-lg font-semibold text-white mb-2">Solutions:</h4>
                <ol className="list-decimal pl-6 space-y-2 text-[#AAAAAA]">
                  <li>Ensure your wallet extension is installed and up to date</li>
                  <li>Refresh the page and try connecting again</li>
                  <li>Try using a different browser</li>
                  <li>Check if your wallet supports the current network</li>
                  <li>Clear your browser cache and cookies</li>
                </ol>
              </div>

              <div className="bg-[#333333] p-6 rounded-lg">
                <h3 className="text-xl font-bold text-[#C3FF00] mb-2">
                  Problem: Wallet connects but disconnects immediately
                </h3>
                <p className="text-[#AAAAAA] mb-4">If your wallet connects but then disconnects right away:</p>
                <h4 className="text-lg font-semibold text-white mb-2">Solutions:</h4>
                <ol className="list-decimal pl-6 space-y-2 text-[#AAAAAA]">
                  <li>Check if you rejected the signature request for terms and conditions</li>
                  <li>Try connecting with a different wallet</li>
                  <li>Ensure you're on a supported network</li>
                  <li>Check for browser console errors and report them to support</li>
                </ol>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Transaction Issues</h2>
            <div className="space-y-6">
              <div className="bg-[#333333] p-6 rounded-lg">
                <h3 className="text-xl font-bold text-[#C3FF00] mb-2">Problem: Transaction fails or reverts</h3>
                <p className="text-[#AAAAAA] mb-4">If your transaction fails or reverts:</p>
                <h4 className="text-lg font-semibold text-white mb-2">Solutions:</h4>
                <ol className="list-decimal pl-6 space-y-2 text-[#AAAAAA]">
                  <li>Check if you have enough ETH for gas fees</li>
                  <li>Verify you meet all requirements for the operation (e.g., whitelist, cooldown period)</li>
                  <li>For token operations, ensure you've approved the token for spending</li>
                  <li>Try increasing the gas limit slightly</li>
                  <li>Check the transaction error message in your wallet or block explorer for specific reasons</li>
                </ol>
              </div>

              <div className="bg-[#333333] p-6 rounded-lg">
                <h3 className="text-xl font-bold text-[#C3FF00] mb-2">Problem: Transaction pending for too long</h3>
                <p className="text-[#AAAAAA] mb-4">If your transaction is stuck in pending state:</p>
                <h4 className="text-lg font-semibold text-white mb-2">Solutions:</h4>
                <ol className="list-decimal pl-6 space-y-2 text-[#AAAAAA]">
                  <li>Wait for network congestion to decrease</li>
                  <li>If urgent, try to speed up the transaction in your wallet</li>
                  <li>If very long, you can try to cancel the transaction and submit a new one</li>
                  <li>Check the network status for any known issues</li>
                </ol>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Jar Management Issues</h2>
            <div className="space-y-6">
              <div className="bg-[#333333] p-6 rounded-lg">
                <h3 className="text-xl font-bold text-[#C3FF00] mb-2">Problem: Cannot see admin controls</h3>
                <p className="text-[#AAAAAA] mb-4">If you can't see the admin controls for a jar:</p>
                <h4 className="text-lg font-semibold text-white mb-2">Solutions:</h4>
                <ol className="list-decimal pl-6 space-y-2 text-[#AAAAAA]">
                  <li>Verify you're connected with the jar owner/admin wallet</li>
                  <li>Check if ownership has been transferred to another address</li>
                  <li>Refresh the page and try again</li>
                  <li>Ensure you're viewing the correct jar</li>
                </ol>
              </div>

              <div className="bg-[#333333] p-6 rounded-lg">
                <h3 className="text-xl font-bold text-[#C3FF00] mb-2">Problem: Jar not showing in the list</h3>
                <p className="text-[#AAAAAA] mb-4">
                  If a jar you created or should have access to isn't showing in the list:
                </p>
                <h4 className="text-lg font-semibold text-white mb-2">Solutions:</h4>
                <ol className="list-decimal pl-6 space-y-2 text-[#AAAAAA]">
                  <li>Verify you're connected with the correct wallet</li>
                  <li>Check if you're on the correct network</li>
                  <li>Try searching for the jar by address</li>
                  <li>Refresh the page and try again</li>
                  <li>Check if the jar has been blacklisted by the platform</li>
                </ol>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Withdrawal Issues</h2>
            <div className="space-y-6">
              <div className="bg-[#333333] p-6 rounded-lg">
                <h3 className="text-xl font-bold text-[#C3FF00] mb-2">
                  Problem: Cannot withdraw despite being whitelisted
                </h3>
                <p className="text-[#AAAAAA] mb-4">If you're whitelisted but still can't withdraw:</p>
                <h4 className="text-lg font-semibold text-white mb-2">Solutions:</h4>
                <ol className="list-decimal pl-6 space-y-2 text-[#AAAAAA]">
                  <li>Check if you're in the cooldown period from a previous withdrawal</li>
                  <li>Verify the jar has sufficient funds</li>
                  <li>Ensure you're not blacklisted</li>
                  <li>For one-time withdrawal jars, check if you've already withdrawn</li>
                  <li>Verify you're providing a valid purpose (if required)</li>
                </ol>
              </div>

              <div className="bg-[#333333] p-6 rounded-lg">
                <h3 className="text-xl font-bold text-[#C3FF00] mb-2">Problem: NFT-gated withdrawal not working</h3>
                <p className="text-[#AAAAAA] mb-4">If you can't withdraw using NFT-gated access:</p>
                <h4 className="text-lg font-semibold text-white mb-2">Solutions:</h4>
                <ol className="list-decimal pl-6 space-y-2 text-[#AAAAAA]">
                  <li>Verify you own the correct NFT</li>
                  <li>Ensure you're entering the correct NFT contract address and token ID</li>
                  <li>Check if the NFT is still in your wallet</li>
                  <li>Verify the NFT gate hasn't been removed from the jar</li>
                  <li>For ERC1155 tokens, ensure you have the minimum required balance</li>
                </ol>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Getting Help</h2>
            <p className="text-[#AAAAAA] mb-4">
              If you're still experiencing issues after trying the troubleshooting steps:
            </p>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>Join our Discord community for real-time support</li>
              <li>Submit a support ticket through our website</li>
              <li>Check our GitHub repository for known issues</li>
              <li>Reach out on Twitter @CookieJarFinance</li>
            </ul>

            <div className="bg-[#333333] p-6 rounded-lg mt-8">
              <h3 className="text-xl font-bold text-[#C3FF00] mb-4">When Reporting Issues</h3>
              <p className="text-[#AAAAAA] mb-4">
                Please include the following information to help us assist you better:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[#AAAAAA]">
                <li>Your wallet address</li>
                <li>The jar address (if applicable)</li>
                <li>The network you're using</li>
                <li>A detailed description of the issue</li>
                <li>Any error messages you received</li>
                <li>Transaction hash (if applicable)</li>
                <li>Screenshots if possible</li>
              </ul>
            </div>
          </>
        )

      default:
        return (
          <>
            <h1 className="text-4xl font-bold text-white mb-6">Cookie Jar Documentation</h1>
            <p className="text-[#AAAAAA] text-lg mb-6">
              Welcome to the Cookie Jar documentation. This guide will help you understand how to use the Cookie Jar
              platform to create, manage, and interact with shared token pools.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">What is Cookie Jar?</h2>
            <p className="text-[#AAAAAA] mb-6">
              Cookie Jar is a platform for creating controlled token pools with customizable access rules, withdrawal
              limits, and transparent tracking. It allows teams, communities, and organizations to manage shared funds
              in a transparent and accountable way.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Key Features</h2>
            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>
                <strong className="text-[#C3FF00]">Dual Access Control:</strong> Choose between whitelist or NFT-gated
                access to control who can withdraw from your jar.
              </li>
              <li>
                <strong className="text-[#C3FF00]">Configurable Withdrawals:</strong> Set fixed or variable withdrawal
                amounts with customizable cooldown periods.
              </li>
              <li>
                <strong className="text-[#C3FF00]">Purpose Tracking:</strong> Require users to explain withdrawals with
                on-chain transparency for accountability.
              </li>
              <li>
                <strong className="text-[#C3FF00]">Multi-Asset Support:</strong> Support for ETH and any ERC20 token
                with a simple fee structure.
              </li>
              <li>
                <strong className="text-[#C3FF00]">Multi-Admin:</strong> Assign multiple administrators to manage your
                jar with flexible permissions.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Getting Started</h2>
            <p className="text-[#AAAAAA] mb-4">
              To get started with Cookie Jar, you'll need to connect your wallet and create your first jar. Follow these
              steps:
            </p>

            <ol className="list-decimal pl-6 space-y-3 text-[#AAAAAA]">
              <li>Connect your wallet to the Cookie Jar platform</li>
              <li>Navigate to the "Create Jar" page</li>
              <li>Configure your jar settings</li>
              <li>Deploy your jar to your chosen network</li>
              <li>Deposit funds into your jar</li>
              <li>Share your jar with your team or community</li>
            </ol>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">Supported Networks</h2>
            <p className="text-[#AAAAAA] mb-4">Cookie Jar is available on the following networks:</p>

            <ul className="list-disc pl-6 space-y-3 text-[#AAAAAA]">
              <li>Base</li>
              <li>Optimism</li>
              <li>Gnosis Chain</li>
              <li>Base Sepolia (Testnet)</li>
              <li>Arbitrum (coming soon)</li>
            </ul>

            <div className="bg-[#333333] p-6 rounded-lg mt-8">
              <h3 className="text-xl font-bold text-[#C3FF00] mb-4">Explore the Documentation</h3>
              <p className="text-[#AAAAAA]">
                Use the sidebar to navigate through the documentation and learn more about Cookie Jar's features and
                functionality. Select a topic to get started!
              </p>
            </div>
          </>
        )
    }
  }

  return <div className="prose prose-invert max-w-none overflow-y-auto bg-[#1D1D1D]">{renderContent()}</div>
}
