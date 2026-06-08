"use client"
import { useState, useEffect } from "react"
import { DollarSign, TrendingUp, PieChart, BarChart3, Loader2, Gift, ArrowUpRight } from "lucide-react"
import { formatUSDC } from "@/lib/data"

const API = "https://v0-futurex-production.up.railway.app"

export default function AdminFinancePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("futurex-api-token")
    const h: any = { "Content-Type": "application/json" }
    if (token) h["Authorization"] = `Bearer ${token}`
    fetch(`${API}/api/admin/dashboard`, { headers: h })
      .then(r => r.json())
      .then(d => setData(d.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>

  const s = data || {}
  return (
    <div className="flex flex-col gap-6">
      <div><h1 className="text-2xl font-bold">财务统计</h1><p className="text-sm text-muted-foreground">数据来自 Supabase 实时查询</p></div>
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "总下注额", value: formatUSDC(s.totalVolume||0), icon: BarChart3 },
          { label: "总订单数", value: s.totalOrders||0, icon: PieChart },
          { label: "总用户数", value: s.totalUsers||0, icon: TrendingUp },
          { label: "总市场数", value: s.totalMarkets||0, icon: DollarSign },
        ].map(c => { const I = c.icon; return <div key={c.label} className="flex flex-col gap-2 rounded-2xl glass p-4"><I className="size-5 text-primary" /><p className="num text-2xl font-bold">{c.value}</p><p className="text-xs text-muted-foreground">{c.label}</p></div> })}
      </div>
    </div>
  )
}
