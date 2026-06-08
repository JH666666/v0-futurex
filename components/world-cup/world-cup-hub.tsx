"use client"

import { useState } from "react"
import Link from "next/link"
import { Trophy, Goal, Flag, Radio, ArrowUpRight } from "lucide-react"
import { matches, leaders, formatUSDC } from "@/lib/data"
import { getApprovedMarkets } from "@/lib/market-store"
import { MarketCard } from "@/components/market-card"
import { SectionHeader } from "@/components/section-header"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "winner", label: "冠军", icon: Trophy },
  { id: "match", label: "比赛", icon: Radio },
  { id: "qualify", label: "晋级", icon: Flag },
  { id: "scorer", label: "金靴", icon: Goal },
]

export function WorldCupHub() {
  const [tab, setTab] = useState("winner")
  const wc = getApprovedMarkets().filter((m) => m.category === "worldcup")
  const winner = wc.filter((m) => m.question.includes("冠军") || m.question.includes("卫冕"))
  const qualify = wc.filter((m) => m.question.includes("半决赛") || m.question.includes("晋级"))
  const scorer = wc.filter((m) => m.question.includes("金靴"))

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
      {/* Banner */}
      <section className="relative overflow-hidden rounded-3xl glass-strong">
        <img
          src="/worldcup-hero.png"
          alt="世界杯体育场"
          className="absolute inset-0 size-full object-cover opacity-40"
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="relative flex flex-col gap-3 px-6 py-10 sm:px-10">
          <span className="inline-flex w-fit items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-semibold">
            <Radio className="size-3.5 text-no" /> 直播开盘中
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">世界杯 2026 中心</h1>
          <p className="max-w-md text-sm text-muted-foreground sm:text-base">
            48 支球队，104 场比赛，全部可链上交易。冠军、晋级、金靴一站式预测。
          </p>
          <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground num">
            <span>市场总量 $15.2M</span>
            <span>104 场可交易比赛</span>
            <span>32 个活跃市场</span>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors",
                tab === t.id ? "bg-primary text-primary-foreground" : "glass text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {tab === "winner" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {winner.map((m) => (
            <MarketCard key={m.id} market={m} />
          ))}
        </div>
      )}

      {tab === "match" && (
        <div className="flex flex-col gap-3">
          {matches.map((m) => (
            <Link
              key={m.id}
              href={`/market/wc-match-bra-fra`}
              className="flex items-center gap-4 rounded-2xl glass p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-xs text-muted-foreground">{m.stage} · {m.date}</span>
                <span className="truncate font-semibold">{m.home} vs {m.away}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-yes/15 px-3 py-2 text-center">
                  <p className="text-[10px] text-yes/80">{m.home}</p>
                  <p className="num text-sm font-bold text-yes">{m.yes}¢</p>
                </div>
                <div className="rounded-xl bg-no/15 px-3 py-2 text-center">
                  <p className="text-[10px] text-no/80">{m.away}</p>
                  <p className="num text-sm font-bold text-no">{100 - m.yes}¢</p>
                </div>
              </div>
              <ArrowUpRight className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
            </Link>
          ))}
        </div>
      )}

      {tab === "qualify" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {qualify.map((m) => (
            <MarketCard key={m.id} market={m} />
          ))}
        </div>
      )}

      {tab === "scorer" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {scorer.map((m) => (
            <MarketCard key={m.id} market={m} />
          ))}
        </div>
      )}

      {/* Leaderboard preview */}
      <section>
        <SectionHeader title="世界杯交易者榜" subtitle="本赛季盈利排行" href="/leaderboard" />
        <div className="overflow-hidden rounded-2xl glass">
          {leaders.slice(0, 5).map((l) => (
            <div
              key={l.rank}
              className="flex items-center gap-3 border-b border-border/50 px-4 py-3 last:border-0"
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  l.rank === 1 ? "bg-chart-4 text-background" : "bg-secondary text-muted-foreground",
                )}
              >
                {l.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{l.name}</p>
                <p className="text-xs text-muted-foreground num">{l.handle}</p>
              </div>
              <div className="text-right">
                <p className="num text-sm font-bold text-yes">+{formatUSDC(l.pnl)}</p>
                <p className="text-xs text-muted-foreground num">胜率 {l.accuracy}%</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
