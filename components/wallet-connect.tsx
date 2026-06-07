"use client"

import { useState } from "react"
import { Wallet, Check, Copy, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

export function WalletConnect({ className }: { className?: string }) {
  const [connected, setConnected] = useState(false)
  const [open, setOpen] = useState(false)
  const addr = "0x7a3F…9C21"

  if (!connected) {
    return (
      <button
        onClick={() => setConnected(true)}
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

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-11 items-center gap-2 rounded-full glass px-4 text-sm font-semibold"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          B
        </span>
        <span className="num">{addr}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-13 z-50 w-56 rounded-2xl glass-strong p-2 shadow-2xl">
          <div className="px-3 py-2">
            <p className="text-xs text-muted-foreground">Base 网络余额</p>
            <p className="num text-lg font-bold">2,480.50 USDC</p>
          </div>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-accent">
            <Copy className="size-4 text-muted-foreground" /> 复制地址
          </button>
          <button
            onClick={() => {
              setConnected(false)
              setOpen(false)
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-no hover:bg-accent"
          >
            <LogOut className="size-4" /> 断开连接
          </button>
        </div>
      )}
    </div>
  )
}

export function NetworkBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-medium">
      <Check className="size-3 text-yes" />
      Base
    </span>
  )
}
