"use client"

import { useState } from "react"
import { Search, Gift, Users, Zap, Trophy, TrendingUp, Layers } from "lucide-react"
import {
  getAllRelations,
  getAllCommissions,
  getCommissionStats,
  addReferral,
  getTeamStats,
  COMMISSION_RATES,
  type ReferralRelation,
  type CommissionRecord,
} from "@/lib/referral-store"
import { formatUSDC } from "@/lib/data"
import { cn } from "@/lib/utils"

export default function AdminReferralsPage() {
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"relations" | "commissions">("relations")
  const [showAdd, setShowAdd] = useState(false)
  const [newUserId, setNewUserId] = useState("")
  const [newInviterId, setNewInviterId] = useState("")
  const [msg, setMsg] = useState("")

  const relations = getAllRelations()
  const commissions = getAllCommissions()
  const stats = getCommissionStats()
  const commStats = getCommissionStats()

  // 团队排行（按总返佣）
  const teamRanking = [...new Set(relations.map((r) => r.inviterId))]
    .map((id) => {
      const ts = getTeamStats(id)
      const handle = relations.find((r) => r.inviterId === id)?.inviterHandle || id
      return { userId: id, handle, ...ts }
    })
    .sort((a, b) => b.totalCommission - a.totalCommission)

  function handleAdd() {
    if (!newUserId.trim() || !newInviterId.trim()) return
    const result = addReferral(newUserId.trim(), newUserId.trim(), newInviterId.trim(), newInviterId.trim())
    if ("error" in result) {
      setMsg(result.error)
    } else {
      setMsg(`邀请关系已添加: ${newInviterId} → ${newUserId}`)
      setNewUserId("")
      setNewInviterId("")
      setShowAdd(false)
    }
    setTimeout(() => setMsg(""), 3000)
  }

  const filteredCommissions = commissions.filter((c) => {
    if (!search) return true
    return c.fromUserHandle.includes(search) || c.toUserHandle.includes(search)
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">邀请管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            5 级返佣 · 30% / 20% / 10% / 5% / 5%
          </p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="h-10 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">
          {showAdd ? "取消" : "+ 添加关系"}
        </button>
      </div>

      {msg && (
        <div className={cn("rounded-xl px-4 py-3 text-sm font-medium", msg.includes("错误") || msg.includes("已有") ? "bg-no/10 text-no" : "bg-yes/10 text-yes")}>
          {msg}
        </div>
      )}

      {/* 添加关系表单 */}
      {showAdd && (
        <div className="flex flex-wrap items-end gap-3 rounded-2xl glass p-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">被邀请人 ID</label>
            <input value={newUserId} onChange={(e) => setNewUserId(e.target.value)} placeholder="newbie.base" className="h-10 rounded-xl bg-secondary/60 px-3 text-sm outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">邀请人 ID</label>
            <input value={newInviterId} onChange={(e) => setNewInviterId(e.target.value)} placeholder="vitalik.base" className="h-10 rounded-xl bg-secondary/60 px-3 text-sm outline-none" />
          </div>
          <button onClick={handleAdd} className="h-10 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground">确认添加</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-5">
        {[
          { label: "邀请关系", value: relations.length, icon: Users },
          { label: "返佣总笔数", value: stats.total, icon: Gift },
          { label: "返佣总额", value: formatUSDC(stats.totalAmount), icon: Trophy },
          { label: "团队数", value: teamRanking.length, icon: Layers },
          { label: "5级返佣率", value: "30/20/10/5/5%", icon: TrendingUp },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex flex-col gap-2 rounded-2xl glass p-4">
              <Icon className="size-5 text-primary" />
              <p className="num text-2xl font-bold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* 返佣层级明细 */}
      <div className="grid gap-3 sm:grid-cols-5">
        {commStats.byLevel.map((l) => (
          <div key={l.level} className="flex flex-col gap-2 rounded-2xl glass p-4 text-center">
            <span className="text-[10px] text-muted-foreground">第 {l.level} 级</span>
            <span className="num text-2xl font-bold">{l.rate}%</span>
            <span className="text-xs text-muted-foreground">{l.count} 笔 · {formatUSDC(l.total)}</span>
          </div>
        ))}
      </div>

      {/* 团队返佣排行 */}
      <div className="rounded-2xl glass p-5">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <Trophy className="size-5 text-chart-4" />
          团队返佣排行
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {teamRanking.slice(0, 6).map((t, i) => (
            <div key={t.userId} className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3">
              <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                i === 0 ? "bg-chart-4 text-background" : "bg-secondary text-muted-foreground",
              )}>{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t.handle}</p>
                <p className="text-xs text-muted-foreground">
                  团队 {t.teamSize} 人 · 直接 {t.directInvites} 人
                </p>
              </div>
              <p className="num text-sm font-bold text-yes">{formatUSDC(t.totalCommission)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["relations", "commissions"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn(
            "h-9 rounded-full px-4 text-sm font-medium transition-colors",
            tab === t ? "bg-primary text-primary-foreground" : "glass text-muted-foreground",
          )}>
            {t === "relations" ? `邀请关系 (${relations.length})` : `返佣记录 (${commissions.length})`}
          </button>
        ))}
        <div className="relative ml-auto max-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索..." className="h-9 w-full rounded-full glass pl-9 pr-3 text-xs outline-none" />
        </div>
      </div>

      {/* Relations table */}
      {tab === "relations" && (
        <div className="overflow-hidden rounded-2xl glass">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                  <th className="pb-3 pl-5 pr-4">被邀请人</th>
                  <th className="pb-3 pr-4">邀请人</th>
                  <th className="pb-3 pr-4">层级</th>
                  <th className="pb-3 pr-4">邀请时间</th>
                </tr>
              </thead>
              <tbody>
                {relations.map((r, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="py-3 pl-5 pr-4 font-medium">{r.userHandle}</td>
                    <td className="py-3 pr-4">{r.inviterHandle}</td>
                    <td className="py-3 pr-4"><span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">第 {r.level} 级</span></td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Commissions table */}
      {tab === "commissions" && (
        <div className="overflow-hidden rounded-2xl glass">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                  <th className="pb-3 pl-5 pr-4">下注人</th>
                  <th className="pb-3 pr-4">获得返佣</th>
                  <th className="pb-3 pr-4">层级</th>
                  <th className="pb-3 pr-4 num">下注额</th>
                  <th className="pb-3 pr-4 num">返佣</th>
                  <th className="pb-3 pr-4 max-w-[160px]">市场</th>
                  <th className="pb-3">时间</th>
                </tr>
              </thead>
              <tbody>
                {filteredCommissions.map((c) => (
                  <tr key={c.id} className="border-b border-border/30">
                    <td className="py-3 pl-5 pr-4 font-medium">{c.fromUserHandle}</td>
                    <td className="py-3 pr-4 text-yes font-medium">{c.toUserHandle}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{c.level}级·{c.rate}%</span>
                    </td>
                    <td className="num py-3 pr-4">{formatUSDC(c.betAmount)}</td>
                    <td className="num py-3 pr-4 font-bold text-yes">{formatUSDC(c.commissionAmount)}</td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground max-w-[160px] truncate">{c.marketQuestion}</td>
                    <td className="py-3 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredCommissions.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">暂无返佣记录。用户下注后自动计算。</p>
          )}
        </div>
      )}
    </div>
  )
}
