"use client"
import { useState, useEffect } from "react"
import { Search, Loader2, Shield } from "lucide-react"
import { formatUSDC } from "@/lib/data"
import { cn } from "@/lib/utils"

const API = "https://v0-futurex-production.up.railway.app"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("futurex-api-token")
    const h: any = { "Content-Type": "application/json" }
    if (token) h["Authorization"] = `Bearer ${token}`
    fetch(`${API}/api/admin/users`, { headers: h })
      .then(r => r.json())
      .then(d => setUsers(d.data?.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="flex flex-col gap-6">
      <div><h1 className="text-2xl font-bold">用户管理</h1><p className="text-sm text-muted-foreground">数据来自 Supabase 实时查询 · {users.length} 个用户</p></div>
      <div className="overflow-hidden rounded-2xl glass">
        {users.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">暂无用户数据，用户注册后将自动显示</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
              <th className="p-3">钱包地址</th><th className="p-3">Handle</th><th className="p-3">角色</th><th className="p-3 num">余额</th><th className="p-3">注册时间</th>
            </tr></thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-b border-border/30">
                  <td className="p-3 font-mono text-xs">{u.walletAddress?.slice(0,14)}...</td>
                  <td className="p-3">{u.handle}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3 num">{formatUSDC(Number(u.balance||0))}</td>
                  <td className="p-3 text-muted-foreground">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
