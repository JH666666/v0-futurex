"use client"

import { useState } from "react"
import { CheckCircle, Clock, AlertTriangle, Search, BarChart3 } from "lucide-react"
import {
  getAllMarkets,
  getApprovedMarkets,
  updateMarket,
  type StoreMarket,
} from "@/lib/market-store"
import { settleMarket, getAllPositions } from "@/lib/betting-store"
import { categoryLabels, chainMeta, formatUSDC } from "@/lib/data"
import { cn } from "@/lib/utils"

export default function AdminSettlementPage() {
  const [settlingId, setSettlingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "open" | "settled">("all")
  const [search, setSearch] = useState("")
  const [result, setResult] = useState<{
    settled: number; totalPayout: number; totalFrozen: number
  } | null>(null)

  const allMarkets = getAllMarkets()
  const positions = getAllPositions()

  // 按市场聚合持仓统计
  const marketStats = allMarkets.map((m) => {
    const marketPositions = positions.filter((p) => p.marketId === m.id)
    const openPositions = marketPositions.filter((p) => p.status === "open")
    const settledPositions = marketPositions.filter((p) => p.status === "settled")
    const totalBets = openPositions.reduce((s, p) => s + p.totalAmount, 0)
    const uniqueUsers = new Set(marketPositions.map((p) => p.userId)).size

    // Determine status
    let settleStatus: "open" | "settled"
    if (settledPositions.length > 0 && openPositions.length === 0) {
      settleStatus = "settled"
    } else {
      settleStatus = "open"
    }

    return {
      ...m,
      settleStatus,
      openPositions: openPositions.length,
      settledPositions: settledPositions.length,
      totalBets,
      uniqueUsers,
      settledOutcome: settledPositions[0]?.settledOutcome,
    }
  })

  const filtered = marketStats.filter((m) => {
    if (search && !m.question.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === "open" && m.settleStatus !== "open") return false
    if (filter === "settled" && m.settleStatus !== "settled") return false
    if (m.settleStatus === "open" && m.openPositions === 0 && filter !== "all") return false
    return true
  })

  // 只对有持仓的市场显示
  const displayList = filter === "all"
    ? filtered // show all markets
    : filtered

  const openCount = marketStats.filter((m) => m.settleStatus === "open" && m.openPositions > 0).length
  const settledCount = marketStats.filter((m) => m.settleStatus === "settled").length
  const totalBetsAll = marketStats.reduce((s, m) => s + m.totalBets, 0)

  function handleSettle(marketId: string, outcome: "YES" | "NO") {
    const r = settleMarket(marketId, outcome)
    // 更新市场状态和价格
    updateMarket(marketId, {
      yesPrice: outcome === "YES" ? 100 : 0,
    } as Partial<StoreMarket>)
    setResult(r)
    setSettlingId(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">结算管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          裁定预测结果 · YES 赢家按份额分配 · NO 输家归零
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "待结算市场", value: openCount, icon: Clock, color: "text-chart-4", bg: "bg-chart-4/10" },
          { label: "已结算市场", value: settledCount, icon: CheckCircle, color: "text-yes", bg: "bg-yes/10" },
          { label: "总下注额", value: formatUSDC(totalBetsAll), icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
          { label: "持仓用户数", value: new Set(positions.map((p) => p.userId)).size, icon: AlertTriangle, color: "text-no", bg: "bg-no/10" },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center gap-4 rounded-2xl glass p-4">
              <span className={cn("flex size-10 items-center justify-center rounded-xl", s.bg)}>
                <Icon className={cn("size-5", s.color)} />
              </span>
              <div>
                <p className="num text-2xl font-bold tracking-tight">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* 结算结果提示 */}
      {result && (
        <div className="rounded-2xl bg-yes/10 p-5 ring-1 ring-yes/30">
          <p className="font-bold text-yes">✅ 结算完成</p>
          <p className="mt-1 text-sm text-muted-foreground">
            已结算 {result.settled} 个持仓 ·
            总返还 {formatUSDC(result.totalPayout)} ·
            冻结释放 {formatUSDC(result.totalFrozen)}
          </p>
          <button onClick={() => setResult(null)} className="mt-2 text-xs text-muted-foreground hover:text-foreground">关闭</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索市场..."
            className="h-11 w-full rounded-full glass pl-10 pr-4 text-sm outline-none"
          />
        </div>
        {(["all", "open", "settled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "h-9 rounded-full px-4 text-sm font-medium transition-colors",
              filter === f ? "bg-primary text-primary-foreground" : "glass text-muted-foreground",
            )}
          >
            {f === "all" ? "全部" : f === "open" ? "待结算" : "已结算"}
          </button>
        ))}
      </div>

      {/* Settlement list */}
      <div className="flex flex-col gap-3">
        {displayList.map((m) => {
          const isOpen = m.settleStatus === "open" && m.openPositions > 0
          const showActions = isOpen
          const isActive = settlingId === m.id

          return (
            <div
              key={m.id}
              className={cn(
                "flex flex-col gap-4 rounded-2xl glass p-5",
                isOpen && "ring-1 ring-chart-4/20",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {categoryLabels[m.category]}
                    </span>
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                      isOpen && "bg-chart-4/15 text-chart-4",
                      !isOpen && m.settleStatus === "settled" && "bg-yes/15 text-yes",
                    )}>
                      {isOpen ? <Clock className="size-3" /> : <CheckCircle className="size-3" />}
                      {isOpen ? "待结算" : "已结算"}
                    </span>
                    {m.settledOutcome && (
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-bold",
                        m.settledOutcome === "YES" ? "bg-yes/15 text-yes" : "bg-no/15 text-no",
                      )}>
                        结果: {m.settledOutcome}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold">{m.question}</h3>

                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>当前 YES: {m.yesPrice}%</span>
                    <span>持仓数: {m.openPositions + m.settledPositions}</span>
                    <span>总下注: {formatUSDC(m.totalBets)}</span>
                    <span>{m.uniqueUsers} 个用户</span>
                  </div>
                </div>

                {showActions && (
                  <div className="flex shrink-0 items-center gap-2">
                    {isActive ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs text-center text-muted-foreground">选择结果:</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSettle(m.id, "YES")}
                            className="h-10 rounded-xl bg-yes px-5 text-sm font-bold text-yes-foreground hover:bg-yes/90"
                          >
                            YES 胜
                          </button>
                          <button
                            onClick={() => handleSettle(m.id, "NO")}
                            className="h-10 rounded-xl bg-no px-5 text-sm font-bold text-no-foreground hover:bg-no/90"
                          >
                            NO 胜
                          </button>
                        </div>
                        <button
                          onClick={() => setSettlingId(null)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSettlingId(m.id)}
                        className="h-10 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
                      >
                        执行结算
                      </button>
                    )}
                  </div>
                )}

                {!showActions && m.settleStatus === "settled" && (
                  <div className="rounded-full bg-yes/10 px-4 py-2 text-xs font-medium text-yes">
                    已结算 · {m.settledOutcome} 胜
                  </div>
                )}
              </div>

              {/* 持仓明细 */}
              {isActive && (
                <div className="rounded-xl bg-secondary/40 p-4">
                  <h4 className="mb-3 text-sm font-bold">该市场持仓</h4>
                  <div className="flex flex-col gap-2">
                    {positions.filter((p) => p.marketId === m.id && p.status === "open").map((p, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-background/50 px-3 py-2 text-xs">
                        <span className="font-mono">{p.userId}</span>
                        <span className={cn("font-bold", p.side === "YES" ? "text-yes" : "text-no")}>{p.side}</span>
                        <span>${p.totalAmount.toFixed(0)}</span>
                        <span>{p.shares.toFixed(1)} 股</span>
                        <span>均价 {p.avgPrice}¢</span>
                      </div>
                    ))}
                    {positions.filter((p) => p.marketId === m.id && p.status === "open").length === 0 && (
                      <p className="text-xs text-muted-foreground">无持仓</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
          没有匹配的市场
        </p>
      )}
    </div>
  )
}
