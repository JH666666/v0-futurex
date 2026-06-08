"use client"

import { useState } from "react"
import { Search, Check, X, AlertTriangle, Clock, DollarSign, ArrowDownUp } from "lucide-react"
import {
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getWithdrawalStats,
  getWithdrawSettings,
  type Withdrawal,
  type WithdrawalStatus,
} from "@/lib/withdrawal-store"
import { chainMeta, formatUSDC } from "@/lib/data"
import { cn } from "@/lib/utils"

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(() => getAllWithdrawals())
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | WithdrawalStatus>("all")
  const [largeOnly, setLargeOnly] = useState(false)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [message, setMessage] = useState("")

  const settings = getWithdrawSettings()
  const stats = getWithdrawalStats()

  const filtered = withdrawals.filter((w) => {
    if (search && !w.userHandle.includes(search.toLowerCase()) && !w.userId.includes(search.toLowerCase()))
      return false
    if (statusFilter !== "all" && w.status !== statusFilter) return false
    if (largeOnly && !w.isLarge) return false
    return true
  })

  function refresh() {
    setWithdrawals(getAllWithdrawals())
  }

  function handleApprove(id: string) {
    const result = approveWithdrawal(id, "admin")
    if ("error" in result) {
      setMessage(result.error)
    } else {
      setMessage(`提现 ${formatUSDC(result.amount)} 已通过`)
    }
    refresh()
    setTimeout(() => setMessage(""), 3000)
  }

  function handleReject(id: string) {
    rejectWithdrawal(id, rejectReason || "管理员拒绝", "admin")
    setRejectingId(null)
    setRejectReason("")
    refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">提现管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            审核用户提现 · 自动阈值: ≤{formatUSDC(settings.autoApproveLimit)}
          </p>
        </div>
        <button onClick={refresh} className="h-10 rounded-full glass px-4 text-sm font-medium hover:bg-accent">
          刷新
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={cn("rounded-xl px-4 py-3 text-sm font-medium", message.includes("通过") ? "bg-yes/10 text-yes" : "bg-no/10 text-no")}>
          {message}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "待审核提现", value: stats.pending, sub: formatUSDC(stats.totalPendingAmount), icon: Clock, color: "text-chart-4" },
          { label: "已通过/到账", value: stats.approved, sub: formatUSDC(stats.totalApprovedAmount), icon: Check, color: "text-yes" },
          { label: "已拒绝", value: stats.rejected, sub: formatUSDC(stats.totalRejectedAmount), icon: X, color: "text-no" },
          { label: "手续费收入", value: formatUSDC(stats.totalFees), icon: DollarSign },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex flex-col gap-2 rounded-2xl glass p-4">
              <Icon className={cn("size-5", s.color)} />
              <p className="num text-2xl font-bold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label} · {s.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索用户..."
            className="h-11 w-full rounded-full glass pl-10 pr-4 text-sm outline-none"
          />
        </div>
        {(["PENDING", "APPROVED", "PAID", "REJECTED", "all"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "h-9 rounded-full px-4 text-sm font-medium transition-colors",
              statusFilter === s ? "bg-primary text-primary-foreground" : "glass text-muted-foreground",
            )}
          >
            {s === "all" ? "全部" : s === "PENDING" ? "待审核" : s === "APPROVED" ? "已通过" : s === "PAID" ? "已到账" : "已拒绝"}
          </button>
        ))}
        <button
          onClick={() => setLargeOnly(!largeOnly)}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors",
            largeOnly ? "bg-no text-no-foreground" : "glass text-muted-foreground",
          )}
        >
          <AlertTriangle className="size-3.5" /> 仅大额
        </button>
        <span className="text-xs text-muted-foreground">
          自动阈值: ≤{formatUSDC(settings.autoApproveLimit)}
        </span>
      </div>

      {/* Withdrawal list */}
      <div className="flex flex-col gap-3">
        {filtered.map((w) => (
          <div
            key={w.id}
            className={cn(
              "flex flex-col gap-4 rounded-2xl glass p-5",
              w.isLarge && w.status === "PENDING" && "ring-1 ring-no/30",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {w.isLarge && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-no/15 px-2 py-0.5 text-[10px] font-bold text-no">
                      <AlertTriangle className="size-3" /> 大额
                    </span>
                  )}
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium",
                    w.chain === "base" ? "bg-primary/10 text-primary" : "bg-chart-4/10 text-chart-4",
                  )}>{chainMeta[w.chain].short}</span>
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    w.status === "PENDING" && "bg-chart-4/15 text-chart-4",
                    w.status === "APPROVED" && "bg-yes/15 text-yes",
                    w.status === "PAID" && "bg-yes/15 text-yes",
                    w.status === "REJECTED" && "bg-no/15 text-no",
                  )}>
                    {w.status === "PENDING" ? <Clock className="size-3" /> : w.status === "REJECTED" ? <X className="size-3" /> : <Check className="size-3" />}
                    {w.status === "PENDING" ? "待审核" : w.status === "APPROVED" ? "已通过" : w.status === "PAID" ? "已到账" : "已拒绝"}
                  </span>
                </div>

                <p className="num text-2xl font-bold tracking-tight">{formatUSDC(w.netAmount)} {w.token}</p>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>用户: {w.userHandle}</span>
                  <span>手续费: ${w.fee}</span>
                  <span>申请: {new Date(w.requestedAt).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="font-mono text-[10px]">到: {w.toAddress.slice(0, 14)}...</span>
                </div>

                {w.reviewedAt && (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {w.status === "PAID" ? "到账" : "审核"}时间: {new Date(w.reviewedAt).toLocaleString("zh-CN")} · 审核人: {w.reviewedBy}
                  </p>
                )}
                {w.status === "REJECTED" && w.rejectReason && (
                  <p className="mt-1 text-sm text-no">拒绝原因: {w.rejectReason}</p>
                )}
              </div>

              {w.status === "PENDING" && (
                <div className="flex shrink-0 items-center gap-2">
                  <button onClick={() => handleApprove(w.id)} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-yes px-3 text-sm font-semibold text-yes-foreground hover:bg-yes/90">
                    <Check className="size-4" /> 通过
                  </button>
                  <button onClick={() => { setRejectingId(w.id); setRejectReason("") }} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-no/15 px-3 text-sm font-semibold text-no hover:bg-no/25">
                    <X className="size-4" /> 拒绝
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">暂无提现记录</p>
        )}
      </div>

      {/* Reject modal */}
      {rejectingId && (
        <>
          <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm" onClick={() => setRejectingId(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl glass-strong p-6">
              <h3 className="mb-4 text-lg font-bold">拒绝提现</h3>
              <label className="mb-2 block text-sm text-muted-foreground">拒绝原因</label>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} placeholder="填写拒绝原因..." className="w-full resize-none rounded-xl bg-secondary/60 px-4 py-3 text-sm outline-none" />
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setRejectingId(null)} className="h-10 rounded-xl glass px-4 text-sm">取消</button>
                <button onClick={() => handleReject(rejectingId)} className="h-10 rounded-xl bg-no px-4 text-sm font-semibold text-no-foreground">确认拒绝</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
