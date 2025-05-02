"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useInView, useAnimation } from "framer-motion"
import { ChevronRight, Globe, Zap } from "lucide-react"

// Define network type
interface Network {
  name: string
  description: string
  status: "Active" | "Coming Soon"
  color: string
  logo: string
  details: {
    tps: string
    gasPrice: string
    finality: string
    type: string
  }
  benefits: string[]
}

export function NetworkSupport() {
  const controls = useAnimation()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: false, amount: 0.1 })
  const [contentLoaded, setContentLoaded] = useState(false)

  // Ensure content is always shown after a delay, even if animations fail
  useEffect(() => {
    const timer = setTimeout(() => {
      setContentLoaded(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Handle animations when in view
  useEffect(() => {
    if (isInView) {
      controls.start("visible")
      setContentLoaded(true)
    }
  }, [controls, isInView])

  // Extended network data
  const networks: Network[] = [
    {
      name: "Base Sepolia",
      description: "Testnet for Base network, optimized for developer testing and rapid iteration",
      status: "Active",
      color: "#C3FF00",
      logo: "/networks/base-sepolia.png",
      details: {
        tps: "2,000+",
        gasPrice: "< 0.001 ETH",
        finality: "< 2 seconds",
        type: "Testnet",
      },
      benefits: [
        "Fast transaction confirmation for smooth testing",
        "Low gas fees, making rapid iteration affordable",
        "Strong developer tools and infrastructure",
        "Perfect environment for pre-production testing",
      ],
    },
    {
      name: "Base",
      description: "Ethereum L2 scaling solution by Coinbase, designed for mainstream adoption",
      status: "Coming Soon",
      color: "#0052FF",
      logo: "/networks/base.png",
      details: {
        tps: "20,000+",
        gasPrice: "Up to 10x cheaper than Ethereum",
        finality: "< 5 seconds",
        type: "Mainnet",
      },
      benefits: [
        "High performance with low transaction costs",
        "Backed by Coinbase, ensuring high uptime and reliability",
        "Full Ethereum compatibility with easy bridging",
        "Growing ecosystem of apps and developers",
      ],
    },
    {
      name: "Optimism",
      description: "Ethereum L2 with optimistic rollups, focusing on community and public goods",
      status: "Coming Soon",
      color: "#FF0420",
      logo: "/networks/optimism.png",
      details: {
        tps: "15,000+",
        gasPrice: "Up to 90% savings vs L1",
        finality: "< 10 seconds",
        type: "Mainnet",
      },
      benefits: [
        "Strong focus on community governance and public goods",
        "Established ecosystem with many applications",
        "Strong security model with proven track record",
        "Regular upgrades to improve performance",
      ],
    },
    {
      name: "Gnosis Chain",
      description: "Stable, community-owned Ethereum sidechain prioritizing sustainability and accessibility",
      status: "Coming Soon",
      color: "#04795B",
      logo: "/networks/gnosis.png",
      details: {
        tps: "10,000+",
        gasPrice: "Extremely low (~$0.01)",
        finality: "< 15 seconds",
        type: "Mainnet",
      },
      benefits: [
        "One of the most stable and established sidechains",
        "Strong focus on sustainability and low environmental impact",
        "Active DAO governance and community participation",
        "Widely used for prediction markets and complex applications",
      ],
    },
    {
      name: "Arbitrum",
      description: "Leading Ethereum L2 using optimistic rollups, optimized for complex applications",
      status: "Coming Soon",
      color: "#28A0F0",
      logo: "/networks/arbitrum.png",
      details: {
        tps: "25,000+",
        gasPrice: "Up to 95% savings vs L1",
        finality: "< 15 seconds",
        type: "Mainnet",
      },
      benefits: [
        "Leading market share among L2s with large liquidity",
        "Full EVM compatibility for complex smart contracts",
        "Thriving DeFi and gaming ecosystem",
        "Strong fraud proof security model",
      ],
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Reduced from 0.1
        delayChildren: 0.1, // Reduced from 0.2
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }, // Reduced from 0.6
    },
  }

  // Simplified rendering approach
  const renderNetworks = (status: "Active" | "Coming Soon") => {
    return networks
      .filter((network) => network.status === status)
      .map((network, index) => (
        <div
          key={network.name}
          className={`mb-20 ${!contentLoaded ? "opacity-0" : "opacity-100 transition-opacity duration-500"}`}
        >
          <NetworkDisplay network={network} index={index} />
        </div>
      ))
  }

  return (
    <section ref={ref} className="relative overflow-hidden bg-background text-white py-20 min-h-screen w-full">
      {/* Background elements - Only network lines */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Network lines with neutral color */}
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          viewBox="0 0 1000 1000"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g stroke="#FFFFFF" strokeWidth="1" fill="none">
            <path d="M200,200 Q400,100 600,300 T1000,500" />
            <path d="M0,300 Q200,400 400,200 T800,600" />
            <path d="M100,500 Q300,600 500,400 T900,300" />
            <path d="M300,700 Q500,800 700,600 T1000,700" />
            <path d="M0,800 Q200,700 400,900 T800,800" />
          </g>
        </svg>
      </div>

      <div className="w-full px-0 relative z-10">
        {/* Main heading - Always visible */}
        <div className="mb-32">
          <div className="overflow-hidden w-full">
            <h2 className="text-[9rem] md:text-[14rem] font-bold leading-none tracking-[0.02em] md:tracking-[0.03em] opacity-20 text-white/20 select-none">
              NETWORKS
            </h2>
          </div>
          <div className="relative -mt-32 md:-mt-40 ml-4 md:ml-8">
            <h3 className="text-4xl md:text-6xl font-bold mb-4 text-white">
              Supported <span className="text-primary">Networks</span>
            </h3>
            <p className="text-xl max-w-2xl text-white/80">
              Cookie Jar is designed to work seamlessly across multiple blockchain networks, each offering unique
              benefits and capabilities for your cookie jar funds.
            </p>
          </div>
        </div>

        {/* Network display - Split into active and coming soon */}
        <div className="mb-24 px-4 md:px-8">
          {/* Active Networks */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <Zap className="w-6 h-6 text-background" />
              </div>
              <h3 className="text-3xl font-bold">Active Networks</h3>
            </div>

            {/* Render with fallback */}
            {renderNetworks("Active")}
          </div>

          {/* Coming Soon Networks */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">Coming Soon</h3>
            </div>

            {/* Render with fallback */}
            {renderNetworks("Coming Soon")}
          </div>
        </div>

        {/* Call to action - Always visible */}
        <div
          className={`py-16 px-8 bg-gradient-to-r from-background via-[#2a2a2a] to-background rounded-3xl border border-[#444] shadow-xl max-w-5xl mx-auto ${
            !contentLoaded ? "opacity-0" : "opacity-100 transition-opacity duration-500"
          }`}
        >
          <h3 className="text-3xl font-bold mb-4">Ready to deploy on multiple networks?</h3>
          <p className="text-xl text-white/80 mb-8">
            Cookie Jar gives you the flexibility to choose the network that best suits your specific use case, whether
            you need speed, security, or cost-effectiveness.
          </p>
          <button className="bg-primary hover:bg-primary/90 text-background px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center gap-2 group">
            Start exploring networks
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  )
}

// Component for displaying network information
function NetworkDisplay({ network, index }: { network: Network; index: number }) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 py-10 ${index % 2 === 1 ? "lg:pl-24" : ""}`}>
      {/* Network Logo & Basic Info - 3 columns */}
      <div className="lg:col-span-3 flex lg:flex-col items-center lg:items-start gap-4">
        <div className="w-20 h-20 rounded-2xl bg-[#2a2a2a] flex items-center justify-center p-2 overflow-hidden">
          {network.logo ? (
            <Image
              src={network.logo || "/placeholder.svg"}
              alt={`${network.name} logo`}
              width={60}
              height={60}
              className="object-contain"
            />
          ) : (
            <div className="w-12 h-12 rounded-full" style={{ backgroundColor: network.color }}></div>
          )}
        </div>

        <div>
          <h4 className="text-2xl font-bold">{network.name}</h4>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1 mt-2
              ${
                network.status === "Active"
                  ? "bg-primary text-background"
                  : "bg-[#333] text-white/70 border border-[#555]"
              }`}
          >
            {network.status === "Active" ? (
              <>
                <span className="w-2 h-2 rounded-full bg-background animate-pulse"></span>
                Live
              </>
            ) : (
              "Coming Soon"
            )}
          </div>
        </div>
      </div>

      {/* Network Description - 4 columns */}
      <div className="lg:col-span-4">
        <h5 className="text-lg font-medium mb-2 text-primary/80">Overview</h5>
        <p className="text-white/80 mb-4">{network.description}</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#2a2a2a] p-3 rounded-xl">
            <div className="text-sm text-white/60 mb-1">TPS</div>
            <div className="font-bold">{network.details.tps}</div>
          </div>
          <div className="bg-[#2a2a2a] p-3 rounded-xl">
            <div className="text-sm text-white/60 mb-1">Gas Price</div>
            <div className="font-bold">{network.details.gasPrice}</div>
          </div>
          <div className="bg-[#2a2a2a] p-3 rounded-xl">
            <div className="text-sm text-white/60 mb-1">Finality</div>
            <div className="font-bold">{network.details.finality}</div>
          </div>
          <div className="bg-[#2a2a2a] p-3 rounded-xl">
            <div className="text-sm text-white/60 mb-1">Type</div>
            <div className="font-bold">{network.details.type}</div>
          </div>
        </div>
      </div>

      {/* Network Benefits - 5 columns */}
      <div className="lg:col-span-5">
        <h5 className="text-lg font-medium mb-3 text-primary/80">Key Benefits</h5>
        <ul className="space-y-3">
          {network.benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-2">
              <div className="mt-1 min-w-4 w-4 h-4 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              </div>
              <span className="text-white/80">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
