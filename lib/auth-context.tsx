"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { getNonce, login, setToken, getToken } from "@/lib/api-client"

// ─── Mock 钱包 ──────────────────────────────────────────
export const MOCK_WALLETS = [
  { address: "0x7a3F9C21Ab1234DeF5678901234567890ABCDEF0", label: "vitalik.base (管理员)", role: "admin" },
  { address: "0x2b8D4F12Bb5678CDe9012345678901234ABCDEF02", label: "king.base (用户)", role: "user" },
  { address: "0x9c1A7E33Cc9012DEf345678901234567890ABCDEF03", label: "whale.base (用户)", role: "user" },
]

type AuthUser = {
  walletAddress: string; handle: string; role: string; balance: number
  level?: number; nickname?: string
}

type AuthContextType = {
  user: AuthUser | null
  token: string | null
  loading: boolean
  isAdmin: boolean
  connectMock: (wallet: typeof MOCK_WALLETS[0]) => Promise<void>
  disconnect: () => void
  getAuthHeaders: () => Record<string, string>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // 启动时检查 token
  useEffect(() => {
    const saved = getToken()
    if (saved) {
      setTokenState(saved)
      // 从 token 解析用户信息
      try {
        const parts = saved.split("_")
        if (parts[0] === "jwt" && parts[1] === "mock") {
          const wallet = MOCK_WALLETS.find((w) => w.address.toLowerCase() === saved.split("_mock_")[1]?.toLowerCase())
          if (wallet) {
            setUser({ walletAddress: wallet.address, handle: wallet.label.split(" ")[0], role: wallet.role, balance: 5000 })
          }
        }
      } catch {}
    }
    setLoading(false)
  }, [])

  const connectMock = useCallback(async (wallet: typeof MOCK_WALLETS[0]) => {
    try {
      const nonceRes = await getNonce(wallet.address)
      const loginRes = await login(wallet.address, `mock_signature_${Date.now()}`, nonceRes.data.nonce)
      setTokenState(loginRes.token)
      setUser({
        walletAddress: wallet.address,
        handle: wallet.label.split(" ")[0],
        role: wallet.role,
        balance: loginRes.user?.balance || 5000,
        level: loginRes.user?.level || 1,
        nickname: loginRes.user?.nickname || wallet.label.split(" ")[0],
      })
    } catch (e) {
      console.error("Mock login failed:", e)
    }
  }, [])

  const disconnect = useCallback(() => {
    setToken(null)
    setUser(null)
    setTokenState(null)
  }, [])

  const getAuthHeaders = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {}
  }, [token])

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      isAdmin: user?.role === "admin" || user?.role === "super_admin",
      connectMock, disconnect, getAuthHeaders,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
