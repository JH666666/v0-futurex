"use client"

import { useState } from "react"
import { Wallet, Info, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { chainMeta } from "@/lib/data"
import { createOrder } from "@/lib/api-client"

export function TradePanel({ market }: { market: any }) {
  const [side, setSide] = useState<"YES" | "NO">("YES")
  const [amount, setAmount] = useState(50)
  const [submitted, setSubmitted] = useState(false)
  const [orderResult, setOrderResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const price = side === "YES" ? market.yesPrice : 100 - market.yesPrice
  const shares = (amount * 100) / price
  const payout = shares
  const profit = payout - amount
  const presets = [10, 50, 100, 500]
  const chain = chainMeta[market.chain] || chainMeta.base

  async function handlePlaceBet() {
    if (amount <= 0 || loading) return
    setLoading(true)
    try {
      const res = await createOrder({
        marketId: market.id,
        side,
        amount,
        price,
        chain: market.chain,
      })
      setOrderResult(res.data)
      setSubmitted(true)
    } catch (e: any) {
      alert(e.message || "下注失败")
    } finally {
      setLoading(false)
    }
  }

  if (submitted && orderResult) {
    const o = orderResult.order
    const w = orderResult.wallet
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl glass-strong p-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-yes/15">
          <CheckCircle className="size-7 text-yes" />
        </span>
        <div>
          <h3 className="font-bold text-lg">下注成功</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {o.side} · ${o.amount} @ {o.price}¢
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {o.shares.toFixed(1)} 股 · 潜在收益 ${o.estimatedReturn.toFixed(2)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            链: {o.chain} · {o.token} · 余额 ${w.balance} (冻结 ${w.frozenBalance})
          </p>
        </div>
        <div className="flex gap-2 mt-2">
          <button onClick={() => setSubmitted(false)} className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">继续交易</button>
          <a href="/portfolio" className="h-10 rounded-xl glass px-4 text-sm font-semibold inline-flex items-center">查看持仓</a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl glass-strong p-5">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary/60 p-1">
        <button onClick={() => setSide("YES")} className={cn("h-12 rounded-lg text-sm font-bold transition-colors", side === "YES" ? "bg-yes text-yes-foreground" : "text-muted-foreground")}>
          YES · {market.yesPrice}¢
        </button>
        <button onClick={() => setSide("NO")} className={cn("h-12 rounded-lg text-sm font-bold transition-colors", side === "NO" ? "bg-no text-no-foreground" : "text-muted-foreground")}>
          NO · {100 - market.yesPrice}¢
        </button>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-muted-foreground">投入金额</label>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Wallet className="size-3" /> 余额 2,480 {chain.token}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-secondary/60 px-4 py-3">
          <span className="text-lg font-bold text-muted-foreground">$</span>
          <input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))} className="num w-full bg-transparent text-2xl font-bold outline-none" />
          <span className="text-sm font-semibold text-muted-foreground">{chain.token}</span>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {presets.map((p) => (
            <button key={p} onClick={() => setAmount(p)} className="h-9 rounded-lg glass text-xs font-semibold num hover:bg-accent">${p}</button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-secondary/40 p-4 text-sm">
        <Row label="预计份额" value={`${shares.toFixed(1)} 股`} />
        <Row label="成交价格" value={`${price}¢`} />
        <Row label="若正确可得" value={`$${payout.toFixed(2)}`} highlight="yes" />
        <Row label="潜在收益" value={`+$${profit.toFixed(2)}`} highlight="yes" />
      </div>

      <button onClick={handlePlaceBet} disabled={amount <= 0 || loading} className={cn("h-13 rounded-xl text-base font-bold transition-transform active:scale-[0.98] disabled:opacity-50", side === "YES" ? "bg-yes text-yes-foreground" : "bg-no text-no-foreground")}>
        {loading ? "提交中..." : `确认下注 ${side} · $${amount.toFixed(0)}`}
      </button>

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        交易在 {chain.label} 网络以 {chain.token} 结算 · 预言机自动裁定
      </p>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: "yes" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("num font-semibold", highlight === "yes" ? "text-yes" : "text-foreground")}>{value}</span>
    </div>
  )
}
