"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Wallet, LogOut, Copy, Check } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { formatUSDC } from "@/lib/data"
import { cn } from "@/lib/utils"

export function WalletConnect({ className }: { className?: string }) {
  const { user, disconnect } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!user) {
    return (
      <button
        onClick={() => router.push("/connect")}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95",
          className,
        )}
      >
        <Wallet className="size-4" />
        连接钱包
      </button>
    )
  }

  function copyAddress() {
    navigator.clipboard?.writeText(user!.walletAddress)
    setCopied(true); setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className={cn("relative", className)}>
      <button onClick={() => setOpen((o) => !o)} className="inline-flex h-11 items-center gap-2 rounded-full glass px-4 text-sm font-semibold">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
          {user.walletAddress.slice(2, 4).toUpperCase()}
        </span>
        <span className="num hidden sm:inline">{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-13 z-50 w-56 rounded-2xl glass-strong p-2 shadow-2xl">
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground">已连接钱包</p>
              <p className="num text-lg font-bold">{formatUSDC(user.balance || 0)} USDC</p>
              <p className="text-[10px] text-muted-foreground">LV{user.level || 1}</p>
            </div>
            <button onClick={copyAddress} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-accent">
              {copied ? <Check className="size-4 text-yes" /> : <Copy className="size-4 text-muted-foreground" />}
              {copied ? "已复制" : "复制地址"}
            </button>
            <button
              onClick={() => { disconnect(); setOpen(false); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-no hover:bg-accent"
            >
              <LogOut className="size-4" /> 断开连接
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function NetworkBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-medium">
      <Check className="size-3 text-yes" /> Base
    </span>
  )
}
