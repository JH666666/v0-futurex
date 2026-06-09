"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi"
import { getNonce, login, setToken } from "@/lib/api-client"

type AuthUser = { walletAddress: string; handle: string; role: string; balance: number; level?: number }
type AuthContextType = {
  user: AuthUser | null; token: string | null; loading: boolean; isAdmin: boolean
  connectWallet: () => void; disconnect: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Auto-login when wallet connects
  useEffect(() => {
    const saved = localStorage.getItem("futurex-api-token")
    if (saved && isConnected && address) {
      setTokenState(saved)
      setUser({ walletAddress: address, handle: `${address.slice(2,10)}.base`, role: "user", balance: 5000, level: 1 })
      setLoading(false)
      return
    }
    if (!isConnected) { setUser(null); setTokenState(null); setLoading(false); return }
    // SIWE: Sign-In With Ethereum
    if (address) {
      getNonce(address).then(async (res) => {
        try {
          const sig = await signMessageAsync({ message: res.data.message })
          const loginRes = await login(address, sig, res.data.nonce)
          setToken(loginRes.token)
          setTokenState(loginRes.token)
          setUser({ walletAddress: address, handle: `${address.slice(2,10)}.base`, role: loginRes.user?.role || "user", balance: loginRes.user?.balance || 5000, level: loginRes.user?.level || 1 })
        } catch { setUser({ walletAddress: address, handle: `${address.slice(2,10)}.base`, role: "user", balance: 5000, level: 1 }) }
      }).catch(() => setUser({ walletAddress: address, handle: `${address.slice(2,10)}.base`, role: "user", balance: 5000, level: 1 }))
      .finally(() => setLoading(false))
    }
  }, [address, isConnected])

  const connectWallet = useCallback(() => {
    if (connectors[0]) connect({ connector: connectors[0] })
  }, [connectors, connect])

  const disconnect = useCallback(() => {
    wagmiDisconnect()
    setToken(null)
    setUser(null)
    setTokenState(null)
  }, [wagmiDisconnect])

  return (
    <AuthContext.Provider value={{ user, token, loading, isAdmin: user?.role === "admin", connectWallet, disconnect }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be within AuthProvider")
  return ctx
}
