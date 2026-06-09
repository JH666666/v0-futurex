"use client"
import { useState, useEffect } from "react"
import { Search, Gift, Users, Zap, Trophy, TrendingUp, Layers, Loader2 } from "lucide-react"
import { formatUSDC } from "@/lib/data"
import { cn } from "@/lib/utils"

const API = "https://v0-futurex-production.up.railway.app"

export default function AdminReferralsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/admin/dashboard`).then(r => r.json()).then(d => {
      setStats(d.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>

  const rates = [
    { level: 1, rate: 30, color: "text-chart-4" },
    { level: 2, rate: 20, color: "text-primary" },
    { level: 3, rate: 10, color: "text-muted-foreground" },
    { level: 4, rate: 5, color: "text-muted-foreground" },
    { level: 5, rate: 5, color: "text-muted-foreground" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">邀请管理</h1>
        <p className="text-sm text-muted-foreground">5级返佣 · 30% / 20% / 10% / 5% / 5% · 数据来自 Supabase</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        {[
          { label: "总用户数", value: stats?.totalUsers || 0, icon: Users },
          { label: "总订单数", value: stats?.totalOrders || 0, icon: Zap },
          { label: "总交易量", value: formatUSDC(stats?.totalVolume || 0), icon: TrendingUp },
          { label: "总市场", value: stats?.totalMarkets || 0, icon: Layers },
          { label: "返佣等级", value: "5级", icon: Trophy },
        ].map(s => {
          const I = s.icon
          return (
            <div key={s.label} className="flex flex-col gap-2 rounded-2xl glass p-4">
              <I className="size-5 text-primary" />
              <p className="num text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* 返佣等级表 */}
      <div className="grid gap-3 sm:grid-cols-5">
        {rates.map((r, i) => (
          <div key={r.level} className="flex flex-col items-center gap-2 rounded-2xl glass p-4 text-center">
            <span className="text-xs text-muted-foreground">第{r.level}级</span>
            <span className={cn("num text-3xl font-bold", r.color)}>{r.rate}%</span>
            <span className="text-xs text-muted-foreground">返佣比例</span>
          </div>
        ))}
      </div>

      {/* 下注即触发返佣 */}
      <div className="rounded-2xl glass p-5">
        <h2 className="mb-3 flex items-center gap-2 font-bold"><Gift className="size-5 text-primary" />返佣说明</h2>
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <div className="rounded-xl bg-secondary/40 p-4">
            <p className="font-semibold text-foreground">如何计算</p>
            <p className="mt-1">用户每次下注，平台收取2.5%手续费。手续费的70%分给5级上级。</p>
            <p className="mt-2 text-xs">例：用户下注$100 → 手续费$2.50 → 返佣池$1.75 → L1得$0.75, L2得$0.50, L3得$0.25, L4得$0.125, L5得$0.125</p>
          </div>
          <div className="rounded-xl bg-secondary/40 p-4">
            <p className="font-semibold text-foreground">数据来源</p>
            <p className="mt-1">所有邀请关系和返佣记录存储在Supabase的referrals和commissions表中。用户下注时自动计算并写入。</p>
          </div>
        </div>
      </div>
    </div>
  )
}
