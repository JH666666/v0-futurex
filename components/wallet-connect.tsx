"use client"

import { useAuth } from "@/lib/auth-context"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { cn } from "@/lib/utils"

export function WalletConnect({ className }: { className?: string }) {
  const { user } = useAuth()

  if (user) {
    return (
      <span className={cn("font-mono text-xs text-muted-foreground", className)}>
        {user.walletAddress?.slice(0,8)}...{user.walletAddress?.slice(-4)}
      </span>
    )
  }

  return (
    <div className={cn(className)}>
      <ConnectButton label="连接钱包" />
    </div>
  )
}
