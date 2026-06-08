"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Wallet, ChevronRight } from "lucide-react"
import { useAuth, MOCK_WALLETS } from "@/lib/auth-context"

export default function AdminLoginPage() {
  const { user, connectMock, isAdmin } = useAuth()
  const router = useRouter()
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState("")

  async function handleConnect(wallet: typeof MOCK_WALLETS[0]) {
    setConnecting(true); setError("")
    await connectMock(wallet)
    setConnecting(false)

    // 等状态更新后检查权限
    setTimeout(() => {
      if (wallet.role === "admin") {
        router.push("/admin")
      } else {
        setError("该钱包无管理员权限，请使用管理员钱包登录")
      }
    }, 500)
  }

  // 已登录且是管理员 → 直接跳转
  if (user && isAdmin) {
    router.push("/admin")
    return null
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-20 sm:px-6">
      <div className="text-center">
        <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-chart-4/15 mb-4">
          <Shield className="size-8 text-chart-4" />
        </span>
        <h1 className="text-2xl font-bold">管理员登录</h1>
        <p className="mt-1 text-sm text-muted-foreground">使用管理员钱包签名登录后台</p>
      </div>

      {error && (
        <div className="rounded-xl bg-no/10 px-4 py-3 text-sm text-no text-center">{error}</div>
      )}

      <div className="flex flex-col gap-3">
        {MOCK_WALLETS.filter((w) => w.role === "admin").map((w) => (
          <button
            key={w.address}
            onClick={() => handleConnect(w)}
            disabled={connecting}
            className="flex items-center gap-4 rounded-2xl glass-strong p-5 transition-all hover:border-chart-4/40 disabled:opacity-50"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-chart-4/15">
              <Shield className="size-6 text-chart-4" />
            </span>
            <div className="flex-1 text-left">
              <p className="font-bold">{w.label}</p>
              <p className="font-mono text-xs text-muted-foreground">{w.address.slice(0, 14)}...{w.address.slice(-4)}</p>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" />
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        普通用户请前往 <a href="/connect" className="text-primary underline">/connect</a> 登录
      </p>

      {connecting && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          签名验证中...
        </div>
      )}
    </div>
  )
}
