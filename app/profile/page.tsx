"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Award, TrendingUp, Users, Clock, Copy, Check, Zap, Gift, UserPlus, Wallet } from "lucide-react"
import { getUserFullProfile, getUserActivities, getLevelConfig } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { formatUSDC } from "@/lib/data"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const { user, connectMock, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [levels, setLevels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"overview" | "activity">("overview")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    Promise.all([
      getUserFullProfile(),
      getUserActivities(),
      getLevelConfig(),
    ]).then(([p, a, l]) => {
      setProfile(p.data || { ...user, referralCode: user.walletAddress?.slice(2,10).toUpperCase(), totalInvites: 0, teamVolume: 0, totalEarned: 0 })
      setLogs(a.data?.logs || [])
      setLevels(l.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user])

  function copyCode() {
    const code = profile?.referralCode || user?.walletAddress?.slice(2,10).toUpperCase()
    navigator.clipboard?.writeText(`https://futurex.vercel.app/invite?code=${code}`)
    setCopied(true); setTimeout(() => setCopied(false), 1800)
  }

  if (authLoading || loading) return <div className="flex justify-center py-20"><div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>

  if (!user) return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-20 text-center">
      <Wallet className="size-16 text-muted-foreground" />
      <h2 className="text-xl font-bold">请连接钱包</h2>
      <p className="text-sm text-muted-foreground">FutureX 使用 Web3 钱包身份，连接钱包后自动显示你的个人资料</p>
      <Link href="/connect" className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground">
        <Wallet className="size-4" />连接钱包
      </Link>
    </div>
  )

  const levelInfo = levels.find((l: any) => l.level === profile.level)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center gap-4 rounded-2xl glass-strong p-6">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
          {profile.nickname.slice(0, 2).toUpperCase()}
        </span>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{profile.nickname}</h1>
          <p className="text-sm text-muted-foreground font-mono">{profile.walletAddress.slice(0, 14)}...</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold",
              levelInfo?.level === 5 ? "bg-chart-4/20 text-chart-4" :
              levelInfo?.level === 4 ? "bg-primary/20 text-primary" :
              "bg-secondary text-muted-foreground"
            )}>{levelInfo?.name || "青铜"}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium",
              profile.kyc.status === "APPROVED" ? "bg-yes/15 text-yes" : profile.kyc.status === "PENDING" ? "bg-chart-4/15 text-chart-4" : "bg-secondary text-muted-foreground"
            )}>{profile.kyc.status === "APPROVED" ? "✓ KYC" : profile.kyc.status === "PENDING" ? "KYC 审核中" : "未认证"}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold num">{formatUSDC(profile.balance)}</p>
          <p className="text-xs text-muted-foreground">可用余额</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "累计下注", value: formatUSDC(profile.totalBetAmount), icon: TrendingUp },
          { label: "累计盈利", value: formatUSDC(profile.totalEarned), icon: Award, color: "text-yes" },
          { label: "邀请人数", value: profile.totalInvites, icon: Users },
          { label: "注册时间", value: new Date(profile.createdAt).toLocaleDateString("zh-CN"), icon: Clock },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex flex-col gap-1.5 rounded-2xl glass p-4">
              <Icon className={cn("size-4", s.color || "text-primary")} />
              <p className="num text-xl font-bold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Invite */}
      <div className="flex items-center justify-between rounded-2xl glass p-4">
        <div>
          <p className="text-xs text-muted-foreground">邀请链接</p>
          <p className="font-mono text-sm">futurex.xyz/r/{profile.referralCode}</p>
        </div>
        <button onClick={copyCode} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? "已复制" : "复制"}
        </button>
      </div>

      {/* Level progress */}
      <div className="rounded-2xl glass p-5">
        <h2 className="mb-3 flex items-center gap-2 font-bold"><Zap className="size-5 text-chart-4" />等级进度</h2>
        <div className="flex flex-col gap-2">
          {levels.map((l: any) => {
            const achieved = profile.level >= l.level
            return (
              <div key={l.level} className={cn("flex items-center gap-3 rounded-xl p-3", achieved ? "bg-chart-4/10" : "bg-secondary/30 opacity-60")}>
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold", achieved ? "bg-chart-4/20 text-chart-4" : "bg-secondary text-muted-foreground")}>{l.level}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{l.name}</p>
                  <p className="text-[10px] text-muted-foreground">下注 ≥{formatUSDC(l.minBetAmount)} · 邀请 ≥{l.minInvites}人 · 团队 ≥{formatUSDC(l.minTeamVolume)}</p>
                </div>
                {achieved && <Check className="size-4 text-yes shrink-0" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["overview", "activity"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("h-9 rounded-full px-4 text-sm font-medium", tab === t ? "bg-primary text-primary-foreground" : "glass text-muted-foreground")}>
            {t === "overview" ? "基本资料" : "行为日志"}
          </button>
        ))}
      </div>

      {/* Team / Referral Stats */}
      <div className="rounded-2xl glass p-5">
        <h2 className="mb-3 flex items-center gap-2 font-bold"><UserPlus className="size-5 text-primary" />我的团队</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "邀请码", value: profile.referralCode, icon: Gift },
            { label: "邀请人数", value: profile.totalInvites || 0, icon: Users },
            { label: "团队业绩", value: formatUSDC(profile.teamVolume || 0), icon: TrendingUp },
            { label: "累计返佣", value: formatUSDC(profile.totalEarned || 0), icon: Award, color: "text-yes" },
          ].map(s => {
            const I = s.icon
            return (
              <div key={s.label} className="flex flex-col gap-1.5 rounded-xl bg-secondary/40 p-3">
                <I className={cn("size-4", s.color || "text-primary")} />
                <p className="num text-lg font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {tab === "overview" && (
        <div className="flex flex-col gap-3 rounded-2xl glass p-5">
          {[
            { label: "UID", value: profile.id },
            { label: "钱包地址", value: profile.walletAddress, mono: true },
            { label: "昵称", value: profile.nickname },
            { label: "邀请码", value: profile.referralCode },
            { label: "冻结金额", value: formatUSDC(profile.frozenBalance) },
            { label: "累计提现", value: formatUSDC(profile.totalWithdrawn) },
            { label: "团队业绩", value: formatUSDC(profile.teamVolume) },
            { label: "风控等级", value: profile.risk.level === "normal" ? "正常" : profile.risk.level, color: profile.risk.level !== "normal" ? "text-no" : "" },
          ].map((f) => (
            <div key={f.label} className="flex justify-between border-b border-border/30 py-2 text-sm">
              <span className="text-muted-foreground">{f.label}</span>
              <span className={cn("font-medium", f.mono && "font-mono text-xs", f.color)}>{f.value}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "activity" && (
        <div className="flex flex-col gap-2 rounded-2xl glass p-5">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">暂无活动记录</p>
          ) : logs.map((l: any) => (
            <div key={l.id} className="flex items-center gap-3 border-b border-border/30 py-2.5 text-sm">
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium",
                l.type === "bet" && "bg-yes/10 text-yes",
                l.type === "withdraw" && "bg-no/10 text-no",
                l.type === "settlement" && "bg-chart-4/10 text-chart-4",
                l.type === "kyc" && "bg-primary/10 text-primary",
                l.type === "login" && "bg-secondary text-muted-foreground",
                l.type === "invite" && "bg-chart-2/10 text-chart-2",
              )}>{l.type === "bet" ? "下注" : l.type === "withdraw" ? "提现" : l.type === "settlement" ? "结算" : l.type === "kyc" ? "KYC" : l.type === "invite" ? "邀请" : "登录"}</span>
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
