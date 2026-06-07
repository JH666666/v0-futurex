import { Activity, Users, DollarSign, TrendingUp } from "lucide-react"

const stats = [
  { label: "24h 交易量", value: "$8.4M", icon: DollarSign, change: "+12.3%" },
  { label: "活跃市场", value: "1,284", icon: Activity, change: "+48" },
  { label: "总用户", value: "126K", icon: Users, change: "+2.1K" },
  { label: "平台总锁仓", value: "$42.8M", icon: TrendingUp, change: "+5.6%" },
]

export function StatsDashboard() {
  return (
    <section>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex flex-col gap-2 rounded-2xl glass p-4">
              <div className="flex items-center justify-between">
                <Icon className="size-5 text-primary" />
                <span className="num text-xs font-semibold text-yes">{s.change}</span>
              </div>
              <p className="num text-2xl font-bold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
