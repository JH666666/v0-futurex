"use client"

import { useState } from "react"
import { Star, GripVertical, Clock, X, Zap, Search } from "lucide-react"
import {
  categoryLabels,
  chainMeta,
  formatUSDC,
} from "@/lib/data"
import { getAllMarkets, updateMarket, type StoreMarket } from "@/lib/market-store"
import { cn } from "@/lib/utils"

export default function AdminFeaturedPage() {
  const [allMarkets, setAllMarkets] = useState<StoreMarket[]>(
    () => getAllMarkets().map((m) => ({ ...m })),
  )
  const [search, setSearch] = useState("")
  const [featuredDuration, setFeaturedDuration] = useState<Record<string, string>>({})

  const featured = allMarkets.filter((m) => m.featured)
  const regular = allMarkets.filter((m) => !m.featured)

  const filteredRegular = regular.filter((m) => {
    if (search && !m.question.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function toggleFeatured(id: string) {
    setAllMarkets((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m
        const updated = { ...m, featured: !m.featured }
        updateMarket(id, { featured: updated.featured } as Partial<StoreMarket>)
        return updated
      }),
    )
  }

  function removeFeatured(id: string) {
    setAllMarkets((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m
        updateMarket(id, { featured: false } as Partial<StoreMarket>)
        return { ...m, featured: false }
      }),
    )
  }

  function moveUp(index: number) {
    if (index === 0) return
    setAllMarkets((prev) => {
      const featuredIds = prev.filter((m) => m.featured).map((m) => m.id)
      const newOrder = [...featuredIds]
      ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
      // Reorder by assigning temporary sort keys (we just swap positions visually)
      const updated = [...prev]
      const fIndexes = featuredIds.map((id) => updated.findIndex((m) => m.id === id))
      const temp = updated[fIndexes[index - 1]]
      updated[fIndexes[index - 1]] = updated[fIndexes[index]]
      updated[fIndexes[index]] = temp
      return updated
    })
  }

  function moveDown(index: number) {
    if (index === featured.length - 1) return
    moveUp(index + 1) // swap with next = same as next moving up
    // Actually let me just do it properly
    setAllMarkets((prev) => {
      const featuredIds = prev.filter((m) => m.featured).map((m) => m.id)
      const newOrder = [...featuredIds]
      ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
      const updated = [...prev]
      const fIndexes = featuredIds.map((id) => updated.findIndex((m) => m.id === id))
      const temp = updated[fIndexes[index]]
      updated[fIndexes[index]] = updated[fIndexes[index + 1]]
      updated[fIndexes[index + 1]] = temp
      return updated
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">引流市场</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理首页精选展示 · 当前 {featured.length} 个精选市场
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm">
          <Zap className="size-4 text-chart-4" />
          最多展示 6 个精选
        </span>
      </div>

      {/* 精选区域 */}
      <div className="rounded-2xl glass-strong p-5 ring-1 ring-chart-4/20">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <Star className="size-5 fill-chart-4 text-chart-4" />
          当前精选 ({featured.length})
        </h2>
        {featured.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            暂无精选市场，从下方列表添加
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {featured.map((m, i) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3"
              >
                <div className="flex shrink-0 flex-col gap-0.5">
                  <button
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveDown(i)}
                    disabled={i === featured.length - 1}
                    className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-chart-4/15 text-xs font-bold text-chart-4">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{m.question}</p>
                  <p className="text-xs text-muted-foreground">
                    {categoryLabels[m.category]} · {chainMeta[m.chain].short} · {m.yesPrice}%
                  </p>
                </div>
                <input
                  type="date"
                  value={featuredDuration[m.id] || ""}
                  onChange={(e) =>
                    setFeaturedDuration((prev) => ({ ...prev, [m.id]: e.target.value }))
                  }
                  placeholder="展示截止"
                  className="h-9 rounded-lg bg-secondary/60 px-3 text-xs outline-none [color-scheme:dark]"
                />
                <button
                  onClick={() => removeFeatured(m.id)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-no/10 hover:text-no"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 市场列表 */}
      <div className="rounded-2xl glass p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">全部市场</h2>
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索..."
              className="h-9 w-full rounded-full glass pl-9 pr-3 text-xs outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
          {filteredRegular.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-secondary/30 transition-colors"
            >
              <button
                onClick={() => toggleFeatured(m.id)}
                disabled={featured.length >= 6 && !m.featured}
                className={cn(
                  "shrink-0 rounded-lg p-1.5 transition-colors",
                  m.featured
                    ? "text-chart-4"
                    : "text-muted-foreground hover:text-chart-4",
                  featured.length >= 6 && !m.featured && "opacity-30 cursor-not-allowed",
                )}
              >
                <Star className={cn("size-4", m.featured && "fill-current")} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.question}</p>
                <p className="text-xs text-muted-foreground">
                  {categoryLabels[m.category]} · {chainMeta[m.chain].short} · YES {m.yesPrice}%
                </p>
              </div>
              <span className="num shrink-0 text-xs text-muted-foreground">
                {formatUSDC(m.volume)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
