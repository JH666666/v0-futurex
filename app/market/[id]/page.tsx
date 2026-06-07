import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, TrendingUp, TrendingDown, Users, DollarSign, Droplets, CalendarClock, ShieldCheck } from "lucide-react"
import { getMarket, markets, categoryLabels, formatUSDC } from "@/lib/data"
import { ProbabilityChart } from "@/components/market/probability-chart"
import { TradePanel } from "@/components/market/trade-panel"
import { Comments } from "@/components/market/comments"

export function generateStaticParams() {
  return markets.map((m) => ({ id: m.id }))
}

export default async function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const market = getMarket(id)
  if (!market) notFound()

  const up = market.change24h >= 0
  const stats = [
    { label: "成交量", value: formatUSDC(market.volume), icon: DollarSign },
    { label: "流动性", value: formatUSDC(market.liquidity), icon: Droplets },
    { label: "参与者", value: market.participants.toLocaleString(), icon: Users },
    { label: "截止", value: market.endDate, icon: CalendarClock },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <Link href="/world-cup" className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回市场
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-4 rounded-2xl glass p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                {categoryLabels[market.category]}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-yes" /> 预言机结算
              </span>
            </div>
            <h1 className="text-balance text-2xl font-bold leading-tight sm:text-3xl">{market.question}</h1>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-sm text-muted-foreground">当前 YES 概率</p>
                <p className="num text-4xl font-bold tracking-tight">{market.yesPrice}%</p>
              </div>
              <span
                className={`mb-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold num ${
                  up ? "bg-yes/15 text-yes" : "bg-no/15 text-no"
                }`}
              >
                {up ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                {up ? "+" : ""}
                {market.change24h.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Chart */}
          <div className="rounded-2xl glass p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">概率走势</h2>
              <div className="flex gap-1 rounded-lg bg-secondary/60 p-1">
                {["1H", "1D", "1W", "全部"].map((t, i) => (
                  <button
                    key={t}
                    className={`rounded-md px-3 py-1 text-xs font-semibold ${i === 2 ? "bg-card text-foreground" : "text-muted-foreground"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <ProbabilityChart data={market.trend} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="flex flex-col gap-1.5 rounded-2xl glass p-4">
                  <Icon className="size-4 text-primary" />
                  <p className="num text-lg font-bold tracking-tight">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              )
            })}
          </div>

          {/* Resolution */}
          <div className="flex flex-col gap-2 rounded-2xl glass p-5">
            <h2 className="font-bold">结算来源</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              本市场将根据 <span className="font-semibold text-foreground">{market.resolution}</span> 进行裁定。
              结果由去中心化预言机网络在事件结束后自动写入合约，并按比例向 YES / NO 持有者分配 USDC。
            </p>
          </div>

          {/* Trade panel on mobile */}
          <div className="lg:hidden">
            <TradePanel market={market} />
          </div>

          <Comments />
        </div>

        {/* Sidebar trade panel desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <TradePanel market={market} />
          </div>
        </aside>
      </div>
    </div>
  )
}
