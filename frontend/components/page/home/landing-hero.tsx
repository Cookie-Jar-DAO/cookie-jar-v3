"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Navbar } from "./navbar"
import { useAccount } from "wagmi"
import { useIsMobile } from "@/hooks/design/use-mobile"

export function LandingHero() {
  const { isConnected } = useAccount()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const isMobile = useIsMobile()

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
      {/* Always include Navbar - it will handle responsive display internally */}
      <Navbar />

      {isMobile ? (
        /* Mobile Layout */
        <div className="flex flex-col w-full">
          {/* Full-page cookie jar section - reduced height */}
          <div className="h-[90vh] w-full flex flex-col justify-between relative">
            {/* Project name and logo at the top */}
            <div className="pt-6 px-4 z-20">
              <Link
                href="/"
                className="flex items-center gap-3 bg-[#393939] rounded-full py-2 px-4 border border-[#555555] hover:bg-[#4a4a4a] transition-colors mx-auto w-fit"
              >
                <div className="w-8 h-8 rounded-full bg-[#393939] flex items-center justify-center overflow-hidden border border-primary">
                  <Image
                    src="/logo.png"
                    alt="Cookie Jar Logo"
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <span className="text-lg font-medium text-white">Cookie Jar V3</span>
              </Link>
            </div>

            {/* Cookie jar image - centered in the middle section */}
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="relative w-[90%] max-w-[500px] aspect-square rounded-3xl border-2 border-[#444444] p-6 transition-all duration-500 hover:border-[#C3FF00] group overflow-hidden">
                {/* Animated background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C3FF00]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out"></div>

                <Image
                  src="/cookie-jar.gif"
                  alt="Cookie Jar Illustration"
                  width={400}
                  height={400}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              </div>
            </div>

            {/* Scroll indicator - now at the bottom with more space */}
            <div className="pb-8 w-full text-center">
              <div className="animate-bounce">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto text-[#C3FF00]"
                >
                  <path d="M12 5v14"></path>
                  <path d="m19 12-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Content section (appears after scrolling) */}
          <div className="min-h-screen flex items-center w-full container mx-auto px-4 pt-16 pb-20">
            <div className="w-full">
              <div>
                <h1 className="mega-text mb-6 text-4xl sm:text-5xl">
                  SHARE <span className="text-[#C3FF00]">RESOURCES</span>
                  <br />
                  WITH <span className="block mt-2 border-b-4 border-[#C3FF00] pb-2 inline-block">COOKIE JARS</span>
                </h1>
              </div>

              <div>
                <p className="text-lg text-white max-w-3xl mb-8">
                  Create controlled token pools with customizable access rules, withdrawal limits, and transparent
                  tracking for your team, community, or organization.
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 mt-8">
                <button
                  className="cssbuttons-io-button text-[#333333] w-full h-14 py-4 text-lg font-medium"
                  onClick={handleExploreClick}
                >
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
                <Link href="/create" className="w-full">
                  <button className="cssbuttons-io-button dark text-white w-full h-14 py-4 text-lg font-medium">
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
        </div>
      ) : (
        /* Desktop Layout - Keep original with added border */
        <>
          {/* Hero content */}
          <div className="flex-1 flex items-center w-full container mx-auto px-4 relative z-10 pt-28 md:pt-40 pb-20">
            <div className="w-full max-w-4xl">
              <div>
                <h1 className="mega-text mb-6 md:mb-8 text-4xl sm:text-5xl md:text-7xl lg:text-8xl">
                  SHARE <span className="text-[#C3FF00]">RESOURCES</span>
                  <br />
                  WITH{" "}
                  <span className="block mt-2 md:mt-4 border-b-4 border-[#C3FF00] pb-2 inline-block">COOKIE JARS</span>
                </h1>
              </div>

              <div>
                <p className="text-lg sm:text-xl md:text-2xl text-white max-w-3xl mb-8 md:mb-12">
                  Create controlled token pools with customizable access rules, withdrawal limits, and transparent
                  tracking for your team, community, or organization.
                </p>
              </div>

              <div className="flex flex-row items-center gap-4 sm:gap-6 mt-8 md:mt-12">
                <button className="cssbuttons-io-button text-[#333333] w-auto" onClick={handleExploreClick}>
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
                  <button className="cssbuttons-io-button dark text-white w-auto">
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
            {/* Cookie jar SVG with animated border */}
            <div className="absolute right-[5%] top-[30%] md:top-[20%] w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[400px] md:h-[400px]">
              <div className="relative w-full h-full rounded-3xl border-2 border-[#444444] p-4 transition-all duration-500 hover:border-[#C3FF00] group overflow-hidden">
                {/* Animated background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C3FF00]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out"></div>

                <Image
                  src="/cookie-jar.gif"
                  alt="Cookie Jar Illustration"
                  width={400}
                  height={400}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
