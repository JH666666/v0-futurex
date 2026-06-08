"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Target, Percent, Wallet, FileText, Loader2 } from "lucide-react"
import { getPortfolio, type Position } from "@/lib/api-client"
import { Sparkline } from "@/components/sparkline"
import { ChainBadge } from "@/components/chain-badge"
import { formatUSDC } from "@/lib/data"
import { cn } from "@/lib/utils"

const equityTrend = [1200, 1280, 1240, 1390, 1450, 1420, 1580, 1640, 1720, 1690, 1810, 1920]

export function PortfolioView() {
  const [tab, setTab] = useState<"open" | "closed">("open")
  const [positions, setPositions] = useState<Position[]>([])
  const [stats, setStats] = useState({ totalValue: 0, totalPnl: 0, totalInvested: 0, positionCount: 0, roi: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPortfolio().then((data) => {
      setPositions(data.positions)
      setStats(data.stats)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const openPositions = positions.filter((p) => p.status === "open" && p.shares > 0)
  const closedPositions = positions.filter((p) => p.status !== "open" || p.shares <= 0)

  const statCards = [
    { label: "组合价值", value: formatUSDC(stats.totalValue), icon: Wallet, sub: "USDC" },
    { label: "总盈亏", value: `${stats.totalPnl >= 0 ? "+" : ""}${formatUSDC(stats.totalPnl)}`, icon: TrendingUp, sub: `${stats.roi >= 0 ? "+" : ""}${stats.roi}%`, good: stats.totalPnl >= 0 },
    { label: "持仓数", value: stats.positionCount, icon: FileText, sub: "个市场" },
    { label: "投入总额", value: formatUSDC(stats.totalInvested), icon: Percent, sub: "USDC" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">我的持仓</h1>
        <p className="mt-1 text-sm text-muted-foreground num">you.base · 0x7a3F…9C21</p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl glass-strong p-5 sm:p-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">总资产价值</p>
            <p className="num text-4xl font-bold tracking-tight">{formatUSDC(stats.totalValue)}</p>
            <p className={cn("num mt-1 text-sm font-semibold", stats.totalPnl >= 0 ? "text-yes" : "text-no")}>
              {stats.totalPnl >= 0 ? "+" : ""}{formatUSDC(stats.totalPnl)} ({stats.totalPnl >= 0 ? "+" : ""}{stats.roi}%)
            </p>
          </div>
          <div className="h-16 w-32"><Sparkline data={equityTrend} positive={stats.totalPnl >= 0} strokeWidth={2.5} /></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex flex-col gap-1.5 rounded-2xl glass p-4">
              <Icon className="size-4 text-primary" />
              <p className="num text-xl font-bold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label} · <span className={cn(s.good && "text-yes", s.good === false && "text-no")}>{s.sub}</span></p>
            </div>
          )
        })}
      </div>

      <div className="flex gap-2">
        {(["open", "closed"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("h-10 rounded-full px-5 text-sm font-semibold transition-colors", tab === t ? "bg-primary text-primary-foreground" : "glass text-muted-foreground")}>
            {t === "open" ? "持仓中" : "已平仓"}
          </button>
        ))}
      </div>

      {tab === "open" && (
        <div className="flex flex-col gap-3">
          {openPositions.length === 0 ? (
            <div className="rounded-2xl glass p-8 text-center">
              <p className="text-sm text-muted-foreground">暂无持仓</p>
              <a href="/" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">去交易</a>
            </div>
          ) : openPositions.map((p, i) => {
            const good = p.pnl >= 0
            return (
              <div key={`${p.marketId}-${p.side}-${i}`} className="flex flex-col gap-3 rounded-2xl glass p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-pretty text-sm font-semibold leading-snug">{p.marketQuestion}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-bold", p.side === "YES" ? "bg-yes/15 text-yes" : "bg-no/15 text-no")}>{p.side}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <Cell label="份额" value={`${p.shares.toFixed(1)}`} />
                  <Cell label="均价" value={`${p.avgPrice}¢`} />
                  <Cell label="现价" value={`${p.currentPrice}¢`} />
                  <Cell label="盈亏" value={`${good ? "+" : ""}$${Math.abs(p.pnl).toFixed(0)}`} good={good} bad={!good} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === "closed" && (
        <div className="flex flex-col gap-3">
          {closedPositions.length === 0 ? (
            <div className="rounded-2xl glass p-8 text-center"><p className="text-sm text-muted-foreground">暂无已平仓记录</p></div>
          ) : closedPositions.map((p, i) => {
            const good = p.pnl >= 0
            return (
              <div key={`closed-${i}`} className="flex flex-col gap-3 rounded-2xl glass p-4 opacity-70">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1.5"><p className="text-pretty text-sm font-semibold leading-snug">{p.marketQuestion}</p></div>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-bold", p.side === "YES" ? "bg-yes/15 text-yes" : "bg-no/15 text-no")}>{p.side}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <Cell label="份额" value={`${p.shares.toFixed(1)}`} />
                  <Cell label="均价" value={`${p.avgPrice}¢`} />
                  <Cell label="结算价" value={`${p.currentPrice}¢`} />
                  <Cell label="盈亏" value={`${good ? "+" : ""}$${Math.abs(p.pnl).toFixed(0)}`} good={good} bad={!good} />
                </div>
              </div>
            )
          })}
        </div>
      )}
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
