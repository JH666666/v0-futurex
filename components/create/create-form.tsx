"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trophy, Coins, Cpu, Vote, DollarSign, Clapperboard, Check, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { chainOrder, chainMeta, type Chain, type Category } from "@/lib/data"
import { createMarket, type CreateMarketInput } from "@/lib/market-store"

const cats: { id: Category; label: string; icon: typeof Trophy }[] = [
  { id: "worldcup", label: "世界杯", icon: Trophy },
  { id: "crypto", label: "加密货币", icon: Coins },
  { id: "ai", label: "AI", icon: Cpu },
  { id: "politics", label: "政治", icon: Vote },
  { id: "finance", label: "金融", icon: DollarSign },
  { id: "entertainment", label: "娱乐", icon: Clapperboard },
]

const oracles = ["FIFA 官方赛果", "Coinbase 价格预言机", "Chainlink 数据源", "UMA 乐观预言机", "自定义来源"]

export function CreateForm() {
  const router = useRouter()
  const [cat, setCat] = useState<Category>("worldcup")
  const [chain, setChain] = useState<Chain>("base")
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [date, setDate] = useState("")
  const [oracle, setOracle] = useState(oracles[0])
  const [done, setDone] = useState(false)
  const [createdQuestion, setCreatedQuestion] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const chainInfo = chainMeta[chain]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !date) return

    setSubmitting(true)

    const input: CreateMarketInput = {
      question: title.trim(),
      description: desc.trim() || undefined,
      category: cat,
      chain,
      endDate: date,
      resolution: oracle,
      creator: "you.base",
      initialOdds: 50,
    }

    // 创建市场 → 自动进入待审核状态
    createMarket(input)
    setCreatedQuestion(title.trim())
    setDone(true)
    setSubmitting(false)
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col items-center gap-4 rounded-2xl glass-strong p-10 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-chart-4/15">
            <Clock className="size-8 text-chart-4" />
          </span>
          <h2 className="text-xl font-bold">预测市场已提交</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            "{createdQuestion}" 已提交到审核队列，管理员审核通过后将在首页上线。
          </p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => {
                setDone(false)
                setTitle("")
                setDesc("")
                setDate("")
                setOracle(oracles[0])
                setCat("worldcup")
                setChain("base")
              }}
              className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
            >
              再创建一个
            </button>
            <button
              onClick={() => router.push("/")}
              className="h-11 rounded-full glass px-6 text-sm font-semibold"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">创建预测市场</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          提交一个新的预测市场，管理员审核通过后上线。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-2xl glass-strong p-5 sm:p-6">
        <Field label="事件标题" hint="用是/否问题的形式描述">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：巴西会赢得 2026 世界杯吗？"
            className="h-12 w-full rounded-xl bg-secondary/60 px-4 text-base outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
          />
        </Field>

        <Field label="详细描述" hint="说明结算条件与边界情况（可选）">
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={4}
            placeholder="描述市场结算的具体规则…"
            className="w-full resize-none rounded-xl bg-secondary/60 px-4 py-3 text-base outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
          />
        </Field>

        <Field label="类别">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {cats.map((c) => {
              const Icon = c.icon
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCat(c.id)}
                  className={cn(
                    "flex h-20 flex-col items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition-colors",
                    cat === c.id ? "bg-primary text-primary-foreground" : "glass text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" />
                  {c.label}
                </button>
              )
            })}
          </div>
        </Field>

        <Field label="结算网络" hint="选择市场部署的区块链">
          <div className="grid grid-cols-2 gap-2">
            {chainOrder.map((c) => {
              const m = chainMeta[c]
              const active = chain === c
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setChain(c)}
                  className={cn(
                    "flex h-16 items-center justify-between rounded-xl px-4 text-sm font-semibold transition-colors",
                    active ? "bg-primary/15 ring-1 ring-primary" : "bg-secondary/60",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={cn("size-2.5 rounded-full", m.dot)} aria-hidden />
                    <span className="flex flex-col items-start">
                      <span className={cn(active && m.color)}>{m.short}</span>
                      <span className="text-xs font-normal text-muted-foreground">以 {m.token} 结算</span>
                    </span>
                  </span>
                  {active && <Check className="size-4 text-primary" />}
                </button>
              )
            })}
          </div>
        </Field>

        <Field label="截止日期">
          <input
            required
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 w-full rounded-xl bg-secondary/60 px-4 text-base outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
          />
        </Field>

        <Field label="预言机来源" hint="决定市场如何被裁定">
          <div className="flex flex-col gap-2">
            {oracles.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOracle(o)}
                className={cn(
                  "flex h-12 items-center justify-between rounded-xl px-4 text-sm font-medium transition-colors",
                  oracle === o ? "bg-primary/15 text-primary ring-1 ring-primary" : "bg-secondary/60 text-foreground",
                )}
              >
                {o}
                {oracle === o && <Check className="size-4" />}
              </button>
            ))}
          </div>
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="h-13 rounded-xl bg-primary text-base font-bold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? "提交中..." : `提交审核 · 需 5 ${chainInfo.token}`}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          提交后市场将进入审核队列，通过后自动上线
        </p>
      </form>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-semibold">{label}</label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  )
}
