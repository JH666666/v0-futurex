"use client"

import { useState, useEffect } from "react"
import { Search, Check, X, Eye, Clock, MessageSquare } from "lucide-react"
import {
  categoryLabels,
  chainMeta,
  type Category,
  type Chain,
} from "@/lib/data"
import {
  getPendingMarkets,
  getApprovedMarkets,
  getRejectedMarkets,
  approveMarket,
  rejectMarket,
  getReviewStats,
  type StoreMarket,
  type ReviewStatus,
} from "@/lib/market-store"
import { cn } from "@/lib/utils"

export default function AdminReviewPage() {
  const [reviews, setReviews] = useState<StoreMarket[]>([])
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | ReviewStatus>("pending")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 })

  // 从 store 同步数据
  function refresh() {
    const all = [
      ...getPendingMarkets(),
      ...getApprovedMarkets(),
      ...getRejectedMarkets(),
    ]
    setReviews(all)
    setStats(getReviewStats())
  }

  useEffect(() => { refresh() }, [])

  const filtered = reviews.filter((r) => {
    if (search && !r.question.toLowerCase().includes(search.toLowerCase())) return false
    if (filterStatus !== "all" && r.reviewStatus !== filterStatus) return false
    return true
  })

  const selected = reviews.find((r) => r.id === selectedId)

  function handleApprove(id: string) {
    approveMarket(id)
    refresh()
  }

  function handleReject(id: string) {
    rejectMarket(id, rejectReason || "未提供原因")
    setRejectModal(null)
    setRejectReason("")
    refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">审核中心</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          审核用户提交的预测市场 · 保证平台内容质量
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "待审核", value: stats.pending, icon: Clock, color: "text-chart-4", bg: "bg-chart-4/10" },
          { label: "已通过", value: stats.approved, icon: Check, color: "text-yes", bg: "bg-yes/10" },
          { label: "已拒绝", value: stats.rejected, icon: X, color: "text-no", bg: "bg-no/10" },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center gap-4 rounded-2xl glass p-4">
              <span className={cn("flex size-10 items-center justify-center rounded-xl", s.bg)}>
                <Icon className={cn("size-5", s.color)} />
              </span>
              <div>
                <p className="num text-2xl font-bold tracking-tight">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* 筛选 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索市场名称..."
            className="h-11 w-full rounded-full glass pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        {(["pending", "approved", "rejected", "all"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              "h-9 rounded-full px-4 text-sm font-medium transition-colors",
              filterStatus === s
                ? "bg-primary text-primary-foreground"
                : "glass text-muted-foreground",
            )}
          >
            {s === "all" ? "全部" : s === "pending" ? "待审核" : s === "approved" ? "已通过" : "已拒绝"}
          </button>
        ))}
      </div>

      {/* 审核列表 */}
      <div className="flex flex-col gap-3">
        {filtered.map((r) => (
          <div
            key={r.id}
            className={cn(
              "flex flex-col gap-4 rounded-2xl glass p-5 transition-colors",
              r.reviewStatus === "rejected" && "opacity-70",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {categoryLabels[r.category]}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      r.chain === "base"
                        ? "bg-primary/10 text-primary"
                        : "bg-chart-4/10 text-chart-4",
                    )}
                  >
                    {chainMeta[r.chain].short}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                      r.reviewStatus === "pending" && "bg-chart-4/15 text-chart-4",
                      r.reviewStatus === "approved" && "bg-yes/15 text-yes",
                      r.reviewStatus === "rejected" && "bg-no/15 text-no",
                    )}
                  >
                    {r.reviewStatus === "pending" ? "⏳ 待审核" : r.reviewStatus === "approved" ? "✅ 已通过" : "❌ 已拒绝"}
                  </span>
                  {/* 用户创建标记 */}
                  {r.id.startsWith("user-") && (
                    <span className="rounded-full bg-secondary/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                      用户提交
                    </span>
                  )}
                </div>

                <h3 className="text-base font-semibold">{r.question}</h3>

                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>创建者: {r.creator}</span>
                  <span>提交时间: {r.createdAt}</span>
                  <span>YES 概率: {r.yesPrice}%</span>
                  <span>截止: {r.endDate}</span>
                  <span>结算来源: {r.resolution}</span>
                </div>

                {r.description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {r.description}
                  </p>
                )}

                {r.reviewStatus === "rejected" && r.rejectReason && (
                  <div className="mt-2 rounded-xl bg-no/5 px-3 py-2 text-sm text-no">
                    <MessageSquare className="inline size-3.5 mr-1" />
                    拒绝原因: {r.rejectReason}
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              {r.reviewStatus === "pending" && (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => handleApprove(r.id)}
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-yes px-4 text-sm font-semibold text-yes-foreground hover:bg-yes/90 transition-colors"
                  >
                    <Check className="size-4" /> 通过
                  </button>
                  <button
                    onClick={() => { setRejectModal({ id: r.id }); setRejectReason("") }}
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-no/15 px-4 text-sm font-semibold text-no hover:bg-no/25 transition-colors"
                  >
                    <X className="size-4" /> 拒绝
                  </button>
                </div>
              )}
              {r.reviewStatus !== "pending" && (
                <button
                  onClick={() => setSelectedId(selectedId === r.id ? null : r.id)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl glass px-4 text-sm font-medium"
                >
                  <Eye className="size-4" />
                  {selectedId === r.id ? "收起" : "详情"}
                </button>
              )}
            </div>

            {/* 展开详情 */}
            {selectedId === r.id && (
              <div className="rounded-xl bg-secondary/40 p-4 text-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="text-xs text-muted-foreground">结算来源</span>
                    <p className="font-medium">{r.resolution}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">结算代币</span>
                    <p className="font-medium">{chainMeta[r.chain].token}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">创建者</span>
                    <p className="font-mono text-xs">{r.creator}</p>
                  </div>
                  {r.description && (
                    <div>
                      <span className="text-xs text-muted-foreground">描述</span>
                      <p>{r.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
            {filterStatus === "pending"
              ? "暂无待审核市场，去首页创建新的预测吧"
              : "没有匹配的审核项"}
          </p>
        )}
      </div>

      {/* 拒绝弹窗 */}
      {rejectModal && (
        <>
          <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm" onClick={() => setRejectModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl glass-strong p-6 shadow-2xl">
              <h3 className="mb-4 text-lg font-bold">拒绝此市场</h3>
              <label className="mb-2 block text-sm text-muted-foreground">
                请填写拒绝原因（会展示给创建者）
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="例如：结算来源不够明确..."
                className="w-full resize-none rounded-xl bg-secondary/60 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setRejectModal(null)}
                  className="h-10 rounded-xl glass px-4 text-sm font-medium"
                >
                  取消
                </button>
                <button
                  onClick={() => handleReject(rejectModal.id)}
                  className="h-10 rounded-xl bg-no px-4 text-sm font-semibold text-no-foreground"
                >
                  确认拒绝
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
