"use client"

import { useState } from "react"
import { Search, Filter, X, Receipt } from "lucide-react"
import { getAllOrders, type Order, type OrderStatus } from "@/lib/betting-store"
import { chainMeta, formatUSDC } from "@/lib/data"
import { cn } from "@/lib/utils"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(() => getAllOrders())
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all")
  const [sideFilter, setSideFilter] = useState<"all" | "YES" | "NO">("all")

  const filtered = orders.filter((o) => {
    if (search && !o.marketQuestion.toLowerCase().includes(search.toLowerCase()) && !o.userId.toLowerCase().includes(search.toLowerCase()))
      return false
    if (statusFilter !== "all" && o.status !== statusFilter) return false
    if (sideFilter !== "all" && o.side !== sideFilter) return false
    return true
  })

  function refresh() {
    setOrders(getAllOrders())
  }

  const totalAmount = orders.filter((o) => o.status === "filled").reduce((s, o) => s + o.amount, 0)
  const totalOrders = orders.length
  const filledOrders = orders.filter((o) => o.status === "filled").length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">订单管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            查看所有用户下注订单 · 与持仓数据同步
          </p>
        </div>
        <button onClick={refresh} className="h-10 rounded-full glass px-4 text-sm font-medium hover:bg-accent">
          刷新数据
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "总订单数", value: totalOrders },
          { label: "已成交", value: filledOrders },
          { label: "成交总额", value: formatUSDC(totalAmount) },
        ].map((s) => (
          <div key={s.label} className="flex flex-col gap-1 rounded-2xl glass p-4">
            <p className="num text-2xl font-bold tracking-tight">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索市场或用户..."
            className="h-11 w-full rounded-full glass pl-10 pr-4 text-sm outline-none"
          />
        </div>
        {(["all", "filled", "cancelled"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "h-9 rounded-full px-4 text-sm font-medium transition-colors",
              statusFilter === s ? "bg-primary text-primary-foreground" : "glass text-muted-foreground",
            )}
          >
            {s === "all" ? "全部状态" : s === "filled" ? "已成交" : "已取消"}
          </button>
        ))}
        {(["all", "YES", "NO"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSideFilter(s)}
            className={cn(
              "h-9 rounded-full px-4 text-sm font-medium transition-colors",
              sideFilter === s ? "bg-primary text-primary-foreground" : "glass text-muted-foreground",
            )}
          >
            {s === "all" ? "全部方向" : s}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="overflow-hidden rounded-2xl glass">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                <th className="pb-3 pl-5 pr-4 font-medium">订单ID</th>
                <th className="pb-3 pr-4 font-medium">市场</th>
                <th className="pb-3 pr-4 font-medium">用户</th>
                <th className="pb-3 pr-4 font-medium">方向</th>
                <th className="pb-3 pr-4 font-medium num">金额</th>
                <th className="pb-3 pr-4 font-medium num">价格</th>
                <th className="pb-3 pr-4 font-medium num">份额</th>
                <th className="pb-3 pr-4 font-medium">状态</th>
                <th className="pb-3 pr-5 font-medium">时间</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-border/30">
                  <td className="py-3 pl-5 pr-4 font-mono text-[10px] text-muted-foreground max-w-[120px] truncate" title={o.id}>
                    {o.id}
                  </td>
                  <td className="py-3 pr-4 max-w-[180px] truncate">
                    <span className="text-sm">{o.marketQuestion}</span>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs">{o.userId}</td>
                  <td className="py-3 pr-4">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-bold",
                      o.side === "YES" ? "bg-yes/15 text-yes" : "bg-no/15 text-no",
                    )}>{o.side}</span>
                  </td>
                  <td className="num py-3 pr-4 font-semibold">${o.amount}</td>
                  <td className="num py-3 pr-4">{o.price}¢</td>
                  <td className="num py-3 pr-4">{o.shares.toFixed(1)}</td>
                  <td className="py-3 pr-4">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      o.status === "filled" ? "bg-yes/15 text-yes" : "bg-no/15 text-no",
                    )}>
                      {o.status === "filled" ? "已成交" : "已取消"}
                    </span>
                  </td>
                  <td className="py-3 pr-5 text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            <Receipt className="mx-auto mb-2 size-8 opacity-30" />
            暂无订单数据。用户下注后这里会显示。
          </div>
        )}
      </div>
    </div>
  )
}
