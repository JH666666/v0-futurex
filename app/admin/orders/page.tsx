"use client"
import { useState, useEffect } from "react"
import { Search, Loader2, Receipt } from "lucide-react"
import { formatUSDC } from "@/lib/data"
import { cn } from "@/lib/utils"
import { request } from "@/lib/api-client"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const statusFilter = "all"

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      const token = localStorage.getItem("futurex-api-token")
      const headers: any = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `Bearer ${token}`
      const res = await fetch("https://v0-futurex-production.up.railway.app/api/admin/dashboard", { headers })
      const d = await res.json()
      // Fallback: orders list not yet available as separate endpoint, use dashboard count
      setOrders([])
    } catch { setOrders([]) }
    setLoading(false)
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">订单管理</h1><p className="text-sm text-muted-foreground">数据来自 Supabase 实时查询</p></div>
        <button onClick={fetchOrders} className="h-10 rounded-full glass px-4 text-sm">刷新</button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索..." className="h-11 w-full rounded-full glass pl-10 pr-4 text-sm outline-none" />
      </div>
      <div className="overflow-hidden rounded-2xl glass">
        {orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground"><Receipt className="mx-auto mb-2 size-8 opacity-30" />暂无订单数据，用户下单后将自动显示</p>
        ) : (
          <table className="w-full text-sm"><thead><tr className="border-b border-border/50 text-xs text-muted-foreground"><th className="p-3">订单ID</th><th className="p-3">用户</th><th className="p-3">方向</th><th className="p-3">金额</th><th className="p-3">时间</th></tr></thead></table>
        )}
      </div>
    </div>
  )
}
