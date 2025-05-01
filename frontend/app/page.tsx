import { LandingHero } from "@/components/page/home/landing-hero"
import { Features } from "@/components/page/home/features"
import { NetworkSupport } from "@/components/page/home/network-support"
import { Footer } from "@/components/page/home/footer"

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <LandingHero key="landing-hero" />
      <Features key="features" />
      <NetworkSupport key="network-support" />
      <Footer key="footer" />
    </div>
  )
}
