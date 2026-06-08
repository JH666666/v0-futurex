"use client"

import { useState } from "react"
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Star,
  Filter,
  X,
  Check,
  Layers,
  CheckSquare,
  Square,
} from "lucide-react"
import {
  categoryLabels,
  chainMeta,
  formatUSDC,
  type Category,
  type Chain,
} from "@/lib/data"
import { getAllMarkets, deleteMarket, updateMarket, type StoreMarket } from "@/lib/market-store"
import { cn } from "@/lib/utils"

export default function AdminMarketsPage() {
  const [marketsList, setMarketsList] = useState<StoreMarket[]>(
    () => getAllMarkets().map((m) => ({ ...m })),
  )
  const [search, setSearch] = useState("")
  const [filterCat, setFilterCat] = useState<Category | "all">("all")
  const [filterChain, setFilterChain] = useState<Chain | "all">("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "settled">("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<StoreMarket>>({})
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [batchMode, setBatchMode] = useState(false)

  const filtered = marketsList.filter((m) => {
    if (search && !m.question.toLowerCase().includes(search.toLowerCase()))
      return false
    if (filterCat !== "all" && m.category !== filterCat) return false
    if (filterChain !== "all" && m.chain !== filterChain) return false
    if (filterStatus === "active" && new Date(m.endDate) < new Date()) return false
    if (filterStatus === "settled" && new Date(m.endDate) >= new Date()) return false
    return true
  })

  function handleDelete(id: string) {
    setMarketsList((prev) => prev.filter((m) => m.id !== id))
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n })
    deleteMarket(id)
  }

  function handleBatchDelete() {
    selected.forEach((id) => deleteMarket(id))
    setMarketsList((prev) => prev.filter((m) => !selected.has(m.id)))
    setSelected(new Set())
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((m) => m.id)))
    }
  }

  function handleToggleFeatured(id: string) {
    setMarketsList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, featured: !m.featured } : m)),
    )
  }

  function startEdit(m: Market) {
    setEditingId(m.id)
    setEditForm({ question: m.question, category: m.category, endDate: m.endDate, featured: m.featured })
  }

  function saveEdit(id: string) {
    setMarketsList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...editForm } : m)),
    )
    updateMarket(id, editForm as Partial<StoreMarket>)
    setEditingId(null)
  }

  const categories: (Category | "all")[] = ["all", "worldcup", "crypto", "ai", "politics", "finance", "entertainment"]
  const chains: (Chain | "all")[] = ["all", "base", "bsc"]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">市场管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理所有预测市场 · {marketsList.length} 个市场
          </p>
        </div>
        <button className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95">
          <Plus className="size-4" />
          新建市场
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索市场..."
            className="h-11 w-full rounded-full glass pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value as Category | "all")}
          className="h-11 rounded-full glass px-4 text-sm outline-none"
        >
          <option value="all">全部品类</option>
          {categories.filter(c => c !== "all").map((c) => (
            <option key={c} value={c}>{categoryLabels[c]}</option>
          ))}
        </select>
        <select
          value={filterChain}
          onChange={(e) => setFilterChain(e.target.value as Chain | "all")}
          className="h-11 rounded-full glass px-4 text-sm outline-none"
        >
          <option value="all">全部网络</option>
          <option value="base">Base</option>
          <option value="bsc">BNB Chain</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "settled")}
          className="h-11 rounded-full glass px-4 text-sm outline-none"
        >
          <option value="all">全部状态</option>
          <option value="active">进行中</option>
          <option value="settled">已到期</option>
        </select>
        {(filterCat !== "all" || filterChain !== "all" || search || filterStatus !== "all") && (
          <button
            onClick={() => { setFilterCat("all"); setFilterChain("all"); setSearch(""); setFilterStatus("all") }}
            className="inline-flex h-9 items-center gap-1 rounded-full glass px-3 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" /> 清除筛选
          </button>
        )}
        <button
          onClick={() => setBatchMode(!batchMode)}
          className={cn(
            "ml-auto inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
            batchMode ? "bg-primary text-primary-foreground" : "glass text-muted-foreground",
          )}
        >
          <Layers className="size-3.5" />
          批量操作
        </button>
      </div>

      {/* Batch toolbar */}
      {batchMode && selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-no/5 px-4 py-3 ring-1 ring-no/20">
          <span className="text-sm font-medium">
            已选 {selected.size} 项
          </span>
          <button
            onClick={handleBatchDelete}
            className="inline-flex items-center gap-1 rounded-lg bg-no/15 px-3 py-1.5 text-xs font-semibold text-no hover:bg-no/25"
          >
            <Trash2 className="size-3" /> 批量删除
          </button>
          <button
            onClick={() => { setSelected(new Set()); setBatchMode(false) }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            取消选择
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl glass">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                {batchMode && (
                  <th className="pb-3 pl-5 pr-2 font-medium w-8">
                    <button onClick={toggleSelectAll}>
                      {selected.size === filtered.length && filtered.length > 0
                        ? <CheckSquare className="size-4 text-primary" />
                        : <Square className="size-4" />
                      }
                    </button>
                  </th>
                )}
                <th className="pb-3 pl-5 pr-4 font-medium">市场名称</th>
                <th className="pb-3 pr-4 font-medium">品类</th>
                <th className="pb-3 pr-4 font-medium">链</th>
                <th className="pb-3 pr-4 font-medium num">YES%</th>
                <th className="pb-3 pr-4 font-medium num">成交量</th>
                <th className="pb-3 pr-4 font-medium">截止日期</th>
                <th className="pb-3 pr-4 font-medium">精选</th>
                <th className="pb-3 pr-5 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const editing = editingId === m.id
                return (
                  <tr key={m.id} className="border-b border-border/30">
                    {batchMode && (
                      <td className="py-3 pl-5 pr-2">
                        <button onClick={() => toggleSelect(m.id)}>
                          {selected.has(m.id)
                            ? <CheckSquare className="size-4 text-primary" />
                            : <Square className="size-4 text-muted-foreground" />
                          }
                        </button>
                      </td>
                    )}
                    <td className="max-w-[240px] py-3 pl-5 pr-4">
                      {editing ? (
                        <input
                          value={editForm.question || m.question}
                          onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                          className="w-full rounded-lg bg-secondary/60 px-2 py-1 text-sm outline-none"
                        />
                      ) : (
                        <span className="font-medium">{m.question}</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {editing ? (
                        <select
                          value={editForm.category || m.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Category })}
                          className="rounded-lg bg-secondary/60 px-2 py-1 text-xs outline-none"
                        >
                          {categories.filter(c => c !== "all").map((c) => (
                            <option key={c} value={c}>{categoryLabels[c]}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {categoryLabels[m.category]}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        m.chain === "base" ? "bg-primary/10 text-primary" : "bg-chart-4/10 text-chart-4"
                      )}>
                        {chainMeta[m.chain].short}
                      </span>
                    </td>
                    <td className="num py-3 pr-4 font-semibold">{m.yesPrice}%</td>
                    <td className="num py-3 pr-4 text-muted-foreground">{formatUSDC(m.volume)}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {editing ? (
                        <input
                          type="date"
                          value={editForm.endDate || m.endDate}
                          onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                          className="rounded-lg bg-secondary/60 px-2 py-1 text-xs outline-none [color-scheme:dark]"
                        />
                      ) : (
                        m.endDate
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => handleToggleFeatured(m.id)}
                        className={cn(
                          "rounded-full p-1 transition-colors",
                          m.featured ? "text-chart-4" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Star className={cn("size-4", m.featured && "fill-current")} />
                      </button>
                    </td>
                    <td className="py-3 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {editing ? (
                          <>
                            <button
                              onClick={() => saveEdit(m.id)}
                              className="rounded-lg p-1.5 text-yes hover:bg-yes/10"
                            >
                              <Check className="size-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
                            >
                              <X className="size-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(m)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                              <Edit3 className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(m.id)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-no/10 hover:text-no"
                            >
                              <Trash2 className="size-3.5" />
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
          <p className="p-8 text-center text-sm text-muted-foreground">
            没有匹配的市场
          </p>
        )}
      </div>
    </div>
  )
}
