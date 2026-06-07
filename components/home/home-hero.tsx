import Link from "next/link"
import { ArrowRight, Zap, ShieldCheck } from "lucide-react"

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl glass-strong">
      <div className="absolute inset-0">
        <img
          src="/worldcup-hero.png"
          alt="2026 世界杯体育场夜景"
          className="size-full object-cover opacity-55"
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
      </div>

      <div className="relative flex flex-col gap-6 px-6 py-10 sm:px-10 sm:py-16">
        <span className="inline-flex w-fit items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-semibold">
          <Zap className="size-3.5 text-yes" />
          FIFA 世界杯 2026 · 已开盘
        </span>

        <h1 className="max-w-2xl text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
          预测世界杯，
          <br />
          <span className="text-primary">用 USDC 链上结算</span>
        </h1>

        <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          基于 Base 网络的去中心化预测市场。买入 YES 或 NO，赔率由市场实时定价，结果由预言机自动结算。
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/world-cup"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
          >
            进入世界杯中心
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/create"
            className="inline-flex h-12 items-center gap-2 rounded-full glass px-6 text-sm font-semibold"
          >
            创建预测
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-yes" />
            预言机自动结算
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
              B
            </span>
            Base 主网
          </span>
          <span className="num">总锁仓 $42.8M</span>
        </div>
      </div>
    </section>
  )
}
