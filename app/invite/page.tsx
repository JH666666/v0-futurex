"use client"

import { useState, useEffect } from "react"
import { Gift, Users, Copy, Check, Share2, TrendingUp, Zap, UserPlus } from "lucide-react"
import { formatUSDC } from "@/lib/data"
import { cn } from "@/lib/utils"

const API = "https://v0-futurex-production.up.railway.app"

export default function InvitePage() {
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    // Fetch invite stats
    fetch(`${API}/api/admin/dashboard`).then(r => r.json()).then(d => {
      setStats(d.data)
    }).catch(() => {})
  }, [])

  const code = "FUTUREX-VITALIK"
  const link = `https://futurex.vercel.app/connect?ref=${code}`

  function copyLink() {
    navigator.clipboard?.writeText(link)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const rates = [
    { level: 1, rate: 30, label: "一级返佣", desc: "直接邀请的朋友下注，你获得30%手续费分成" },
    { level: 2, rate: 20, label: "二级返佣", desc: "朋友邀请的朋友下注，你获得20%手续费分成" },
    { level: 3, rate: 10, label: "三级返佣", desc: "再下一级，你获得10%手续费分成" },
    { level: 4, rate: 5, label: "四级返佣", desc: "第四级，你获得5%手续费分成" },
    { level: 5, rate: 5, label: "五级返佣", desc: "第五级，你获得5%手续费分成" },
  ]

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">邀请好友</h1>
        <p className="mt-1 text-sm text-muted-foreground">5级返佣 · 30% / 20% / 10% / 5% / 5%</p>
      </div>

      {/* Invite link */}
      <div className="flex flex-col gap-4 rounded-2xl glass-strong p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-bold"><Share2 className="size-5 text-primary" />你的邀请链接</h2>
        <div className="flex items-center gap-2 rounded-xl bg-secondary/60 px-4 py-3">
          <span className="num min-w-0 flex-1 truncate text-sm font-mono">{code}</span>
          <button onClick={copyLink} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? "已复制" : "复制"}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Gift, label: "邀请码", value: code },
            { icon: Users, label: "总用户数", value: stats?.totalUsers || "-" },
            { icon: TrendingUp, label: "总交易量", value: stats?.totalVolume ? formatUSDC(stats.totalVolume) : "-" },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="flex flex-col gap-1 rounded-xl bg-secondary/40 p-3">
                <Icon className="size-4 text-primary" />
                <p className="num text-lg font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* 返佣等级 */}
      <div className="rounded-2xl glass p-5">
        <h2 className="mb-4 flex items-center gap-2 font-bold"><Zap className="size-5 text-chart-4" />返佣等级</h2>
        <div className="flex flex-col gap-2">
          {rates.map((r, i) => (
            <div key={r.level} className="flex items-center gap-3 rounded-xl p-3 bg-secondary/40">
              <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                i === 0 && "bg-chart-4/20 text-chart-4",
                i === 1 && "bg-primary/20 text-primary",
                i >= 2 && "bg-secondary text-muted-foreground"
              )}>{r.rate}%</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
              <span className="text-xs text-muted-foreground">Lv{r.level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Team Stats */}
      <div className="rounded-2xl glass p-5">
        <h2 className="mb-4 flex items-center gap-2 font-bold"><UserPlus className="size-5 text-primary" />团队数据</h2>
        <p className="text-sm text-muted-foreground text-center py-4">团队数据将在钱包连接后展示</p>
      </div>
    </div>
  )
}
