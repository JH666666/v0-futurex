"use client"

import { useState } from "react"
import { Crown, Trophy, Target, BarChart3 } from "lucide-react"
import { leaders, formatUSDC } from "@/lib/data"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "pnl", label: "盈利榜", icon: Trophy },
  { id: "accuracy", label: "准确率榜", icon: Target },
  { id: "volume", label: "交易量榜", icon: BarChart3 },
] as const

type TabId = (typeof tabs)[number]["id"]

export function LeaderboardView() {
  const [tab, setTab] = useState<TabId>("pnl")

  const sorted = [...leaders].sort((a, b) => {
    if (tab === "pnl") return b.pnl - a.pnl
    if (tab === "accuracy") return b.accuracy - a.accuracy
    return b.volume - a.volume
  })
  const top3 = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  function metric(l: (typeof leaders)[number]) {
    if (tab === "pnl") return `+${formatUSDC(l.pnl)}`
    if (tab === "accuracy") return `${l.accuracy}%`
    return formatUSDC(l.volume)
  }

  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)
  const heights = ["h-24", "h-32", "h-20"]

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-chart-4/20">
          <Crown className="size-6 text-chart-4" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">排行榜</h1>
          <p className="text-sm text-muted-foreground">2026 赛季 · 实时更新</p>
        </div>
      </div>

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

      {/* Podium */}
      <div className="grid grid-cols-3 items-end gap-3">
        {podiumOrder.map((l, i) => {
          const place = l.rank === 1 ? 1 : l === top3[1] ? 2 : 3
          const isFirst = i === 1
          return (
            <div key={l.handle} className="flex flex-col items-center gap-2">
              <span
                className={cn(
                  "flex items-center justify-center rounded-full font-bold text-background",
                  isFirst ? "size-16 bg-chart-4 text-lg" : "size-12 bg-secondary text-foreground",
                )}
              >
                {l.name.slice(0, 2).toUpperCase()}
              </span>
              <p className="max-w-full truncate text-xs font-semibold">{l.name}</p>
              <p className="num text-xs font-bold text-yes">{metric(l)}</p>
              <div
                className={cn(
                  "flex w-full items-start justify-center rounded-t-xl pt-2 text-sm font-bold",
                  heights[i],
                  isFirst ? "bg-chart-4/25 text-chart-4" : "bg-secondary/70 text-muted-foreground",
                )}
              >
                #{place}
              </div>
            </div>
          )
        })}
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl glass">
        {rest.map((l) => (
          <div key={l.handle} className="flex items-center gap-3 border-b border-border/50 px-4 py-3 last:border-0">
            <span className="num w-6 text-center text-sm font-bold text-muted-foreground">{l.rank}</span>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">
              {l.name.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{l.name}</p>
              <p className="num text-xs text-muted-foreground">{l.handle}</p>
            </div>
            <p className="num text-sm font-bold text-yes">{metric(l)}</p>
          </div>
        ))}
      </div>

      {/* Your rank */}
      <div className="flex items-center gap-3 rounded-2xl glass-strong p-4 ring-1 ring-primary/40">
        <span className="num w-6 text-center text-sm font-bold text-primary">42</span>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          YO
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">你 (you.base)</p>
          <p className="num text-xs text-muted-foreground">超过 87% 的交易者</p>
        </div>
        <p className="num text-sm font-bold text-yes">+$1,176</p>
      </div>
    </div>
  )
}
