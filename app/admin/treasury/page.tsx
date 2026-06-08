"use client"

import { useState } from "react"
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  Shield,
  RefreshCw,
  Coins,
  Building2,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import {
  getAllTreasuryConfigs,
  getTreasuryState,
  getTreasuryTransactions,
  getRiskAlerts,
  updateTreasuryConfig,
  type ChainTreasuryConfig,
} from "@/lib/treasury-store"
import { cn } from "@/lib/utils"
import { formatUSDC, chainOrder } from "@/lib/data"

export default function AdminTreasuryPage() {
  const [configs, setConfigs] = useState<ChainTreasuryConfig[]>(() => getAllTreasuryConfigs())
  const [state] = useState(() => getTreasuryState())
  const [transactions] = useState(() => getTreasuryTransactions({ limit: 10 }))
  const [alerts] = useState(() => getRiskAlerts())
  const [editingChain, setEditingChain] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<ChainTreasuryConfig>>({})

  function startEdit(config: ChainTreasuryConfig) {
    setEditingChain(config.chain)
    setEditForm({ ...config })
  }

  function saveEdit(chain: string) {
    updateTreasuryConfig(chain as ChainTreasuryConfig["chain"], editForm)
    setConfigs(getAllTreasuryConfigs())
    setEditingChain(null)
  }

  const totalInflow = configs.every((c) => c.collectionAddress)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">资金池</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            收款地址 · 出款合约 · 资金流监控
          </p>
        </div>
        <button onClick={() => { setConfigs(getAllTreasuryConfigs()) }} className="inline-flex h-10 items-center gap-1.5 rounded-full glass px-4 text-sm font-medium">
          <RefreshCw className="size-3.5" /> 刷新
        </button>
      </div>

      {/* 风险预警 */}
      {alerts.length > 0 && (
        <div className="flex flex-col gap-2">
          {alerts.map((a, i) => (
            <div key={i} className={cn(
              "flex items-start gap-3 rounded-xl px-4 py-3",
              a.level === "critical" && "bg-no/15 ring-1 ring-no/30",
              a.level === "high" && "bg-no/10",
              a.level === "medium" && "bg-chart-4/10",
              a.level === "low" && "bg-secondary/40",
            )}>
              <AlertTriangle className={cn("size-5 mt-0.5 shrink-0",
                a.level === "critical" || a.level === "high" ? "text-no" : "text-chart-4",
              )} />
              <div>
                <p className="text-sm font-bold">{a.message}</p>
                <p className="text-xs text-muted-foreground">{a.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 资金概览 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "今日收入", value: formatUSDC(state.todayInflow), icon: TrendingUp, color: "text-yes" },
          { label: "今日出款", value: formatUSDC(state.todayOutflow), icon: TrendingDown, color: "text-no" },
          { label: "合约余额", value: formatUSDC(state.contractBalance), icon: Building2 },
          { label: "资金缺口", value: formatUSDC(Math.max(0, state.pendingWithdrawals - state.contractBalance)), icon: AlertTriangle, color: state.pendingWithdrawals > state.contractBalance ? "text-no" : "text-yes" },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex flex-col gap-2 rounded-2xl glass p-4">
              <Icon className={cn("size-5", s.color)} />
              <p className="num text-2xl font-bold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "待提现金额", value: formatUSDC(state.pendingWithdrawals), icon: ArrowUpRight },
          { label: "准备金", value: formatUSDC(state.reserveBalance), icon: Shield },
          { label: "收款链数", value: configs.length, icon: Coins },
          { label: "最后更新", value: new Date(state.lastUpdated).toLocaleTimeString("zh-CN"), icon: RefreshCw },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex flex-col gap-2 rounded-2xl glass p-4">
              <Icon className="size-5 text-muted-foreground" />
              <p className="num text-2xl font-bold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* 链级资金配置 */}
      <div className="rounded-2xl glass p-5">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <Wallet className="size-5 text-primary" />
          资金地址配置
        </h2>
        <div className="flex flex-col gap-4">
          {configs.map((c) => {
            const editing = editingChain === c.chain
            return (
              <div key={c.chain} className="rounded-xl bg-secondary/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={cn("font-bold", c.chain === "base" ? "text-primary" : "text-chart-4")}>
                    {c.chain === "base" ? "Base" : "BNB Smart Chain"} · {c.tokenSymbol}
                  </span>
                  {editing ? (
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(c.chain)} className="rounded-lg bg-yes/15 px-3 py-1 text-xs font-semibold text-yes">保存</button>
                      <button onClick={() => setEditingChain(null)} className="rounded-lg glass px-3 py-1 text-xs">取消</button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(c)} className="rounded-lg glass px-3 py-1 text-xs">编辑</button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <AddressField label="收款地址" value={c.collectionAddress} editing={editing} onChange={(v) => setEditForm({ ...editForm, collectionAddress: v })} />
                  <AddressField label="出款合约地址" value={c.paymentContractAddress} editing={editing} onChange={(v) => setEditForm({ ...editForm, paymentContractAddress: v })} />
                  <AddressField label="代币合约地址" value={c.tokenAddress} editing={editing} onChange={(v) => setEditForm({ ...editForm, tokenAddress: v })} />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground">代币符号</span>
                    {editing ? (
                      <input value={editForm.tokenSymbol || ""} onChange={(e) => setEditForm({ ...editForm, tokenSymbol: e.target.value })} className="h-9 rounded-lg bg-secondary/60 px-3 font-mono text-xs outline-none" />
                    ) : (
                      <span className="font-mono text-sm">{c.tokenSymbol}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 资金流记录 */}
      <div className="rounded-2xl glass p-5">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <ArrowDownRight className="size-5 text-primary" />
          资金流记录
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                <th className="pb-3 pl-5 pr-4">类型</th>
                <th className="pb-3 pr-4 num">金额</th>
                <th className="pb-3 pr-4">代币</th>
                <th className="pb-3 pr-4 font-mono">来源/目标</th>
                <th className="pb-3 pr-4">状态</th>
                <th className="pb-3 pr-4">备注</th>
                <th className="pb-3">时间</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-border/30">
                  <td className="py-3 pl-5 pr-4">
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                      tx.type === "inflow" ? "bg-yes/10 text-yes" : "bg-no/10 text-no",
                    )}>
                      {tx.type === "inflow" ? <ArrowDownRight className="size-3" /> : <ArrowUpRight className="size-3" />}
                      {tx.type === "inflow" ? "收款" : "出款"}
                    </span>
                  </td>
                  <td className="num py-3 pr-4 font-semibold">{formatUSDC(tx.amount)}</td>
                  <td className="py-3 pr-4">{tx.token}</td>
                  <td className="py-3 pr-4 font-mono text-[10px] max-w-[160px] truncate" title={tx.from || tx.to}>{tx.from || tx.to}</td>
                  <td className="py-3 pr-4">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium",
                      tx.status === "confirmed" && "bg-yes/10 text-yes",
                      tx.status === "pending" && "bg-chart-4/10 text-chart-4",
                      tx.status === "failed" && "bg-no/10 text-no",
                    )}>{tx.status === "confirmed" ? "已确认" : tx.status === "pending" ? "待处理" : "失败"}</span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-muted-foreground">{tx.note}</td>
                  <td className="py-3 text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 架构说明 */}
      <div className="rounded-2xl glass p-5">
        <h2 className="mb-3 flex items-center gap-2 font-bold">
          <Shield className="size-5 text-primary" />
          资金流架构
        </h2>
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <div className="flex flex-col gap-2 rounded-xl bg-secondary/40 p-4">
            <span className="font-bold text-yes">① 用户下注</span>
            <p className="text-muted-foreground">用户资金 → 收款地址 (Collection Address)</p>
            <span className="font-mono text-[10px] text-muted-foreground">链上转账 · Gas 由用户支付</span>
          </div>
          <div className="flex flex-col gap-2 rounded-xl bg-secondary/40 p-4">
            <span className="font-bold text-chart-4">② 资金归集</span>
            <p className="text-muted-foreground">收款地址 → 出款合约 (Payment Contract)</p>
            <span className="font-mono text-[10px] text-muted-foreground">定期归集 · 管理员手动触发</span>
          </div>
          <div className="flex flex-col gap-2 rounded-xl bg-secondary/40 p-4">
            <span className="font-bold text-no">③ 用户提现</span>
            <p className="text-muted-foreground">审核通过 → 出款合约 → 用户钱包</p>
            <span className="font-mono text-[10px] text-muted-foreground">小额自动 · 大额人工 · Gas 由平台承担</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function AddressField({ label, value, editing, onChange }: { label: string; value: string; editing: boolean; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      {editing ? (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="h-9 rounded-lg bg-secondary/60 px-3 font-mono text-xs outline-none focus:ring-2 focus:ring-primary" />
      ) : (
        <span className="font-mono text-xs truncate" title={value}>{value || "未配置"}</span>
      )}
    </div>
  )
}
