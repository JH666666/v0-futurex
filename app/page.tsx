import { HomeHero } from "@/components/home/home-hero"
import { StatsDashboard } from "@/components/home/stats-dashboard"
import { CategoryStrip } from "@/components/home/category-strip"
import { SectionHeader } from "@/components/section-header"
import { MarketCard } from "@/components/market-card"
import { markets } from "@/lib/data"

export default function HomePage() {
  const trending = [...markets].sort((a, b) => b.volume - a.volume).slice(0, 3)
  const endingSoon = [...markets]
    .sort((a, b) => +new Date(a.endDate) - +new Date(b.endDate))
    .slice(0, 3)
  const newMarkets = [...markets].slice(-3).reverse()
  const featured = markets.filter((m) => m.featured).slice(0, 3)
  const worldcup = markets.filter((m) => m.category === "worldcup").slice(0, 3)

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 sm:py-8">
      <HomeHero />
      <StatsDashboard />
      <CategoryStrip />

      <section>
        <SectionHeader title="热门预测" subtitle="按成交量排序的最活跃市场" href="/world-cup" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trending.map((m) => (
            <MarketCard key={m.id} market={m} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="精选预测" subtitle="编辑精选的高关注市场" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((m) => (
            <MarketCard key={m.id} market={m} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="即将截止" subtitle="临近结算、把握最后机会" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {endingSoon.map((m) => (
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
        <SectionHeader title="新上线市场" subtitle="最新开盘的预测主题" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {newMarkets.map((m) => (
            <MarketCard key={m.id} market={m} />
          ))}
        </div>
      </section>
    </div>
  )
}
