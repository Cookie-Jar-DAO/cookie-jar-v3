"use client"

import Link from "next/link"
import Image from "next/image"
import { SocialMediaButtons } from "@/components/page/home/social-media-buttons"
import { Cookie, Mail, MapPin, ChevronRight, ExternalLink, Github, BookOpen } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative w-full bg-background-paper pt-20 pb-8 overflow-hidden">
      {/* Top horizontal line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-white/10"></div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#333333]/20 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[#333333]/20 rounded-full blur-[80px]"></div>

        {/* Network Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="0" y1="15" x2="100" y2="40" stroke="#FFFFFF" strokeWidth="0.1" />
          <line x1="0" y1="50" x2="100" y2="30" stroke="#FFFFFF" strokeWidth="0.1" />
          <line x1="20" y1="0" x2="40" y2="100" stroke="#FFFFFF" strokeWidth="0.1" />
          <line x1="70" y1="0" x2="60" y2="100" stroke="#FFFFFF" strokeWidth="0.1" />
        </svg>

        {/* Diagonal Divider */}
        <div
          className="absolute top-0 left-0 w-full h-20 bg-background-paper"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 70%)" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-16">
          {/* Column 1: About */}
          <div className="space-y-6 bg-[#2A2A2A]/50 p-6 rounded-xl backdrop-blur-sm">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#393939] flex items-center justify-center overflow-hidden border border-[#C3FF00]/20">
                <Image
                  src="/logo.png"
                  alt="Cookie Jar Logo"
                  width={48}
                  height={48}
                  className="w-10 h-10 object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-white">Cookie Jar</span>
            </Link>

            <p className="text-white/70 text-sm leading-relaxed">
              Cookie Jar V3 is a revolutionary platform for creating and managing shared token pools with customizable
              access rules, built on blockchain technology.
            </p>

            <div className="flex items-center space-x-2 text-white/60">
              <Cookie className="h-4 w-4 text-[#C3FF00]" />
              <span className="text-sm">Baking better blockchain solutions since 2023</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white relative inline-block">
              <span className="relative z-10">Quick Links</span>
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#C3FF00] opacity-80 z-0"></span>
            </h3>

            <ul className="space-y-3 bg-[#2A2A2A]/30 p-6 rounded-xl">
              {[
                { name: "Explore Jars", href: "/jars", icon: <ChevronRight className="h-4 w-4" /> },
                { name: "Create Jar", href: "/create", icon: <ChevronRight className="h-4 w-4" /> },
                { name: "Documentation", href: "/docs", icon: <ChevronRight className="h-4 w-4" /> },
                { name: "Your Profile", href: "/profile", icon: <ChevronRight className="h-4 w-4" /> },
                { name: "Admin Dashboard", href: "/admin/cookie-jars", icon: <ChevronRight className="h-4 w-4" /> },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/80 hover:text-[#C3FF00] transition-colors flex items-center group"
                  >
                    <span className="text-[#C3FF00] opacity-0 group-hover:opacity-100 transition-all duration-300 mr-1">
                      {link.icon}
                    </span>
                    <span className="text-sm group-hover:translate-x-1 transition-transform duration-300">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white relative inline-block">
              <span className="relative z-10">Resources</span>
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#C3FF00] opacity-80 z-0"></span>
            </h3>

            <div className="bg-[#2A2A2A]/30 p-6 rounded-xl space-y-5">
              <Link
                href="https://github.com/cookiejar"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-white/80 hover:text-[#C3FF00] transition-colors group"
              >
                <Github className="h-5 w-5 text-[#C3FF00]" />
                <span className="text-sm group-hover:underline">GitHub Repository</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <Link
                href="/docs"
                className="flex items-center space-x-3 text-white/80 hover:text-[#C3FF00] transition-colors group"
              >
                <BookOpen className="h-5 w-5 text-[#C3FF00]" />
                <span className="text-sm group-hover:underline">Developer Documentation</span>
              </Link>

              <div className="pt-3 border-t border-white/10">
                <h4 className="text-sm font-medium text-white mb-3">Contact Us</h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-[#C3FF00] mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-white/70">123 Blockchain Avenue, Web3 City, Metaverse</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-[#C3FF00] flex-shrink-0" />
                    <a
                      href="mailto:info@cookiejar.eth"
                      className="text-xs text-white/70 hover:text-[#C3FF00] transition-colors"
                    >
                      info@cookiejar.eth
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Column 4: Connect */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white relative inline-block">
              <span className="relative z-10">Connect With Us</span>
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#C3FF00] opacity-80 z-0"></span>
            </h3>

            <div className="bg-[#2A2A2A]/50 p-6 rounded-xl space-y-5">
              <p className="text-sm text-white/70">
                Follow us on social media for updates, tips, and community events.
              </p>

              <div className="pt-2">
                <SocialMediaButtons />
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white/60 pb-20 md:pb-0">
          <p>© 2025 Cookie Jar V3. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-xs hover:text-[#C3FF00] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs hover:text-[#C3FF00] transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-xs hover:text-[#C3FF00] transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Removed the scroll to top button from here */}
    </footer>
  )
}
