"use client"

import { useState } from "react"
import {
  DollarSign,
  TrendingUp,
  PieChart,
  BarChart3,
  Download,
  ArrowUpRight,
  Gift,
} from "lucide-react"
import { getGlobalStats } from "@/lib/betting-store"
import { getGlobalStats as getWalletStats } from "@/lib/wallet-store"
import { getWithdrawalStats } from "@/lib/withdrawal-store"
import { getAllOrders } from "@/lib/betting-store"
import { getApprovedMarkets } from "@/lib/market-store"
import { getCommissionStats } from "@/lib/referral-store"
import { formatUSDC } from "@/lib/data"
import { cn } from "@/lib/utils"

export default function AdminFinancePage() {
  const [refresh, setRefresh] = useState(0)

  const betStats = getGlobalStats()
  const walletStats = getWalletStats()
  const wdStats = getWithdrawalStats()
  const refStats = getCommissionStats()

  const totalPlatformBalance = walletStats.totalBalance + walletStats.totalFrozen

  const statCards = [
    { label: "总下注额", value: formatUSDC(betStats.totalBetAmount), icon: BarChart3, sub: `${betStats.totalOrders} 笔订单` },
    { label: "用户余额", value: formatUSDC(walletStats.totalBalance), icon: DollarSign, sub: `冻结 ${formatUSDC(walletStats.totalFrozen)}` },
    { label: "平台池", value: formatUSDC(totalPlatformBalance), icon: PieChart, sub: "余额+冻结" },
    { label: "已结算返还", value: formatUSDC(betStats.totalPayout), icon: TrendingUp, sub: `${betStats.settledPositions} 笔结算` },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">财务统计</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            平台资金与交易数据概览
          </p>
        </div>
        <button
          onClick={() => setRefresh((n) => n + 1)}
          className="h-10 rounded-full glass px-4 text-sm font-medium hover:bg-accent"
        >
          刷新数据
        </button>
      </div>

      {/* 核心指标 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex flex-col gap-2 rounded-2xl glass p-4">
              <Icon className="size-5 text-primary" />
              <p className="num text-2xl font-bold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label} · {s.sub}</p>
            </div>
          )
        })}
      </div>

      {/* 详细数据 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 下注统计 */}
        <div className="rounded-2xl glass p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold">
            <BarChart3 className="size-5 text-primary" />
            下注数据
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "总订单", value: betStats.totalOrders },
              { label: "活跃持仓", value: betStats.activePositions },
              { label: "已结算持仓", value: betStats.settledPositions },
              { label: "活跃市场(有持仓)", value: betStats.activeMarketsWithBets },
            ].map((d) => (
              <div key={d.label} className="rounded-xl bg-secondary/40 p-3">
                <p className="num text-xl font-bold">{d.value}</p>
                <p className="text-xs text-muted-foreground">{d.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 资金统计 */}
        <div className="rounded-2xl glass p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold">
            <DollarSign className="size-5 text-primary" />
            资金数据
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "用户可用余额", value: formatUSDC(walletStats.totalBalance) },
              { label: "用户冻结金额", value: formatUSDC(walletStats.totalFrozen) },
              { label: "用户累计收益", value: formatUSDC(walletStats.totalEarned) },
              { label: "用户累计提现", value: formatUSDC(walletStats.totalWithdrawn) },
            ].map((d) => (
              <div key={d.label} className="rounded-xl bg-secondary/40 p-3">
                <p className="num text-xl font-bold">{d.value}</p>
                <p className="text-xs text-muted-foreground">{d.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 返佣统计 */}
      <div className="rounded-2xl glass p-5">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <Gift className="size-5 text-chart-4" />
          邀请返佣
        </h2>
        <div className="grid gap-3 sm:grid-cols-6">
          {refStats.byLevel.map((l) => (
            <div key={l.level} className="rounded-xl bg-secondary/40 p-3 text-center">
              <p className="text-[10px] text-muted-foreground">第{l.level}级 {l.rate}%</p>
              <p className="num text-lg font-bold">{formatUSDC(l.total)}</p>
              <p className="text-[10px] text-muted-foreground">{l.count} 笔</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>返佣总笔数: {refStats.total}</span>
          <span>返佣总额: <span className="num font-bold text-yes">{formatUSDC(refStats.totalAmount)}</span></span>
        </div>
      </div>

      {/* 提现统计 */}
      <div className="rounded-2xl glass p-5">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <ArrowUpRight className="size-5 text-chart-4" />
          提现统计
        </h2>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { label: "待提现金额", value: formatUSDC(wdStats.totalPendingAmount) },
            { label: "已提现金额", value: formatUSDC(wdStats.totalApprovedAmount) },
            { label: "提现总笔数", value: wdStats.total },
            { label: "手续费收入", value: formatUSDC(wdStats.totalFees) },
          ].map((d) => (
            <div key={d.label} className="rounded-xl bg-secondary/40 p-3">
              <p className="num text-xl font-bold">{d.value}</p>
              <p className="text-xs text-muted-foreground">{d.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 平台收益分析 */}
      <div className="rounded-2xl glass p-5">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <TrendingUp className="size-5 text-yes" />
          平台收益分析
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-secondary/40 p-4">
            <p className="text-xs text-muted-foreground mb-1">用户总充值</p>
            <p className="num text-2xl font-bold">{formatUSDC(walletStats.totalBalance + walletStats.totalFrozen + walletStats.totalWithdrawn - walletStats.totalEarned)}</p>
          </div>
          <div className="rounded-xl bg-secondary/40 p-4">
            <p className="text-xs text-muted-foreground mb-1">已返还用户</p>
            <p className="num text-2xl font-bold text-yes">{formatUSDC(betStats.totalPayout)}</p>
          </div>
          <div className="rounded-xl bg-secondary/40 p-4">
            <p className="text-xs text-muted-foreground mb-1">待提现金额</p>
            <p className="num text-2xl font-bold text-chart-4">{formatUSDC(walletStats.totalBalance)}</p>
          </div>
        </div>
      </div>

      {/* 结算明细 */}
      <div className="rounded-2xl glass p-5">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <Download className="size-5 text-primary" />
          资金流向说明
        </h2>
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-3">
            <span>用户下注时：可用余额 → 冻结金额</span>
            <span className="num font-semibold">{formatUSDC(walletStats.totalFrozen)} 冻结中</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-3">
            <span>结算后赢家：冻结释放 + 收益 → 可用余额</span>
            <span className="num font-semibold text-yes">{formatUSDC(betStats.totalPayout)} 已返还</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-3">
            <span>结算后输家：冻结释放（无返还）</span>
            <span className="num font-semibold text-no">
              {formatUSDC(betStats.totalBetAmount - betStats.totalPayout)} 归平台
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
