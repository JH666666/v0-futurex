"use client"

import { useState } from "react"
import { Search, TrendingUp, TrendingDown, Save, RotateCcw } from "lucide-react"
import {
  categoryLabels,
  chainMeta,
  formatUSDC,
} from "@/lib/data"
import { getAllMarkets, updateMarket, type StoreMarket } from "@/lib/market-store"
import { Sparkline } from "@/components/sparkline"
import { cn } from "@/lib/utils"

export default function AdminOddsPage() {
  const [markets, setMarkets] = useState<StoreMarket[]>(
    () => getAllMarkets().map((m) => ({ ...m }))
  )
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState(0)
  const [savedId, setSavedId] = useState<string | null>(null)

  const filtered = markets.filter((m) => {
    if (search && !m.question.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function startEdit(m: Market) {
    setEditingId(m.id)
    setEditValue(m.yesPrice)
  }

  function saveOdds(id: string) {
    const clamped = Math.max(1, Math.min(99, editValue))
    const old = markets.find((m) => m.id === id)
    setMarkets((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              yesPrice: clamped,
              change24h: clamped - m.yesPrice,
              trend: [...m.trend.slice(1), clamped],
            }
          : m,
      ),
    )
    // 同步到 store
    updateMarket(id, { yesPrice: clamped } as Partial<StoreMarket>)
    setEditingId(null)
    setSavedId(id)
    setTimeout(() => setSavedId(null), 1500)
  }

  function resetOdds(id: string, original: number) {
    setMarkets((prev) =>
      prev.map((m) => (m.id === id ? { ...m, yesPrice: original, change24h: 0 } : m)),
    )
    updateMarket(id, { yesPrice: original } as Partial<StoreMarket>)
    setSavedId(id)
    setTimeout(() => setSavedId(null), 1500)
  }

  // stats
  const avgOdds = Math.round(
    markets.reduce((s, m) => s + m.yesPrice, 0) / markets.length,
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">赔率配置</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          手动调整各市场的 YES 价格 · 当前 {markets.length} 个市场
        </p>
      </div>

      {/* 统计条 */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "市场总数", value: markets.length },
          { label: "平均赔率", value: `${avgOdds}%` },
          { label: "总成交量", value: formatUSDC(markets.reduce((s, m) => s + m.volume, 0)) },
        ].map((s) => (
          <div key={s.label} className="flex flex-col gap-1 rounded-2xl glass p-4">
            <p className="num text-2xl font-bold tracking-tight">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 搜索 */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索市场..."
          className="h-11 w-full rounded-full glass pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* 赔率表格 */}
      <div className="overflow-hidden rounded-2xl glass">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                <th className="pb-3 pl-5 pr-4 font-medium">市场</th>
                <th className="pb-3 pr-4 font-medium">品类</th>
                <th className="pb-3 pr-4 font-medium">链</th>
                <th className="pb-3 pr-4 font-medium num">当前 YES%</th>
                <th className="pb-3 pr-4 font-medium">走势</th>
                <th className="pb-3 pr-4 font-medium num">24h 变化</th>
                <th className="pb-3 pr-4 font-medium num">成交量</th>
                <th className="pb-3 pr-5 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const editing = editingId === m.id
                const saved = savedId === m.id
                return (
                  <tr key={m.id} className="border-b border-border/30">
                    <td className="max-w-[220px] py-3 pl-5 pr-4">
                      <span className="font-medium line-clamp-2">{m.question}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {categoryLabels[m.category]}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        m.chain === "base" ? "bg-primary/10 text-primary" : "bg-chart-4/10 text-chart-4"
                      )}>
                        {chainMeta[m.chain].short}
                      </span>
                    </td>
                    <td className="num py-3 pr-4">
                      {editing ? (
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={editValue}
                          onChange={(e) => setEditValue(Number(e.target.value))}
                          className="w-16 rounded-lg bg-secondary/60 px-2 py-1 text-center text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                        />
                      ) : (
                        <span className="text-lg font-bold">{m.yesPrice}%</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="h-8 w-20">
                        <Sparkline data={m.trend} positive={m.change24h >= 0} />
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 num text-xs font-semibold",
                          m.change24h >= 0 ? "text-yes" : "text-no",
                        )}
                      >
                        {m.change24h >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                        {m.change24h >= 0 ? "+" : ""}{m.change24h.toFixed(1)}%
                      </span>
                    </td>
                    <td className="num py-3 pr-4 text-muted-foreground">{formatUSDC(m.volume)}</td>
                    <td className="py-3 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {editing ? (
                          <button
                            onClick={() => saveOdds(m.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-yes/15 px-2.5 py-1.5 text-xs font-semibold text-yes hover:bg-yes/25"
                          >
                            <Save className="size-3" /> 保存
                          </button>
                        ) : saved ? (
                          <span className="text-xs font-medium text-yes">✅ 已保存</span>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(m)}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => resetOdds(m.id, initialMarkets.find((x) => x.id === m.id)?.yesPrice ?? m.yesPrice)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
                              title="恢复原始赔率"
                            >
                              <RotateCcw className="size-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">没有匹配的市场</p>
        )}
      </div>
    </div>
  )
}
