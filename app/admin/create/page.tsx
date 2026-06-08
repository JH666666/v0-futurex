"use client"

import { useState } from "react"
import {
  Trophy,
  Coins,
  Cpu,
  Vote,
  DollarSign,
  Clapperboard,
  Check,
  Eye,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { chainOrder, chainMeta, categoryMeta, type Chain, type Category } from "@/lib/data"

const cats: { id: Category; label: string; icon: typeof Trophy }[] = [
  { id: "worldcup", label: "世界杯", icon: Trophy },
  { id: "crypto", label: "加密货币", icon: Coins },
  { id: "ai", label: "AI", icon: Cpu },
  { id: "politics", label: "政治", icon: Vote },
  { id: "finance", label: "金融", icon: DollarSign },
  { id: "entertainment", label: "娱乐", icon: Clapperboard },
]

const oracles = [
  "FIFA 官方赛果",
  "Coinbase 价格预言机",
  "Chainlink 数据源",
  "UMA 乐观预言机",
  "自定义来源",
]

export default function AdminCreatePage() {
  const [cat, setCat] = useState<Category>("worldcup")
  const [chain, setChain] = useState<Chain>("base")
  const [question, setQuestion] = useState("")
  const [desc, setDesc] = useState("")
  const [date, setDate] = useState("")
  const [oracle, setOracle] = useState(oracles[0])
  const [initialOdds, setInitialOdds] = useState(50)
  const [featured, setFeatured] = useState(false)
  const [skipReview, setSkipReview] = useState(true) // 管理员可直接发布
  const [done, setDone] = useState(false)
  const [preview, setPreview] = useState(false)

  const chainInfo = chainMeta[chain]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setDone(true)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl glass-strong p-10 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-yes/15">
          <Check className="size-8 text-yes" />
        </span>
        <h2 className="text-xl font-bold">市场创建成功</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          "{question}" 已{skipReview ? "直接发布到" : "提交到审核队列，待管理员审核后发布到"}
          {chainInfo.label} 网络。
        </p>
        {featured && (
          <span className="inline-flex items-center gap-1 rounded-full bg-chart-4/15 px-3 py-1 text-xs font-medium text-chart-4">
            <Zap className="size-3" />
            已设为精选市场
          </span>
        )}
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => {
              setDone(false)
              setQuestion("")
              setDesc("")
              setDate("")
              setInitialOdds(50)
              setFeatured(false)
            }}
            className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
          >
            再创建一个
          </button>
          <button
            onClick={() => setDone(false)}
            className="h-11 rounded-full glass px-6 text-sm font-semibold"
          >
            查看列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">创建市场</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          管理员直接创建预测市场 · 可跳过审核流程
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* 表单 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-2xl glass-strong p-5 sm:p-6">
          <Field label="事件标题" hint="用是/否问题的形式描述">
            <input
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
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

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="初始 YES 概率 (%)">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="99"
                  value={initialOdds}
                  onChange={(e) => setInitialOdds(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="num w-12 text-center text-lg font-bold">{initialOdds}%</span>
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
          </div>

          <Field label="类别">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {cats.map((c) => {
                const Icon = c.icon
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCat(c.id)}
                    className={cn(
                      "flex h-16 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors",
                      cat === c.id
                        ? "bg-primary text-primary-foreground"
                        : "glass text-muted-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
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
                      "flex h-14 items-center justify-between rounded-xl px-4 text-sm font-semibold transition-colors",
                      active ? "bg-primary/15 ring-1 ring-primary" : "bg-secondary/60",
                    )}
                  >
                    <div className="flex flex-col items-start">
                      <span className={cn(active && m.color)}>{m.short}</span>
                      <span className="text-xs font-normal text-muted-foreground">{m.token} 结算</span>
                    </div>
                    {active && <Check className="size-4 text-primary" />}
                  </button>
                )
              })}
            </div>
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
                    oracle === o
                      ? "bg-primary/15 text-primary ring-1 ring-primary"
                      : "bg-secondary/60 text-foreground",
                  )}
                >
                  {o}
                  {oracle === o && <Check className="size-4" />}
                </button>
              ))}
            </div>
          </Field>

          {/* 管理员专属选项 */}
          <div className="flex flex-col gap-3 rounded-xl bg-secondary/40 p-4">
            <h3 className="text-sm font-bold">管理员选项</h3>
            <label className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">设为精选市场</span>
              <Toggle checked={featured} onChange={setFeatured} />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">跳过审核直接发布</span>
              <Toggle checked={skipReview} onChange={setSkipReview} />
            </label>
          </div>

          <button
            type="submit"
            className="h-13 rounded-xl bg-primary text-base font-bold text-primary-foreground transition-transform active:scale-[0.98]"
          >
            创建市场
          </button>
        </form>

        {/* 预览面板 */}
        <aside className="hidden lg:block">
          <div className="sticky top-22">
            <div className="flex flex-col gap-4 rounded-2xl glass-strong p-5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold">
                  <Eye className="size-4 text-primary" /> 市场预览
                </h3>
                {featured && (
                  <span className="rounded-full bg-chart-4/15 px-2 py-0.5 text-[10px] font-medium text-chart-4">
                    精选
                  </span>
                )}
              </div>
              <p className="text-[15px] font-semibold leading-snug">
                {question || "市场标题预览"}
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">YES 概率</p>
                  <p className="num text-3xl font-bold">{initialOdds}%</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {categoryMeta[cat]?.label || "品类"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 rounded-xl bg-yes/15 flex items-center justify-center text-sm font-bold text-yes">
                  买 YES · {initialOdds}¢
                </div>
                <div className="h-10 rounded-xl bg-no/15 flex items-center justify-center text-sm font-bold text-no">
                  买 NO · {100 - initialOdds}¢
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{chainInfo.label} · {chainInfo.token}</span>
                <span>{oracle}</span>
              </div>
              {desc && (
                <div className="rounded-xl bg-secondary/40 p-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">结算规则: </span>
                  {desc}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
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

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-secondary",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-6 rounded-full bg-white transition-transform",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  )
}
