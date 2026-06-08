"use client"

import { useState, useEffect } from "react"
import { ArrowUpRight, Wallet, Check, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { withdrawRequest, getMyWithdrawals, type Withdrawal } from "@/lib/api-client"
import { chainMeta, type Chain } from "@/lib/data"
import { formatUSDC } from "@/lib/data"

const chains: { id: Chain; token: string }[] = [
  { id: "base", token: "USDC" },
  { id: "bsc", token: "USDT" },
]

export function WithdrawForm() {
  const [amount, setAmount] = useState(100)
  const [address, setAddress] = useState("")
  const [chain, setChain] = useState<Chain>("base")
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<Withdrawal | null>(null)
  const [history, setHistory] = useState<Withdrawal[]>([])
  const [balance, setBalance] = useState(5000)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getMyWithdrawals().then((res) => setHistory(res.data.withdrawals)).catch(() => {})
  }, [submitted])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!address.trim() || amount < 10) return
    setLoading(true)
    try {
      const res = await withdrawRequest({ amount, toAddress: address.trim(), chain })
      setResult(res.data)
      setBalance((b) => b - res.data.amount)
      setSubmitted(true)
    } catch (e: any) {
      alert(e.message || "提现失败")
    } finally {
      setLoading(false)
    }
  }

  if (submitted && result) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl glass-strong p-6 text-center">
        <span className={cn("flex size-14 items-center justify-center rounded-full", result.status === "PAID" ? "bg-yes/15" : "bg-chart-4/15")}>
          {result.status === "PAID" ? <Check className="size-7 text-yes" /> : <Clock className="size-7 text-chart-4" />}
        </span>
        <div>
          <h3 className="font-bold text-lg">{result.status === "PAID" ? "提现成功" : "已提交审核"}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {result.status === "PAID" ? `${formatUSDC(result.netAmount)} ${result.token} 已发送` : `$${result.amount} 进入人工审核队列`}
          </p>
        </div>
        <button onClick={() => { setSubmitted(false); setResult(null); setAmount(100); setAddress("") }} className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
          {result.status === "PAID" ? "完成" : "查看状态"}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl glass-strong p-5">
      <h3 className="flex items-center gap-2 font-bold"><ArrowUpRight className="size-5 text-primary" />提现</h3>

      <div className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-3">
        <span className="text-sm text-muted-foreground">可用余额</span>
        <span className="num text-lg font-bold">{formatUSDC(balance)}</span>
      </div>

      {history.length > 0 && (
        <div className="flex flex-col gap-1.5 max-h-24 overflow-y-auto">
          {history.slice(0, 5).map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-xs">
              <span className="font-mono text-[10px]">{r.id.slice(0, 12)}...</span>
              <span className="num font-semibold">{formatUSDC(r.netAmount)} {r.token}</span>
              <span className={cn("rounded px-1.5 py-0.5 font-medium", r.status === "PAID" && "bg-yes/15 text-yes", r.status === "PENDING" && "bg-chart-4/15 text-chart-4")}>
                {r.status === "PAID" ? "已到账" : "审核中"}
              </span>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">提现金额 <span className="text-xs">(≤$100 自动到账)</span></label>
          <div className="flex items-center gap-2 rounded-xl bg-secondary/60 px-4 py-3">
            <span className="text-lg font-bold text-muted-foreground">$</span>
            <input type="number" min={10} value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))} className="num w-full bg-transparent text-2xl font-bold outline-none" required />
          </div>
          <div className="flex gap-2 mt-1">
            {[50, 100, 500, 1000].map((p) => (
              <button key={p} type="button" onClick={() => setAmount(p)} className="h-8 rounded-lg glass px-3 text-xs font-semibold num hover:bg-accent">${p}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">钱包地址</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x..." className="h-12 w-full rounded-xl bg-secondary/60 px-4 font-mono text-sm outline-none focus:ring-2 focus:ring-primary" required />
        </div>
        <div className="flex gap-2">
          {chains.map((c) => (
            <button key={c.id} type="button" onClick={() => setChain(c.id)} className={cn("h-10 rounded-xl px-4 text-sm font-semibold", chain === c.id ? "bg-primary text-primary-foreground" : "glass text-muted-foreground")}>
              {chainMeta[c.id].short} · {c.token}
            </button>
          ))}
        </div>
        <button type="submit" disabled={!address.trim() || amount < 10 || loading} className="h-13 rounded-xl bg-primary text-base font-bold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50">
          {loading ? "提交中..." : `确认提现 $${amount}`}
        </button>
        <p className="text-xs text-muted-foreground text-center">≤$100 自动到账 · &gt;$100 需审核 · 手续费 $2</p>
      </form>
    </div>
  )
}

