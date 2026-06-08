"use client"

import { useState, useEffect } from "react"
import { MarketCard } from "@/components/market-card"
import { SectionHeader } from "@/components/section-header"
import { useChain } from "@/components/chain-provider"
import { chainOrder, chainMeta, type Chain, formatUSDC } from "@/lib/data"
import { getMarkets, type Market } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type Filter = Chain | "all"

export function HomeMarkets() {
  const { filterChain, setFilterChain } = useChain()
  const filter = filterChain
  const [pool, setPool] = useState<Market[]>([])

  useEffect(() => {
    getMarkets({ status: "active" }).then((res) => setPool(res.data))
  }, [])

  const chainPool = filter === "all" ? pool : pool.filter((m) => m.chain === filter)

  const trending = [...chainPool].sort((a, b) => b.volume - a.volume).slice(0, 3)
  const featured = chainPool.filter((m) => m.featured).slice(0, 3)
  const endingSoon = [...chainPool].sort((a, b) => +new Date(a.endDate) - +new Date(b.endDate)).slice(0, 3)
  const worldcup = chainPool.filter((m) => m.category === "worldcup").slice(0, 3)
  const newMarkets = [...chainPool].slice(-3).reverse()

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "全部网络" },
    ...chainOrder.map((c) => ({ id: c, label: chainMeta[c].short })),
  ]

  return (
    <div className="flex flex-col gap-10">
      {/* Network filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">网络</span>
        {filters.map((f) => {
          const active = filter === f.id
          const dot = f.id !== "all" ? chainMeta[f.id as Chain].dot : ""
          return (
            <button
              key={f.id}
              onClick={() => setFilterChain(f.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                active ? "bg-foreground text-background" : "glass text-muted-foreground hover:text-foreground",
              )}
            >
              {dot && <span className={cn("size-1.5 rounded-full", dot)} aria-hidden />}
              {f.label}
            </button>
          )
        })}
      </div>

      {trending.length === 0 ? (
        <p className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
          该网络暂无市场，敬请期待。
        </p>
      ) : (
        <>
          <section>
            <SectionHeader title="热门预测" subtitle="按成交量排序的最活跃市场" href="/world-cup" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {trending.map((m) => (
                <MarketCard key={m.id} market={m} />
              ))}
            </div>
          </section>

          {featured.length > 0 && (
            <section>
              <SectionHeader title="精选预测" subtitle="编辑精选的高关注市场" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((m) => (
                  <MarketCard key={m.id} market={m} />
                ))}
              </div>
            </section>
          )}

          <section>
            <SectionHeader title="即将截止" subtitle="临近结算、把握最后机会" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {endingSoon.map((m) => (
                <MarketCard key={m.id} market={m} />
              ))}
            </div>
          </section>

          {worldcup.length > 0 && (
            <section>
              <SectionHeader title="世界杯 2026" subtitle="冠军、晋级与金靴市场" href="/world-cup" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {worldcup.map((m) => (
                  <MarketCard key={m.id} market={m} />
                ))}
              </div>
            </section>
          )}

          <section>
            <SectionHeader title="新上线市场" subtitle="最新开盘的预测主题" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {newMarkets.map((m) => (
                <MarketCard key={m.id} market={m} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
