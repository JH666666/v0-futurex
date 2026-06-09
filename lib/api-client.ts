/**
 * FutureX API Client v1.0
 *
 * 前端统一数据接入层。
 * 所有页面通过这里调用后端 API，不直接读写 mock-data / store。
 *
 * Mock 模式：前端 → Backend API (Mock) → Mock Data
 * 生产模式：前端 → Backend API → PostgreSQL
 *
 * 切换方式：只需修改 API_BASE_URL，前端代码无需改动。
 */

// ─── 配置 ───────────────────────────────────────────────
// 生产通过 Vercel 环境变量 NEXT_PUBLIC_API_URL 设置
// 开发默认 http://localhost:4000/api
// 前端无需修改代码即可切换

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://v0-futurex-production.up.railway.app/api"

// Token 管理
let _token: string | null = null
if (typeof window !== "undefined") {
  _token = localStorage.getItem("futurex-api-token")
}

export function setToken(token: string | null) {
  _token = token
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("futurex-api-token", token)
    else localStorage.removeItem("futurex-api-token")
  }
}

export function getToken() { return _token }

// ─── 通用请求 ───────────────────────────────────────────
async function request<T>(method: string, path: string, body?: any): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (_token) headers["Authorization"] = `Bearer ${_token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const json = await res.json()
  if (!json.success) {
    throw new ApiError(json.message || "Unknown error", res.status)
  }
  return json
}

// ─── 类型 ───────────────────────────────────────────────
export type ApiResponse<T> = { success: boolean; message: string; data: T; meta?: any }

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) { super(message); this.status = status }
}

export type Market = {
  id: string; question: string; description?: string; category: string; chain: string
  yesPrice: number; volume: number; liquidity: number; participants: number
  endDate: string; resolutionSource: string; outcome: string | null
  status: string; featured: boolean; creatorId: string; createdAt: string
}

export type Order = {
  id: string; userId: string; userWallet: string; marketId: string; side: string
  amount: number; price: number; chain: string; token: string
  txHash: string; shares: number; estimatedReturn: number
  status: string; createdAt: string; marketQuestion: string
}

export type Position = {
  id: string; marketId: string; marketQuestion: string; side: string
  totalAmount: number; avgPrice: number; shares: number
  currentPrice: number; pnl: number; status: string
}

export type Withdrawal = {
  id: string; userId: string; userWallet: string; chain: string; token: string
  amount: number; fee: number; netAmount: number; toAddress: string
  status: string; isLarge: boolean; txHash: string | null; createdAt: string
}

export type ReferralTree = {
  teamSize: number; directInvites: number; totalCommission: number
  rates: number[]; commissions: any[]
}

export type FinanceOverview = {
  betting: { totalBetAmount: number; totalOrders: number }
  wallet: { totalBalance: number; totalFrozen: number }
  withdrawal: { pendingAmount: number; approvedAmount: number }
  commission: { total: number; byLevel: any[] }
  treasury: { totalInflow: number; totalOutflow: number }
}

// ─── Auth API ───────────────────────────────────────────

export async function getNonce(walletAddress: string) {
  return request<{ nonce: string; message: string }>("POST", "/auth/wallet", { walletAddress })
}

export async function login(walletAddress: string, signature: string, nonce: string) {
  const res = await request<{ token: string; user: any }>("POST", "/auth/login", { walletAddress, signature, nonce })
  setToken(res.data.token)
  return res.data
}

// ─── Market API ─────────────────────────────────────────

export async function getMarkets(params?: {
  category?: string; chain?: string; status?: string; featured?: boolean
  search?: string; page?: number; perPage?: number
}) {
  const qs = new URLSearchParams()
  if (params?.category) qs.set("category", params.category)
  if (params?.chain) qs.set("chain", params.chain)
  if (params?.status) qs.set("status", params.status)
  if (params?.featured) qs.set("featured", "true")
  if (params?.search) qs.set("search", params.search)
  if (params?.page) qs.set("page", String(params.page))
  if (params?.perPage) qs.set("perPage", String(params.perPage))
  const q = qs.toString()
  return request<Market[]>("GET", `/markets${q ? "?" + q : ""}`)
}

export async function getMarket(id: string) {
  return request<Market>("GET", `/markets/${id}`)
}

export async function createMarket(data: {
  question: string; description?: string; category: string
  chain: string; endDate: string; resolutionSource: string
}) {
  return request<any>("POST", "/markets/create", data)
}

// ─── Order API ──────────────────────────────────────────

export async function createOrder(data: {
  marketId: string; side: "YES" | "NO"; amount: number
  price: number; chain?: "base" | "bsc"
}) {
  return request<{ order: Order; wallet: { balance: number; frozenBalance: number } }>(
    "POST", "/orders/create", data
  )
}

export async function getMyOrders() {
  return request<{ orders: Order[] }>("GET", "/orders/my")
}

// ─── Portfolio / Position API ───────────────────────────

export async function getPortfolio() {
  const [positionsRes, ordersRes] = await Promise.all([
    request<{ positions: Position[] }>("GET", "/user/positions"),
    getMyOrders(),
  ])
  const positions = positionsRes.data.positions

  // 计算组合统计
  const openPositions = positions.filter((p) => p.status === "open")
  const totalValue = openPositions.reduce((s, p) => s + p.shares * (p.currentPrice / 100), 0)
  const totalPnl = openPositions.reduce((s, p) => s + p.pnl, 0)
  const totalInvested = openPositions.reduce((s, p) => s + p.totalAmount, 0)

  return {
    positions,
    orders: ordersRes.data.orders,
    stats: {
      totalValue,
      totalPnl,
      totalInvested,
      positionCount: openPositions.length,
      roi: totalInvested > 0 ? Math.round((totalPnl / totalInvested) * 1000) / 10 : 0,
    },
  }
}

// ─── Withdrawal API ─────────────────────────────────────

export async function withdrawRequest(data: {
  amount: number; toAddress: string; chain: "base" | "bsc"
}) {
  return request<Withdrawal>("POST", "/withdraw/request", data)
}

export async function getMyWithdrawals() {
  return request<{ withdrawals: Withdrawal[] }>("GET", "/withdraw/my")
}

// ─── Referral API ───────────────────────────────────────

export async function getReferralTree() {
  return request<ReferralTree>("GET", "/referrals/tree")
}

// ─── Finance API ────────────────────────────────────────

export async function getFinanceOverview() {
  return request<FinanceOverview>("GET", "/finance/overview")
}

// ─── Health ─────────────────────────────────────────────

export async function getHealth() {
  return request<{ status: string; mockMode: boolean; timestamp: string }>("GET", "/health")
}

// ─── User Profile ───────────────────────────────────────

export async function getDashboardStats() {
  return request<any>("GET", "/admin/dashboard")
}

export async function getAllOrdersFromAPI() {
  return request<any>("GET", "/admin/dashboard")
}

export async function getUserFullProfile() {
  return request<any>("GET", "/user/profile")
}

export async function getUserActivities(type?: string) {
  const q = type ? `?type=${type}` : ""
  return request<{ logs: any[] }>("GET", `/user/activities${q}`)
}

export async function getLevelConfig() {
  return request<any[]>("GET", "/user/levels")
}

// ─── Admin Users ────────────────────────────────────────

export async function getAdminUsers(params?: {
  search?: string; status?: string; riskLevel?: string; kycStatus?: string
}) {
  const qs = new URLSearchParams()
  if (params?.search) qs.set("search", params.search)
  if (params?.status) qs.set("status", params.status)
  if (params?.riskLevel) qs.set("riskLevel", params.riskLevel)
  if (params?.kycStatus) qs.set("kycStatus", params.kycStatus)
  const q = qs.toString()
  return request<any>("GET", `/admin/users${q ? "?" + q : ""}`)
}

export async function getAdminUserDetail(userId: string) {
  return request<{ user: any; logs: any[] }>("GET", `/admin/users/${userId}`)
}

export async function reviewUserKyc(userId: string, status: "APPROVED" | "REJECTED") {
  return request<any>("POST", `/admin/users/${userId}/kyc`, { status })
}

export async function updateUserRisk(userId: string, level: string, reason: string) {
  return request<any>("POST", `/admin/users/${userId}/risk`, { level, reason })
}

export async function updateLevels(levels: any[]) {
  return request<any>("PUT", "/admin/levels", levels)
}
