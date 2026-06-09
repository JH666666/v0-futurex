"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import { Wallet, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function ConnectPage() {
  const { isConnected } = useAccount()
  const { user, disconnect } = useAuth()

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-20 sm:px-6 text-center">
      <Wallet className="size-16 text-muted-foreground" />
      <h1 className="text-2xl font-bold">连接钱包</h1>
      <p className="text-sm text-muted-foreground">使用 Web3 钱包登录 FutureX 预测市场</p>

      {isConnected && user ? (
        <div className="flex flex-col items-center gap-4 w-full rounded-2xl glass p-6">
          <p className="font-mono text-sm">{user.walletAddress?.slice(0,14)}...{user.walletAddress?.slice(-4)}</p>
          <p className="text-xs text-muted-foreground">已自动登录 · 邀请码 FX-{user.walletAddress?.slice(2,10).toUpperCase()}</p>
          <button onClick={disconnect} className="inline-flex h-10 items-center gap-2 rounded-full glass px-4 text-sm font-semibold text-no">
            <LogOut className="size-4" />断开连接
          </button>
        </div>
      ) : (
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      )}
    </div>
  )
}
