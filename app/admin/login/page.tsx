"use client"

import { useAccount } from "wagmi"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Shield, Wallet } from "lucide-react"

export default function AdminLoginPage() {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { user, isAdmin } = useAuth()
  const router = useRouter()

  if (user && isAdmin) { router.push("/admin"); return null }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-20 text-center">
      <Shield className="size-16 text-chart-4" />
      <h1 className="text-2xl font-bold">管理员登录</h1>
      <p className="text-sm text-muted-foreground">连接管理员钱包以进入后台</p>

      {isConnected ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl glass p-6">
          <p className="text-sm text-no">当前钱包无管理员权限</p>
        </div>
      ) : (
        <button
          onClick={openConnectModal}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground"
        >
          <Wallet className="size-4" />连接钱包
        </button>
      )}
    </div>
  )
}
