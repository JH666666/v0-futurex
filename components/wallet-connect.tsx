"use client"

import { useAccount, useDisconnect } from "wagmi"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useAuth } from "@/lib/auth-context"
import { Wallet, LogOut, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function WalletConnect({ className }: { className?: string }) {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const { openConnectModal } = useConnectModal()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  if (isConnected && address) {
    return (
      <div className={cn("relative", className)}>
        <button onClick={() => setOpen(!open)} className="inline-flex h-11 items-center gap-2 rounded-full glass px-4 text-sm font-semibold">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
            {address.slice(2, 4).toUpperCase()}
          </span>
          <span className="num hidden sm:inline">{address.slice(0, 6)}...{address.slice(-4)}</span>
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-13 z-50 w-56 rounded-2xl glass-strong p-2 shadow-2xl">
              <button onClick={() => { navigator.clipboard?.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1500) }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-accent">
                {copied ? <Check className="size-4 text-yes" /> : <Copy className="size-4 text-muted-foreground" />}
                {copied ? "已复制" : "复制地址"}
              </button>
              <button onClick={disconnect} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-no hover:bg-accent">
                <LogOut className="size-4" /> 断开连接
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={openConnectModal}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95",
        className
      )}
    >
      <Wallet className="size-4" />
      连接钱包
    </button>
  )
}
