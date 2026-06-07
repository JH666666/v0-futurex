"use client"

import { useState } from "react"
import { TrendingUp, Target, Percent, Wallet } from "lucide-react"
import { positions, closedPositions } from "@/lib/data"
import { Sparkline } from "@/components/sparkline"
import { cn } from "@/lib/utils"

const equityTrend = [1200, 1280, 1240, 1390, 1450, 1420, 1580, 1640, 1720, 1690, 1810, 1920]

export function PortfolioView() {
  const [tab, setTab] = useState<"open" | "closed">("open")
  const openValue = positions.reduce((s, p) => s + p.value, 0)
  const openPnl = positions.reduce((s, p) => s + (p.current - p.avg) * p.shares * (p.side === "YES" ? 0.01 : -0.01), 0)

  const stats = [
    { label: "组合价值", value: "$2,792", icon: Wallet, sub: "USDC" },
    { label: "总盈亏", value: "+$1,176", icon: TrendingUp, sub: "+72.6%", good: true },
    { label: "胜率", value: "68%", icon: Target, sub: "近 50 笔" },
    { label: "ROI", value: "142%", icon: Percent, sub: "本赛季", good: true },
  ]

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">我的持仓</h1>
        <p className="mt-1 text-sm text-muted-foreground num">vitalik.base · 0x7a3F…9C21</p>
      </div>

      {/* Equity card */}
      <div className="flex flex-col gap-4 rounded-2xl glass-strong p-5 sm:p-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">总资产价值</p>
            <p className="num text-4xl font-bold tracking-tight">$2,792.60</p>
            <p className="num mt-1 text-sm font-semibold text-yes">+$1,176.20 (+72.6%)</p>
          </div>
          <div className="h-16 w-32">
            <Sparkline data={equityTrend} positive strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex flex-col gap-1.5 rounded-2xl glass p-4">
              <Icon className="size-4 text-primary" />
              <p className="num text-xl font-bold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground">
                {s.label} · <span className={cn(s.good && "text-yes")}>{s.sub}</span>
              </p>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["open", "closed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "h-10 rounded-full px-5 text-sm font-semibold transition-colors",
              tab === t ? "bg-primary text-primary-foreground" : "glass text-muted-foreground",
            )}
          >
            {t === "open" ? "持仓中" : "已平仓"}
          </button>
        ))}
      </div>

      {/* Positions */}
      <div className="flex flex-col gap-3">
        {tab === "open"
          ? positions.map((p) => {
              const pnl = (p.current - p.avg) * p.shares * (p.side === "YES" ? 0.01 : -0.01)
              const good = pnl >= 0
              return (
                <div key={p.id} className="flex flex-col gap-3 rounded-2xl glass p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-pretty text-sm font-semibold leading-snug">{p.market}</p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold",
                        p.side === "YES" ? "bg-yes/15 text-yes" : "bg-no/15 text-no",
                      )}
                    >
                      {p.side}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <Cell label="份额" value={`${p.shares}`} />
                    <Cell label="均价" value={`${p.avg}¢`} />
                    <Cell label="现价" value={`${p.current}¢`} />
                    <Cell label="盈亏" value={`${good ? "+" : ""}$${pnl.toFixed(0)}`} good={good} bad={!good} />
                  </div>
                </div>
              )
            })
          : closedPositions.map((p) => {
              const good = p.pnl >= 0
              return (
                <div key={p.id} className="flex flex-col gap-3 rounded-2xl glass p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-pretty text-sm font-semibold leading-snug">{p.market}</p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold",
                        p.side === "YES" ? "bg-yes/15 text-yes" : "bg-no/15 text-no",
                      )}
                    >
                      {p.side}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <Cell label="份额" value={`${p.shares}`} />
                    <Cell label="入场" value={`${p.entry}¢`} />
                    <Cell label="结算" value={`${p.exit}¢`} />
                    <Cell label="盈亏" value={`${good ? "+" : ""}$${p.pnl}`} good={good} bad={!good} />
                  </div>
                </div>
              )
            })}
      </div>
    </div>
  )
}

function Cell({ label, value, good, bad }: { label: string; value: string; good?: boolean; bad?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("num font-bold", good && "text-yes", bad && "text-no")}>{value}</span>
    </div>
  )
}
