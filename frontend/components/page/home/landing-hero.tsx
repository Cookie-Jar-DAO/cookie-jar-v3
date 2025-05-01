"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Navbar } from "./navbar"
import { useAccount } from "wagmi"

export function LandingHero() {
  const { isConnected } = useAccount()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleExploreClick = () => {
    router.push("/jars")
  }

  if (!mounted) return null

  return (
    <div className="relative w-full min-h-screen flex flex-col overflow-hidden bg-[#1F1F1F]">
      {/* Navbar */}
      <Navbar />

      {/* Hero content - added more top padding to create gap from navbar */}
      <div className="flex-1 flex items-center w-full container mx-auto px-4 relative z-10 pt-40 pb-20">
        <div className="w-full max-w-4xl">
          <div>
            <h1 className="mega-text mb-8">
              SHARE <span className="text-[#C3FF00]">RESOURCES</span>
              <br />
              WITH <span className="block mt-4 border-b-4 border-[#C3FF00] pb-2 inline-block">COOKIE JARS</span>
            </h1>
          </div>

          <div>
            <p className="text-xl md:text-2xl text-white max-w-3xl mb-12">
              Create controlled token pools with customizable access rules, withdrawal limits, and transparent tracking
              for your team, community, or organization.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 mt-12">
            <button className="cssbuttons-io-button" onClick={handleExploreClick}>
              EXPLORE JARS
              <div className="icon">
                <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0h24v24H0z" fill="none"></path>
                  <path
                    d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
            </button>
            <Link href="/create">
              <button className="cssbuttons-io-button dark text-white">
                CREATE A JAR
                <div className="icon">
                  <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path
                      d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Cookie jar SVG */}
        <div className="absolute right-[5%] top-[20%] w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
          <Image
            src="/cookie-jar.gif"
            alt="Cookie Jar Illustration"
            width={400}
            height={400}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  )
}
