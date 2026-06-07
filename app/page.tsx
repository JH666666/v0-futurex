import { HomeHero } from "@/components/home/home-hero"
import { StatsDashboard } from "@/components/home/stats-dashboard"
import { CategoryStrip } from "@/components/home/category-strip"
import { HomeMarkets } from "@/components/home/home-markets"

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 sm:py-8">
      <HomeHero />
      <StatsDashboard />
      <CategoryStrip />
      <HomeMarkets />
    </div>
  )
}
