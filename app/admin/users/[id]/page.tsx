"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, User, TrendingUp, Shield, Clock, AlertTriangle, Gift, History } from "lucide-react"
import { getAdminUserDetail, reviewUserKyc, updateUserRisk } from "@/lib/api-client"
import { formatUSDC } from "@/lib/data"
import { cn } from "@/lib/utils"

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<any>(null)
  const [tab, setTab] = useState<"profile" | "logs">("profile")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminUserDetail(id).then((res) => { setData(res.data); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  if (!data) return <div className="p-10 text-center text-muted-foreground">用户不存在</div>

  const { user, logs } = data

  async function handleKyc(status: "APPROVED" | "REJECTED") {
    await reviewUserKyc(id, status)
    const res = await getAdminUserDetail(id)
    setData(res.data)
  }

  async function handleRisk(level: string, reason: string) {
    await updateUserRisk(id, level, reason)
    const res = await getAdminUserDetail(id)
    setData(res.data)
  }

  return (
    <div className="flex flex-col gap-6">
      <a href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回用户列表
      </a>

      <div className="flex items-center gap-4 rounded-2xl glass-strong p-6">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/20 text-xl font-bold text-primary">{user.nickname?.slice(0, 2).toUpperCase() || "??"}</span>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{user.nickname}</h1>
          <p className="font-mono text-xs text-muted-foreground">{user.walletAddress}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium",
              user.kyc?.status === "APPROVED" ? "bg-yes/15 text-yes" : user.kyc?.status === "PENDING" ? "bg-chart-4/15 text-chart-4" : "bg-secondary text-muted-foreground"
            )}>{user.kyc?.status === "APPROVED" ? "KYC ✓" : user.kyc?.status === "PENDING" ? "KYC 待审" : "未认证"}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium",
              user.risk?.level === "normal" && "bg-yes/15 text-yes",
              user.risk?.level === "high_risk" && "bg-chart-4/15 text-chart-4",
              user.risk?.level === "blacklist" && "bg-no/15 text-no",
            )}>风控: {user.risk?.level === "normal" ? "正常" : user.risk?.level === "high_risk" ? "高风险" : user.risk?.level || "正常"}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold num">{formatUSDC(user.balance)}</p>
          <p className="text-xs text-muted-foreground">可用余额 (冻结 {formatUSDC(user.frozenBalance)})</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "累计下注", value: formatUSDC(user.totalBetAmount), icon: TrendingUp },
          { label: "累计盈利", value: formatUSDC(user.totalEarned), icon: Gift, color: "text-yes" },
          { label: "邀请人数", value: user.totalInvites, icon: User },
          { label: "注册时间", value: new Date(user.createdAt).toLocaleDateString("zh-CN"), icon: Clock },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex flex-col gap-1.5 rounded-2xl glass p-4">
              <Icon className={cn("size-4", s.color || "text-primary")} />
              <p className="num text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* KYC Info */}
      {user.kyc?.status === "PENDING" && (
        <div className="flex items-center justify-between rounded-2xl glass p-4 ring-1 ring-chart-4/30">
          <div>
            <p className="font-bold text-chart-4">KYC 待审核</p>
            <p className="text-sm text-muted-foreground">{user.kyc.name} · {user.kyc.country} · {user.kyc.idNumber}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleKyc("APPROVED")} className="h-9 rounded-lg bg-yes px-4 text-xs font-semibold text-yes-foreground">通过</button>
            <button onClick={() => handleKyc("REJECTED")} className="h-9 rounded-lg bg-no/15 px-4 text-xs font-semibold text-no">拒绝</button>
          </div>
        </div>
      )}

      {/* Risk */}
      <div className="rounded-2xl glass p-5">
        <h2 className="mb-3 flex items-center gap-2 font-bold"><Shield className="size-5 text-primary" />风控操作</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { level: "normal", label: "正常", color: "bg-yes/10 text-yes" },
            { level: "high_risk", label: "高风险", color: "bg-chart-4/10 text-chart-4" },
            { level: "restrict_withdraw", label: "限制提现", color: "bg-no/10 text-no" },
            { level: "ban_betting", label: "禁止下注", color: "bg-no/10 text-no" },
            { level: "blacklist", label: "黑名单", color: "bg-no/15 text-no font-bold" },
          ].map((r) => (
            <button key={r.level} onClick={() => handleRisk(r.level, `管理员手动设置: ${r.label}`)} className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors", user.risk?.level === r.level ? r.color + " ring-1" : "glass text-muted-foreground")}>
              {r.label}
            </button>
          ))}
        </div>
        {user.risk?.reason && <p className="mt-2 text-xs text-muted-foreground">当前原因: {user.risk.reason} · {user.risk.taggedAt && new Date(user.risk.taggedAt).toLocaleString("zh-CN")}</p>}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["profile", "logs"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("h-9 rounded-full px-4 text-sm font-medium", tab === t ? "bg-primary text-primary-foreground" : "glass text-muted-foreground")}>
            {t === "profile" ? "详细资料" : "行为日志"}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "UID", value: user.id },
            { label: "等级", value: `LV${user.level}` },
            { label: "邀请码", value: user.referralCode },
            { label: "推荐人", value: user.referredBy || "无" },
            { label: "累计提现", value: formatUSDC(user.totalWithdrawn) },
            { label: "团队业绩", value: formatUSDC(user.teamVolume) },
            { label: "角色", value: user.role },
            { label: "状态", value: user.status },
          ].map((f) => (
            <div key={f.label} className="flex justify-between rounded-xl bg-secondary/40 px-4 py-3">
              <span className="text-sm text-muted-foreground">{f.label}</span>
              <span className="text-sm font-semibold">{f.value}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "logs" && (
        <div className="flex flex-col gap-2 rounded-2xl glass p-5">
          {logs.map((l: any) => (
            <div key={l.id} className="flex items-center gap-3 border-b border-border/30 py-2.5 text-sm">
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium",
                l.type === "bet" && "bg-yes/10 text-yes",
                l.type === "withdraw" && "bg-no/10 text-no",
                l.type === "settlement" && "bg-chart-4/10 text-chart-4",
                l.type === "kyc" && "bg-primary/10 text-primary",
              )}>{l.type}</span>
              <span className="flex-1">{l.detail}</span>
              {l.amount && <span className="num text-xs font-semibold">{formatUSDC(l.amount)}</span>}
              <span className="text-xs text-muted-foreground">{new Date(l.createdAt).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
