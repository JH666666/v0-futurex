"use client"

import { useState } from "react"
import {
  Search,
  Ban,
  CheckCircle,
  XCircle,
  Shield,
  Eye,
  X,
  ArrowUpDown,
  History,
} from "lucide-react"
import { leaders, formatUSDC } from "@/lib/data"
import { cn } from "@/lib/utils"

type AdminUser = {
  address: string
  name: string
  handle: string
  joined: string
  totalTrades: number
  totalVolume: number
  pnl: number
  accuracy: number
  status: "active" | "banned" | "pending"
  role: "user" | "admin"
  lastActive: string
  referralCode: string
  referredBy: string
}

type TradeRecord = {
  id: string
  market: string
  side: "YES" | "NO"
  amount: number
  price: number
  date: string
  pnl: number
}

const mockUsers: AdminUser[] = [
  ...leaders.map((l, i) => ({
    address: `0x${(1000 + i).toString(16)}...${(9000 + i).toString(16)}`,
    name: l.name,
    handle: l.handle,
    joined: `2025-0${1 + i}-${10 + i}`,
    totalTrades: 200 - i * 15,
    totalVolume: l.volume,
    pnl: l.pnl,
    accuracy: l.accuracy,
    status: "active" as const,
    role: (i === 0 ? "admin" : "user") as "admin" | "user",
    lastActive: `2026-06-0${8 - i}`,
    referralCode: `REF-${l.handle.split(".")[0].toUpperCase()}`,
    referredBy: i > 0 ? `REF-${leaders[0].handle.split(".")[0].toUpperCase()}` : "-",
  })),
  {
    address: "0xbad1...dead",
    name: "SpamBot",
    handle: "spam.base",
    joined: "2026-01-15",
    totalTrades: 5000,
    totalVolume: 120000,
    pnl: -12000,
    accuracy: 12,
    status: "banned" as const,
    role: "user" as const,
    lastActive: "2026-06-01",
    referralCode: "REF-SPAMBOT",
    referredBy: "-",
  },
  {
    address: "0xnew1...a1b2",
    name: "NewTrader",
    handle: "newbie.base",
    joined: "2026-06-07",
    totalTrades: 3,
    totalVolume: 450,
    pnl: -85,
    accuracy: 33,
    status: "pending" as const,
    role: "user" as const,
    lastActive: "2026-06-08",
    referralCode: "REF-NEWBIE",
    referredBy: "REF-VITALIK",
  },
]

const mockTradeHistory: Record<string, TradeRecord[]> = {
  "0x3e8...2328": [
    { id: "t1", market: "巴西会赢得2026世界杯冠军吗？", side: "YES", amount: 1200, price: 23, date: "2026-06-08", pnl: 48 },
    { id: "t2", market: "比特币突破$150,000？", side: "YES", amount: 800, price: 31, date: "2026-06-07", pnl: 56 },
    { id: "t3", market: "美国队能进入半决赛吗？", side: "NO", amount: 540, price: 72, date: "2026-06-07", pnl: -16 },
  ],
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(mockUsers)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | AdminUser["status"]>("all")
  const [sortBy, setSortBy] = useState<"pnl" | "volume" | "accuracy" | "trades">("pnl")
  const [detailId, setDetailId] = useState<string | null>(null)

  const filtered = users
    .filter((u) => {
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.address.toLowerCase().includes(search.toLowerCase()))
        return false
      if (statusFilter !== "all" && u.status !== statusFilter) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === "pnl") return b.pnl - a.pnl
      if (sortBy === "volume") return b.totalVolume - a.totalVolume
      if (sortBy === "accuracy") return b.accuracy - a.accuracy
      return b.totalTrades - a.totalTrades
    })

  function toggleBan(address: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.address === address
          ? { ...u, status: u.status === "banned" ? "active" : "banned" } as AdminUser
          : u,
      ),
    )
  }

  const detailUser = users.find((u) => u.address === detailId)
  const tradeHistory = mockTradeHistory[detailId ?? ""] || []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">用户管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理平台用户 · {users.length} 个用户
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-5">
        {[
          { label: "总用户", value: users.length },
          { label: "活跃", value: users.filter((u) => u.status === "active").length, color: "text-yes" },
          { label: "封禁", value: users.filter((u) => u.status === "banned").length, color: "text-no" },
          { label: "待审核", value: users.filter((u) => u.status === "pending").length, color: "text-chart-4" },
          { label: "管理员", value: users.filter((u) => u.role === "admin").length },
        ].map((s) => (
          <div key={s.label} className="flex flex-col gap-1 rounded-2xl glass p-4">
            <p className={cn("num text-2xl font-bold tracking-tight", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + Sort */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索地址或用户名..."
            className="h-11 w-full rounded-full glass pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        {(["all", "active", "banned", "pending"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={cn(
              "h-9 rounded-full px-4 text-sm font-medium transition-colors",
              statusFilter === f ? "bg-primary text-primary-foreground" : "glass text-muted-foreground",
            )}
          >
            {f === "all" ? "全部" : f === "active" ? "活跃" : f === "banned" ? "已封禁" : "待审核"}
          </button>
        ))}
        <div className="flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs text-muted-foreground">
          <ArrowUpDown className="size-3" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-transparent outline-none text-xs"
          >
            <option value="pnl">按盈亏</option>
            <option value="volume">按交易量</option>
            <option value="accuracy">按胜率</option>
            <option value="trades">按交易次数</option>
          </select>
        </div>
      </div>

      {/* User table */}
      <div className="overflow-hidden rounded-2xl glass">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                <th className="pb-3 pl-5 pr-4 font-medium">用户</th>
                <th className="pb-3 pr-4 font-medium">角色</th>
                <th className="pb-3 pr-4 font-medium num">交易次数</th>
                <th className="pb-3 pr-4 font-medium num">交易量</th>
                <th className="pb-3 pr-4 font-medium num">PnL</th>
                <th className="pb-3 pr-4 font-medium">胜率</th>
                <th className="pb-3 pr-4 font-medium">状态</th>
                <th className="pb-3 pr-4 font-medium">最后活跃</th>
                <th className="pb-3 pr-5 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.address} className="border-b border-border/30">
                  <td className="py-3 pl-5 pr-4">
                    <div className="flex flex-col">
                      <span className="font-semibold">{u.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">{u.handle}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    {u.role === "admin" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-chart-4/15 px-2 py-0.5 text-xs font-medium text-chart-4">
                        <Shield className="size-3" /> 管理员
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">用户</span>
                    )}
                  </td>
                  <td className="num py-3 pr-4">{u.totalTrades}</td>
                  <td className="num py-3 pr-4 text-muted-foreground">{formatUSDC(u.totalVolume)}</td>
                  <td className={cn("num py-3 pr-4 font-semibold", u.pnl >= 0 ? "text-yes" : "text-no")}>
                    {u.pnl >= 0 ? "+" : ""}{formatUSDC(u.pnl)}
                  </td>
                  <td className="num py-3 pr-4">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-10 overflow-hidden rounded-full bg-secondary">
                        <div className={cn("h-full rounded-full", u.accuracy >= 60 ? "bg-yes" : u.accuracy >= 40 ? "bg-chart-4" : "bg-no")} style={{ width: `${u.accuracy}%` }} />
                      </div>
                      {u.accuracy}%
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                      u.status === "active" && "bg-yes/15 text-yes",
                      u.status === "banned" && "bg-no/15 text-no",
                      u.status === "pending" && "bg-chart-4/15 text-chart-4",
                    )}>
                      {u.status === "active" ? <CheckCircle className="size-3" /> : u.status === "banned" ? <XCircle className="size-3" /> : <Shield className="size-3" />}
                      {u.status === "active" ? "活跃" : u.status === "banned" ? "已封禁" : "待审核"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{u.lastActive}</td>
                  <td className="py-3 pr-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setDetailId(detailId === u.address ? null : u.address)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                        title="查看详情"
                      >
                        <Eye className="size-3.5" />
                      </button>
                      <button
                        onClick={() => toggleBan(u.address)}
                        className={cn(
                          "rounded-lg p-1.5 transition-colors",
                          u.status === "banned"
                            ? "text-yes hover:bg-yes/10"
                            : "text-muted-foreground hover:bg-no/10 hover:text-no",
                        )}
                        title={u.status === "banned" ? "解封" : "封禁"}
                      >
                        <Ban className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User detail panel */}
      {detailUser && (
        <div className="rounded-2xl glass-strong p-5 ring-1 ring-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">用户详情: {detailUser.name}</h2>
            <button onClick={() => setDetailId(null)} className="rounded-lg p-1 text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "钱包地址", value: detailUser.address, mono: true },
              { label: "邀请码", value: detailUser.referralCode },
              { label: "推荐人", value: detailUser.referredBy },
              { label: "注册时间", value: detailUser.joined },
              { label: "总交易次数", value: detailUser.totalTrades },
              { label: "总交易量", value: formatUSDC(detailUser.totalVolume) },
              { label: "总盈亏", value: `${detailUser.pnl >= 0 ? "+" : ""}${formatUSDC(detailUser.pnl)}`, color: detailUser.pnl >= 0 ? "text-yes" : "text-no" },
              { label: "胜率", value: `${detailUser.accuracy}%` },
            ].map((f) => (
              <div key={f.label} className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">{f.label}</span>
                <span className={cn("text-sm font-semibold", f.mono && "font-mono text-xs", f.color)}>{f.value}</span>
              </div>
            ))}
          </div>

          {/* Trade history */}
          {tradeHistory.length > 0 && (
            <div className="mt-4 border-t border-border/50 pt-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                <History className="size-4 text-primary" /> 最近交易
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/30 text-left text-muted-foreground">
                      <th className="pb-2 pr-3">市场</th>
                      <th className="pb-2 pr-3">方向</th>
                      <th className="pb-2 pr-3 num">金额</th>
                      <th className="pb-2 pr-3 num">价格</th>
                      <th className="pb-2 pr-3 num">PnL</th>
                      <th className="pb-2">日期</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradeHistory.map((t) => (
                      <tr key={t.id} className="border-b border-border/20">
                        <td className="max-w-[160px] truncate py-2 pr-3">{t.market}</td>
                        <td className="py-2 pr-3">
                          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", t.side === "YES" ? "bg-yes/15 text-yes" : "bg-no/15 text-no")}>{t.side}</span>
                        </td>
                        <td className="num py-2 pr-3">{formatUSDC(t.amount)}</td>
                        <td className="num py-2 pr-3">{t.price}¢</td>
                        <td className={cn("num py-2 pr-3 font-semibold", t.pnl >= 0 ? "text-yes" : "text-no")}>{t.pnl >= 0 ? "+" : ""}{formatUSDC(t.pnl)}</td>
                        <td className="py-2">{t.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
