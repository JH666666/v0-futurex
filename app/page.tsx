import { HomeHero } from "@/components/home/home-hero"
import { StatsDashboard } from "@/components/home/stats-dashboard"
import { SectionHeader } from "@/components/section-header"
import { MarketCard } from "@/components/market-card"
import { markets } from "@/lib/data"

export default function HomePage() {
  const trending = [...markets].sort((a, b) => b.volume - a.volume).slice(0, 3)
  const worldcup = markets.filter((m) => m.category === "worldcup").slice(0, 3)
  const crypto = markets.filter((m) => m.category === "crypto")
  const ai = markets.filter((m) => m.category === "ai")

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 sm:py-8">
      <HomeHero />
      <StatsDashboard />

      <section>
        <SectionHeader title="热门预测" subtitle="按 24 小时成交量排序" href="/world-cup" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trending.map((m) => (
            <MarketCard key={m.id} market={m} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="世界杯 2026" subtitle="冠军、晋级与金靴市场" href="/world-cup" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {worldcup.map((m) => (
            <MarketCard key={m.id} market={m} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="加密货币" subtitle="BTC、ETH 与 Base 生态预测" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {crypto.map((m) => (
            <MarketCard key={m.id} market={m} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="AI 赛道" subtitle="模型、AGI 与成本曲线" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ai.map((m) => (
            <MarketCard key={m.id} market={m} />
          ))}
        </div>
      </section>
    </div>
  )
}
