"use client"

import { useState } from "react"
import { Copy, Check, Gift, Users, Zap, Trophy, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

const seasonRewards = [
  { tier: "青铜", xp: 0, reward: "5 USDC 交易返佣", unlocked: true },
  { tier: "白银", xp: 2500, reward: "10 USDC + 专属徽章", unlocked: true },
  { tier: "黄金", xp: 6000, reward: "50 USDC + 手续费 9 折", unlocked: false },
  { tier: "铂金", xp: 12000, reward: "200 USDC + 早鸟市场权限", unlocked: false },
  { tier: "钻石", xp: 25000, reward: "1000 USDC + 赛季 NFT", unlocked: false },
]

const invited = [
  { name: "0xA12…", xp: 480, status: "活跃" },
  { name: "0xF93…", xp: 1200, status: "活跃" },
  { name: "0x77B…", xp: 90, status: "待激活" },
]

export function ReferralView() {
  const [copied, setCopied] = useState(false)
  const code = "BASE-WC26-7A3F"
  const currentXp = 4280
  const nextTier = 6000

  function copy() {
    navigator.clipboard?.writeText(`https://basepredict.xyz/r/${code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">邀请中心</h1>
        <p className="mt-1 text-sm text-muted-foreground">邀请好友交易，赚取 XP 与赛季奖励。</p>
      </div>

      {/* XP card */}
      <div className="flex flex-col gap-4 rounded-2xl glass-strong p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="size-5 text-chart-4" />
            <span className="font-bold">赛季 XP</span>
          </div>
          <span className="rounded-full bg-chart-4/15 px-3 py-1 text-xs font-semibold text-chart-4">白银会员</span>
        </div>
        <p className="num text-4xl font-bold tracking-tight">{currentXp.toLocaleString()} XP</p>
        <div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(currentXp / nextTier) * 100}%` }} />
          </div>
          <p className="num mt-2 text-xs text-muted-foreground">
            距离黄金会员还需 {(nextTier - currentXp).toLocaleString()} XP
          </p>
        </div>
      </div>

      {/* Invite link */}
      <div className="flex flex-col gap-3 rounded-2xl glass p-5">
        <h2 className="flex items-center gap-2 font-bold">
          <Share2 className="size-5 text-primary" /> 你的邀请链接
        </h2>
        <div className="flex items-center gap-2 rounded-xl bg-secondary/60 px-4 py-3">
          <span className="num min-w-0 flex-1 truncate text-sm">basepredict.xyz/r/{code}</span>
          <button
            onClick={copy}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "已复制" : "复制"}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Stat icon={Users} label="已邀请" value="3" />
          <Stat icon={Gift} label="返佣 USDC" value="$84" />
          <Stat icon={Zap} label="邀请 XP" value="1,770" />
        </div>
      </div>

      {/* Season rewards */}
      <div className="flex flex-col gap-3 rounded-2xl glass p-5">
        <h2 className="flex items-center gap-2 font-bold">
          <Trophy className="size-5 text-chart-4" /> 赛季奖励阶梯
        </h2>
        <div className="flex flex-col gap-2">
          {seasonRewards.map((r) => (
            <div
              key={r.tier}
              className={cn(
                "flex items-center gap-3 rounded-xl p-3",
                r.unlocked ? "bg-yes/10" : "bg-secondary/40",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  r.unlocked ? "bg-yes/20 text-yes" : "bg-secondary text-muted-foreground",
                )}
              >
                {r.unlocked ? <Check className="size-4" /> : <Gift className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{r.tier}</p>
                <p className="truncate text-xs text-muted-foreground">{r.reward}</p>
              </div>
              <span className="num text-xs font-semibold text-muted-foreground">{r.xp.toLocaleString()} XP</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invited friends */}
      <div className="flex flex-col gap-3 rounded-2xl glass p-5">
        <h2 className="flex items-center gap-2 font-bold">
          <Users className="size-5 text-primary" /> 我邀请的好友
        </h2>
        {invited.map((f) => (
          <div key={f.name} className="flex items-center gap-3 border-b border-border/50 py-2.5 last:border-0">
            <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-xs font-bold num">
              {f.name.slice(2, 4)}
            </span>
            <span className="num flex-1 text-sm font-medium">{f.name}</span>
            <span className="num text-xs text-muted-foreground">{f.xp} XP</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                f.status === "活跃" ? "bg-yes/15 text-yes" : "bg-secondary text-muted-foreground",
              )}
            >
              {f.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-secondary/40 p-3">
      <Icon className="size-4 text-primary" />
      <p className="num text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
