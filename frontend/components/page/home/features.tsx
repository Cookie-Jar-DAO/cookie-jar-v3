"use client"

import { useRef } from "react"
import { Shield, Clock, Users, Coins, FileText, Settings } from "lucide-react"
import { motion, useInView } from "framer-motion"
import type { ReactNode } from "react"
import { useIsMobile } from "@/hooks/design/use-mobile"

// Define types for our feature items
interface FeatureItem {
  icon: ReactNode
  title: string
  description: string
  details: string[]
}

interface FeatureSectionProps {
  feature: FeatureItem
  index: number
}

export function Features() {
  const isMobile = useIsMobile()

  // Feature sections with expanded content
  const features: FeatureItem[] = [
    {
      icon: <Shield className="h-12 w-12 md:h-16 md:w-16 text-primary" />,
      title: "DUAL ACCESS CONTROL",
      description: "Choose between whitelist or NFT-gated access to control who can withdraw from your jar.",
      details: [
        "Whitelist specific addresses for direct access",
        "Gate withdrawals behind NFT ownership",
        "Combine both methods for enhanced security",
        "Easily manage access permissions through our intuitive interface",
      ],
    },
    {
      icon: <Clock className="h-12 w-12 md:h-16 md:w-16 text-primary" />,
      title: "CONFIGURABLE WITHDRAWALS",
      description: "Set fixed or variable withdrawal amounts with customizable cooldown periods.",
      details: [
        "Define maximum withdrawal amounts per transaction",
        "Set time-based cooldowns between withdrawals",
        "Configure different limits for different users",
        "Implement progressive withdrawal schedules",
      ],
    },
    {
      icon: <FileText className="h-12 w-12 md:h-16 md:w-16 text-primary" />,
      title: "PURPOSE TRACKING",
      description: "Require users to explain withdrawals with on-chain transparency for accountability.",
      details: [
        "Record withdrawal purposes directly on-chain",
        "Create an immutable audit trail of all transactions",
        "Enforce accountability through transparent tracking",
        "Generate reports of historical withdrawal purposes",
      ],
    },
    {
      icon: <Coins className="h-12 w-12 md:h-16 md:w-16 text-primary" />,
      title: "MULTI-ASSET SUPPORT",
      description: "Support for ETH and any ERC20 token with a simple fee structure.",
      details: [
        "Deposit and withdraw ETH natively",
        "Support for any standard ERC20 token",
        "Minimal fee structure for sustainability",
        "Seamless token switching without complex setup",
      ],
    },
    {
      icon: <Users className="h-12 w-12 md:h-16 md:w-16 text-primary" />,
      title: "OWNERSHIP TRANSFER",
      description: "Transfer jar ownership to another address with full administrative rights.",
      details: [
        "Securely transfer ownership to new administrators",
        "Maintain all jar configurations during transfers",
        "Implement multi-step verification for transfers",
        "Keep historical record of ownership changes",
      ],
    },
    {
      icon: <Settings className="h-12 w-12 md:h-16 md:w-16 text-primary" />,
      title: "EMERGENCY CONTROLS",
      description: "Enable emergency withdrawal functionality for critical situations.",
      details: [
        "Implement emergency pause functionality",
        "Allow for complete fund recovery in critical situations",
        "Set up multi-signature requirements for emergency actions",
        "Configure tiered emergency response protocols",
      ],
    },
  ]

  return (
    <section className="w-full py-16 md:py-32 bg-background-paper relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Main heading */}
        <div className="mb-12 md:mb-24 max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-bold text-white/5 uppercase tracking-[0.05em] md:tracking-[0.08em]">
            FEATURES
          </h2>
          <div className="mt-[-20px] sm:mt-[-25px] md:mt-[-50px] lg:mt-[-70px]">
            <h3 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 md:mb-6">
              POWERFUL CAPABILITIES
            </h3>
            <p className="text-base md:text-xl text-white/80 max-w-2xl">
              Cookie Jar provides a comprehensive suite of tools designed to manage shared resources with unprecedented
              transparency, security, and control.
            </p>
          </div>
        </div>

        {/* Feature sections */}
        <div className="space-y-16 md:space-y-40">
          {features.map((feature, index) => (
            <FeatureSection key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureSection({ feature, index }: FeatureSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: false, amount: 0.2 })
  const isMobile = useIsMobile()

  const isEven = index % 2 === 0

  return (
    <div
      ref={ref}
      className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-6 md:gap-16 items-center`}
    >
      {/* Feature heading and icon */}
      <motion.div
        className="w-full md:w-2/5"
        initial={{ opacity: 0, x: isMobile ? 0 : isEven ? -50 : 50, y: isMobile ? 30 : 0 }}
        animate={
          isInView
            ? { opacity: 1, x: 0, y: 0 }
            : { opacity: 0, x: isMobile ? 0 : isEven ? -50 : 50, y: isMobile ? 30 : 0 }
        }
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div
          className={`flex ${isMobile ? "justify-center" : isEven ? "justify-start" : "justify-end"} items-center mb-4 md:mb-6`}
        >
          <div className="p-3 md:p-5 rounded-full bg-background">{feature.icon}</div>
        </div>
        <h3
          className={`text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-white ${isMobile ? "text-center" : isEven ? "text-left" : "text-right"}`}
        >
          {feature.title}
        </h3>
      </motion.div>

      {/* Feature content */}
      <motion.div
        className="w-full md:w-3/5 bg-background p-5 md:p-8 rounded-xl md:rounded-2xl border border-white/10"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
      >
        <p className="text-base md:text-xl text-white/90 mb-4 md:mb-6">{feature.description}</p>
        <ul className="space-y-2 md:space-y-3">
          {feature.details.map((detail: string, i: number) => (
            <li key={i} className="flex items-start">
              <span className="text-primary mr-2 mt-1 flex-shrink-0">•</span>
              <span className="text-sm md:text-base text-white/70">{detail}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}
