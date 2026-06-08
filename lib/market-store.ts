/**
 * Market Store — 共享内存数据层
 *
 * 所有市场数据统一在这里管理。
 * 用户创建 → 待审核 → 管理员审批 → 上线展示。
 *
 * 不使用数据库、不使用 Context/Provider，纯模块级变量。
 * 数据在浏览器内存中保持，刷新后恢复。
 */

import { markets as seedMarkets, type Market, type Category, type Chain } from "@/lib/data"

// ─── 类型 ───────────────────────────────────────────────
export type ReviewStatus = "pending" | "approved" | "rejected"

export type StoreMarket = Market & {
  reviewStatus: ReviewStatus
  creator: string
  createdAt: string
  rejectReason?: string
}

export type CreateMarketInput = {
  question: string
  description?: string
  category: Category
  chain: Chain
  endDate: string
  resolution: string
  creator: string
  initialOdds: number
}

// ─── 存储键 ─────────────────────────────────────────────
const STORAGE_KEY = "futurex-markets"

// ─── 初始化 ─────────────────────────────────────────────
function loadMarkets(): StoreMarket[] {
  if (typeof window === "undefined") return buildSeed()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  const seed = buildSeed()
  saveMarkets(seed)
  return seed
}

function buildSeed(): StoreMarket[] {
  return seedMarkets.map((m) => ({
    ...m,
    reviewStatus: "approved" as ReviewStatus,
    creator: "0x0000000000000000000000000000000000000001",
    createdAt: "2025-06-01",
  }))
}

function saveMarkets(list: StoreMarket[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch { /* ignore */ }
}

// ─── 数据 ───────────────────────────────────────────────
let _markets: StoreMarket[] | null = null

function getMarkets(): StoreMarket[] {
  if (!_markets) _markets = loadMarkets()
  return _markets
}

function persist() {
  saveMarkets(getMarkets())
}

// ─── 公开 API ───────────────────────────────────────────

/** 获取所有已通过审核的市场（首页展示用） */
export function getApprovedMarkets(): StoreMarket[] {
  return getMarkets().filter((m) => m.reviewStatus === "approved")
}

/** 获取待审核的市场（审核中心用） */
export function getPendingMarkets(): StoreMarket[] {
  return getMarkets().filter((m) => m.reviewStatus === "pending")
}

/** 获取已拒绝的市场 */
export function getRejectedMarkets(): StoreMarket[] {
  return getMarkets().filter((m) => m.reviewStatus === "rejected")
}

/** 获取全部市场 */
export function getAllMarkets(): StoreMarket[] {
  return getMarkets()
}

/** 根据 ID 查找市场 */
export function getMarketById(id: string): StoreMarket | undefined {
  return getMarkets().find((m) => m.id === id)
}

/** 用户创建预测 → 进入待审核 */
export function createMarket(input: CreateMarketInput): StoreMarket {
  const list = getMarkets()
  const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

  const trend: number[] = []
  let v = input.initialOdds
  for (let i = 0; i < 24; i++) {
    v += (Math.random() - 0.5) * 4
    v = Math.max(5, Math.min(95, v))
    trend.push(Math.round(v))
  }

  const market: StoreMarket = {
    id,
    question: input.question,
    description: input.description,
    category: input.category,
    chain: input.chain,
    yesPrice: input.initialOdds,
    volume: 0,
    liquidity: 500,
    participants: 0,
    endDate: input.endDate,
    resolution: input.resolution,
    trend,
    change24h: 0,
    featured: false,
    status: "active",
    reviewStatus: "pending",
    creator: input.creator,
    createdAt: new Date().toISOString().split("T")[0],
  }

  list.push(market)
  persist()
  return market
}

/** 管理员通过审核 → 市场上线 */
export function approveMarket(id: string): StoreMarket | undefined {
  const list = getMarkets()
  const m = list.find((x) => x.id === id)
  if (m) {
    m.reviewStatus = "approved"
    persist()
  }
  return m
}

/** 管理员拒绝审核 */
export function rejectMarket(id: string, reason: string): StoreMarket | undefined {
  const list = getMarkets()
  const m = list.find((x) => x.id === id)
  if (m) {
    m.reviewStatus = "rejected"
    m.rejectReason = reason
    persist()
  }
  return m
}

/** 管理员删除市场 */
export function deleteMarket(id: string): void {
  const list = getMarkets()
  const idx = list.findIndex((m) => m.id === id)
  if (idx !== -1) {
    list.splice(idx, 1)
    persist()
  }
}

/** 管理员编辑市场 */
export function updateMarket(id: string, data: Partial<StoreMarket>): StoreMarket | undefined {
  const list = getMarkets()
  const m = list.find((x) => x.id === id)
  if (m) {
    Object.assign(m, data)
    persist()
  }
  return m
}

/** 获取审核统计 */
export function getReviewStats() {
  const list = getMarkets()
  return {
    pending: list.filter((m) => m.reviewStatus === "pending").length,
    approved: list.filter((m) => m.reviewStatus === "approved").length,
    rejected: list.filter((m) => m.reviewStatus === "rejected").length,
  }
}

/** 重置为种子数据（调试用） */
export function resetStore() {
  _markets = buildSeed()
  persist()
}
