"use client"

import Link from "next/link"
import { TrendingUp, TrendingDown, Users } from "lucide-react"
import { type Market, categoryLabels, formatUSDC } from "@/lib/data"
import { Sparkline } from "@/components/sparkline"
import { ChainBadge } from "@/components/chain-badge"
import { cn } from "@/lib/utils"

const catColor: Record<string, string> = {
  worldcup: "text-yes",
  crypto: "text-primary",
  ai: "text-chart-4",
  politics: "text-chart-5",
  finance: "text-chart-2",
  entertainment: "text-chart-3",
}

export function MarketCard({ market }: { market: Market }) {
  const up = market.change24h >= 0
  return (
    <Link
      href={`/market/${market.id}`}
      className="group flex flex-col gap-4 rounded-2xl glass p-4 transition-all hover:border-primary/40 hover:bg-card/70"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-semibold uppercase tracking-wide", catColor[market.category])}>
            {categoryLabels[market.category]}
          </span>
          <ChainBadge chain={market.chain} />
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold num",
            up ? "bg-yes/15 text-yes" : "bg-no/15 text-no",
          )}
        >
          {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {up ? "+" : ""}
          {market.change24h.toFixed(1)}%
        </span>
      </div>

      <h3 className="text-pretty text-[15px] font-semibold leading-snug">{market.question}</h3>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">YES 概率</p>
          <p className="num text-2xl font-bold tracking-tight">{market.yesPrice}%</p>
        </div>
        <div className="h-9 w-24">
          <Sparkline data={market.trend} positive={up} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button className="h-10 rounded-xl bg-yes/15 text-sm font-bold text-yes transition-colors hover:bg-yes/25">
          买 YES · {market.yesPrice}¢
        </button>
        <button className="h-10 rounded-xl bg-no/15 text-sm font-bold text-no transition-colors hover:bg-no/25">
          买 NO · {100 - market.yesPrice}¢
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <span className="num">成交量 {formatUSDC(market.volume)}</span>
        <span className="inline-flex items-center gap-1 num">
          <Users className="size-3" />
          {market.participants.toLocaleString()}
        </span>
      </div>
    </Link>
  )
}
