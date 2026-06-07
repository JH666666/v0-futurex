"use client"

import { useState } from "react"
import { Wallet, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Market } from "@/lib/data"

export function TradePanel({ market }: { market: Market }) {
  const [side, setSide] = useState<"YES" | "NO">("YES")
  const [amount, setAmount] = useState(50)
  const price = side === "YES" ? market.yesPrice : 100 - market.yesPrice
  const shares = amount / (price / 100)
  const payout = shares * 1
  const profit = payout - amount
  const presets = [10, 50, 100, 500]

  return (
    <div className="flex flex-col gap-4 rounded-2xl glass-strong p-5">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary/60 p-1">
        <button
          onClick={() => setSide("YES")}
          className={cn(
            "h-12 rounded-lg text-sm font-bold transition-colors",
            side === "YES" ? "bg-yes text-yes-foreground" : "text-muted-foreground",
          )}
        >
          YES · {market.yesPrice}¢
        </button>
        <button
          onClick={() => setSide("NO")}
          className={cn(
            "h-12 rounded-lg text-sm font-bold transition-colors",
            side === "NO" ? "bg-no text-no-foreground" : "text-muted-foreground",
          )}
        >
          NO · {100 - market.yesPrice}¢
        </button>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-muted-foreground">投入金额</label>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Wallet className="size-3" /> 余额 2,480 USDC
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-secondary/60 px-4 py-3">
          <span className="text-lg font-bold text-muted-foreground">$</span>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
            className="num w-full bg-transparent text-2xl font-bold outline-none"
          />
          <span className="text-sm font-semibold text-muted-foreground">USDC</span>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(p)}
              className="h-9 rounded-lg glass text-xs font-semibold num hover:bg-accent"
            >
              ${p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-secondary/40 p-4 text-sm">
        <Row label="预计份额" value={`${shares.toFixed(1)} 股`} />
        <Row label="平均价格" value={`${price}¢`} />
        <Row label="若结果成立可得" value={`$${payout.toFixed(2)}`} highlight="yes" />
        <Row label="潜在收益" value={`+$${profit.toFixed(2)}`} highlight="yes" />
      </div>

      <button
        className={cn(
          "h-13 rounded-xl text-base font-bold transition-transform active:scale-[0.98]",
          side === "YES" ? "bg-yes text-yes-foreground" : "bg-no text-no-foreground",
        )}
      >
        买入 {side} · ${amount.toFixed(0)}
      </button>

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        交易在 Base 网络以 USDC 结算，由预言机自动裁定，无需信任中介。
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
