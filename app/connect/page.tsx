"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Wallet, LogOut, Check, Copy, ChevronRight, Shield } from "lucide-react"
import { useAuth, MOCK_WALLETS } from "@/lib/auth-context"
import { formatUSDC } from "@/lib/data"
import { cn } from "@/lib/utils"

export default function ConnectPage() {
  const { user, connectMock, disconnect } = useAuth()
  const router = useRouter()
  const [connecting, setConnecting] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleConnect(wallet: typeof MOCK_WALLETS[0]) {
    setConnecting(wallet.address)
    await connectMock(wallet)
    setConnecting(null)
  }

  function copyAddress() {
    if (user) { navigator.clipboard?.writeText(user.walletAddress); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  }

  if (user) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl glass-strong p-8 text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-yes/15">
            <Check className="size-10 text-yes" />
          </span>
          <h1 className="text-2xl font-bold">已连接</h1>
          <p className="text-sm text-muted-foreground font-mono">{user.walletAddress}</p>
          {user.role === "admin" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-chart-4/15 px-3 py-1 text-xs font-medium text-chart-4"><Shield className="size-3" />管理员</span>
          )}

          <div className="flex flex-col gap-2 w-full mt-2">
            <div className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-3">
              <span className="text-sm text-muted-foreground">余额</span>
              <span className="num font-bold">{formatUSDC(user.balance)} USDC</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-3">
              <span className="text-sm text-muted-foreground">等级</span>
              <span className="num font-bold">LV{user.level || 1}</span>
            </div>
          </div>

          <div className="flex gap-3 w-full mt-2">
            <button onClick={copyAddress} className="flex-1 h-11 rounded-xl glass text-sm font-semibold inline-flex items-center justify-center gap-1.5">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? "已复制" : "复制地址"}
            </button>
            <button onClick={() => { disconnect(); router.push("/") }} className="flex-1 h-11 rounded-xl bg-no/10 text-sm font-semibold text-no inline-flex items-center justify-center gap-1.5">
              <LogOut className="size-4" />断开连接
            </button>
          </div>

          <button onClick={() => router.push("/")} className="w-full h-11 rounded-xl bg-primary text-sm font-semibold text-primary-foreground mt-1">进入首页</button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">连接钱包</h1>
        <p className="mt-1 text-sm text-muted-foreground">选择一个钱包地址登录 FutureX</p>
      </div>

      <div className="flex flex-col gap-3">
        {MOCK_WALLETS.map((w) => (
          <button
            key={w.address}
            onClick={() => handleConnect(w)}
            disabled={connecting !== null}
            className="flex items-center gap-4 rounded-2xl glass-strong p-5 transition-all hover:border-primary/40 disabled:opacity-50"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15">
              <Wallet className="size-6 text-primary" />
            </span>
            <div className="flex-1 text-left">
              <p className="font-bold">{w.label}</p>
              <p className="font-mono text-xs text-muted-foreground">{w.address.slice(0, 14)}...{w.address.slice(-4)}</p>
            </div>
            {w.role === "admin" && <span className="rounded-full bg-chart-4/15 px-2 py-0.5 text-[10px] font-medium text-chart-4">管理员</span>}
            <ChevronRight className="size-5 text-muted-foreground" />
          </button>
        ))}

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/30" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">开发模式 · Mock 钱包</span></div>
        </div>
      </div>

      {connecting && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          正在连接 {connecting.slice(0, 10)}...
        </div>
      )}
    </div>
  )
}
