"use client"

import { useState, useEffect } from "react"
import { BarChart3, Users, DollarSign, Activity, TrendingUp, Clock, Loader2 } from "lucide-react"
import { getDashboardStats } from "@/lib/api-client"
import { formatUSDC } from "@/lib/data"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>

  const cards = stats ? [
    { label: "总市场数", value: stats.totalMarkets, icon: BarChart3, change: "Supabase" },
    { label: "总用户数", value: stats.totalUsers, icon: Users, change: "Supabase" },
    { label: "总订单数", value: stats.totalOrders, icon: Activity, change: "已成交" },
    { label: "总交易量", value: formatUSDC(stats.totalVolume), icon: TrendingUp, change: "USDC" },
  ] : [
    { label: "数据加载失败", value: "-", icon: Clock, change: "请检查后端连接" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">管理后台</h1>
        <p className="mt-1 text-sm text-muted-foreground">FutureX 平台管理仪表盘 · 数据来自 Supabase 实时查询</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex flex-col gap-2 rounded-2xl glass p-5">
              <Icon className="size-5 text-primary" />
              <p className="num text-2xl font-bold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label} · {s.change}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
