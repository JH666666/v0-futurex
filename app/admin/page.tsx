"use client"

import {
  BarChart3,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  Clock,
} from "lucide-react"
import { getAllMarkets } from "@/lib/market-store"
import { formatUSDC, categoryLabels, chainMeta } from "@/lib/data"
import { leaders } from "@/lib/data"
import { cn } from "@/lib/utils"

const allMarkets = getAllMarkets()

const stats = [
  {
    label: "总市场数",
    value: allMarkets.length,
    icon: BarChart3,
    change: `+${allMarkets.filter((m) => m.featured).length} 精选`,
  },
  {
    label: "总用户数",
    value: "126K",
    icon: Users,
    change: "+2.1K 本周",
  },
  {
    label: "24h 交易量",
    value: "$8.4M",
    icon: DollarSign,
    change: "+12.3%",
  },
  {
    label: "活跃市场",
    value: "1,284",
    icon: Activity,
    change: "+48 今日",
  },
  {
    label: "总锁仓量",
    value: "$42.8M",
    icon: TrendingUp,
    change: "+5.6%",
  },
  {
    label: "待结算市场",
    value: allMarkets.filter((m) => new Date(m.endDate) < new Date()).length,
    icon: Clock,
    change: "需处理",
  },
]

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">管理后台</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          FutureX 平台管理仪表盘 · 实时数据概览
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex flex-col gap-2 rounded-2xl glass p-5">
              <div className="flex items-center justify-between">
                <Icon className="size-5 text-primary" />
                <span className="num text-xs font-semibold text-muted-foreground">
                  {s.change}
                </span>
              </div>
              <p className="num text-2xl font-bold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Recent markets */}
      <div className="rounded-2xl glass p-5">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <Activity className="size-5 text-primary" />
          最近市场动态
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">市场</th>
                <th className="pb-3 pr-4 font-medium">品类</th>
                <th className="pb-3 pr-4 font-medium">链</th>
                <th className="pb-3 pr-4 font-medium num">YES%</th>
                <th className="pb-3 pr-4 font-medium num">成交量</th>
                <th className="pb-3 pr-4 font-medium">截止日期</th>
                <th className="pb-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {allMarkets.slice(0, 10).map((m) => {
                const isExpired = new Date(m.endDate) < new Date()
                return (
                  <tr key={m.id} className="border-b border-border/30">
                    <td className="max-w-[200px] truncate py-3 pr-4 font-medium">
                      {m.question}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{m.category}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {m.chain === "base" ? "Base" : "BSC"}
                      </span>
                    </td>
                    <td className="num py-3 pr-4 font-semibold">{m.yesPrice}%</td>
                    <td className="num py-3 pr-4 text-muted-foreground">
                      {formatUSDC(m.volume)}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{m.endDate}</td>
                    <td className="py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          isExpired
                            ? "bg-no/15 text-no"
                            : "bg-yes/15 text-yes",
                        )}
                      >
                        {isExpired ? "已到期" : "进行中"}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top traders preview */}
      <div className="rounded-2xl glass p-5">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <Users className="size-5 text-primary" />
          顶级交易者
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {leaders.slice(0, 4).map((l) => (
            <div
              key={l.rank}
              className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3"
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  l.rank === 1
                    ? "bg-chart-4 text-background"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                {l.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{l.name}</p>
                <p className="text-xs text-muted-foreground">
                  胜率 {l.accuracy}%
                </p>
              </div>
              <p className="num text-sm font-bold text-yes">
                +{formatUSDC(l.pnl)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
