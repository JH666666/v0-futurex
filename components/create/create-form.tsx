"use client"

import { useState } from "react"
import { Trophy, Coins, Cpu, Vote, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const cats = [
  { id: "worldcup", label: "世界杯", icon: Trophy },
  { id: "crypto", label: "加密货币", icon: Coins },
  { id: "ai", label: "AI", icon: Cpu },
  { id: "politics", label: "政治", icon: Vote },
]

const oracles = ["FIFA 官方赛果", "Coinbase 价格预言机", "Chainlink 数据源", "UMA 乐观预言机", "自定义来源"]

export function CreateForm() {
  const [cat, setCat] = useState("worldcup")
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [date, setDate] = useState("")
  const [oracle, setOracle] = useState(oracles[0])
  const [done, setDone] = useState(false)

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">创建预测市场</h1>
        <p className="mt-1 text-sm text-muted-foreground">部署一个新的链上预测市场，任何人都能交易其结果。</p>
      </div>

      {done ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl glass-strong p-10 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-yes/15">
            <Check className="size-8 text-yes" />
          </span>
          <h2 className="text-xl font-bold">市场创建成功</h2>
          <p className="text-sm text-muted-foreground">你的预测市场已提交至 Base 网络，正在等待确认。</p>
          <button onClick={() => setDone(false)} className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground">
            再创建一个
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setDone(true)
          }}
          className="flex flex-col gap-6 rounded-2xl glass-strong p-5 sm:p-6"
        >
          <Field label="事件标题" hint="用是/否问题的形式描述">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：巴西会赢得 2026 世界杯吗？"
              className="h-12 w-full rounded-xl bg-secondary/60 px-4 text-base outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
            />
          </Field>

          <Field label="详细描述" hint="说明结算条件与边界情况">
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

          <Field label="截止日期">
            <input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 w-full rounded-xl bg-secondary/60 px-4 text-base outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
            />
          </Field>

          <Field label="预言机来源" hint="决定市场如何被自动裁定">
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
            className="h-13 rounded-xl bg-primary text-base font-bold text-primary-foreground transition-transform active:scale-[0.98]"
          >
            部署市场 · 需 5 USDC
          </button>
        </form>
      )}
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
