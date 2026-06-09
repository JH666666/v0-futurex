"use client"

import { useAccount, useDisconnect } from "wagmi"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useAuth } from "@/lib/auth-context"
import { Wallet, LogOut, Copy, Check, ArrowRight } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function ConnectPage() {
  const { isConnected, address } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { disconnect } = useDisconnect()
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  if (isConnected && address && user) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-20 sm:px-6 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-yes/15">
          <Check className="size-10 text-yes" />
        </span>
        <h1 className="text-2xl font-bold">已连接</h1>
        <p className="font-mono text-sm text-muted-foreground">{address}</p>
        {user.role === "admin" && (
          <span className="rounded-full bg-chart-4/15 px-3 py-1 text-xs font-medium text-chart-4">管理员钱包</span>
        )}
        <div className="flex gap-3">
          <button onClick={() => { navigator.clipboard?.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
            className="inline-flex h-10 items-center gap-2 rounded-full glass px-4 text-sm">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? "已复制" : "复制地址"}
          </button>
          <button onClick={disconnect} className="inline-flex h-10 items-center gap-2 rounded-full glass px-4 text-sm text-no">
            <LogOut className="size-4" />断开
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">邀请码: FX-{address.slice(2,10).toUpperCase()}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-20 sm:px-6 text-center">
      <Wallet className="size-16 text-muted-foreground" />
      <h1 className="text-2xl font-bold">连接钱包</h1>
      <p className="text-sm text-muted-foreground max-w-xs">
        连接 Web3 钱包以使用 FutureX 预测市场。你的钱包地址就是你唯一的身份。
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {[
          { name: "MetaMask", icon: "🦊" },
          { name: "OKX Wallet", icon: "🟢" },
          { name: "WalletConnect", icon: "🔗" },
          { name: "Coinbase Wallet", icon: "🔵" },
        ].map((w) => (
          <button
            key={w.name}
            onClick={openConnectModal}
            className="flex items-center gap-3 rounded-xl glass px-5 py-4 text-left transition-all hover:border-primary/40"
          >
            <span className="text-xl">{w.icon}</span>
            <span className="flex-1 font-semibold">{w.name}</span>
            <ArrowRight className="size-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  )
}
