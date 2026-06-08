/**
 * Betting Store — 下注 + 结算系统
 *
 * 下单 → 冻结资金 → 订单 → 持仓 → 结算 → 返还余额。
 * 所有数据存入 localStorage，不依赖数据库。
 */

import { type Chain } from "@/lib/data"
import { getApprovedMarkets } from "@/lib/market-store"
import { freezeFunds, settleFunds, unfreezeFunds } from "@/lib/wallet-store"
import { calculateCommissions } from "@/lib/referral-store"

// ─── 类型 ───────────────────────────────────────────────
export type OrderSide = "YES" | "NO"
export type OrderStatus = "filled" | "cancelled"
export type PositionStatus = "open" | "settled" | "closed"

export type Order = {
  id: string
  marketId: string
  marketQuestion: string
  chain: Chain
  userId: string
  side: OrderSide
  amount: number
  price: number
  shares: number
  estimatedReturn: number
  status: OrderStatus
  createdAt: string
}

export type Position = {
  marketId: string
  marketQuestion: string
  chain: Chain
  userId: string
  side: OrderSide
  totalAmount: number
  avgPrice: number
  shares: number
  currentPrice: number
  pnl: number
  status: PositionStatus
  settledOutcome?: "YES" | "NO"
  settledReturn?: number
}

// ─── localStorage ───────────────────────────────────────
const ORDERS_KEY = "futurex-orders-v2"
const POSITIONS_KEY = "futurex-positions-v2"

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback } catch { return fallback }
}
function save<T>(key: string, data: T) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

let _orders: Order[] | null = null
let _positions: Position[] | null = null

function getOrders(): Order[] {
  if (!_orders) _orders = load<Order[]>(ORDERS_KEY, [])
  return _orders
}
function getPositions(): Position[] {
  if (!_positions) _positions = load<Position[]>(POSITIONS_KEY, [])
  return _positions
}

// ─── 公开 API: 下注 ─────────────────────────────────────

/** 下注：冻结余额 → 创建订单 → 聚合持仓 */
export function placeBet(input: {
  marketId: string
  marketQuestion: string
  chain: Chain
  userId: string
  side: OrderSide
  amount: number
  price: number
}): { order: Order; position: Position; wallet: ReturnType<typeof freezeFunds> } | { error: string } {
  // 冻结资金
  const wallet = freezeFunds(input.userId, input.amount)
  if (!wallet) return { error: "余额不足，请充值后再试" }

  const orders = getOrders()
  const positions = getPositions()

  const shares = (input.amount * 100) / input.price
  const estimatedReturn = shares

  const order: Order = {
    id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    marketId: input.marketId,
    marketQuestion: input.marketQuestion,
    chain: input.chain,
    userId: input.userId,
    side: input.side,
    amount: input.amount,
    price: input.price,
    shares: Math.round(shares * 100) / 100,
    estimatedReturn: Math.round(estimatedReturn * 100) / 100,
    status: "filled",
    createdAt: new Date().toISOString(),
  }
  orders.push(order)

  // 触发 5 级返佣
  calculateCommissions({
    betUserId: input.userId,
    betUserHandle: input.userId,
    betAmount: input.amount,
    marketQuestion: input.marketQuestion,
  })

  // 聚合持仓
  const existingIdx = positions.findIndex(
    (p) => p.marketId === input.marketId && p.side === input.side && p.userId === input.userId && p.status === "open"
  )

  if (existingIdx >= 0) {
    const p = positions[existingIdx]
    const newTotal = p.totalAmount + input.amount
    p.avgPrice = Math.round(((p.avgPrice * p.totalAmount) + (input.price * input.amount)) / newTotal)
    p.totalAmount = newTotal
    p.shares += order.shares
    p.currentPrice = input.price
    p.pnl = calcPnl(p.shares, p.avgPrice, p.currentPrice, p.side)
  } else {
    positions.push({
      marketId: input.marketId,
      marketQuestion: input.marketQuestion,
      chain: input.chain,
      userId: input.userId,
      side: input.side,
      totalAmount: input.amount,
      avgPrice: input.price,
      shares: order.shares,
      currentPrice: input.price,
      pnl: 0,
      status: "open",
    })
  }

  save(ORDERS_KEY, orders)
  save(POSITIONS_KEY, positions)

  const position = positions.find(
    (p) => p.marketId === input.marketId && p.side === input.side && p.userId === input.userId
  )!

  return { order, position, wallet }
}

// ─── 公开 API: 结算 ─────────────────────────────────────

/** 管理员结算市场 */
export function settleMarket(
  marketId: string,
  outcome: "YES" | "NO"
): { settled: number; totalPayout: number; totalFrozen: number } {
  const positions = getPositions()
  const marketPositions = positions.filter((p) => p.marketId === marketId && p.status === "open")

  let totalPayout = 0
  let totalFrozen = 0

  marketPositions.forEach((p) => {
    const isWinner = p.side === outcome
    // 赢家: 每份额值 $1，输家: $0
    const payout = isWinner ? p.shares : 0

    totalFrozen += p.totalAmount
    totalPayout += payout

    // 更新持仓状态
    p.status = "settled"
    p.settledOutcome = outcome
    p.settledReturn = payout
    p.pnl = payout - p.totalAmount
    p.currentPrice = outcome === "YES" ? 100 : 0

    // 返还用户余额
    settleFunds(p.userId, p.totalAmount, payout)
  })

  save(POSITIONS_KEY, positions)
  // 标记已结算订单（冻结已释放）
  const orders = getOrders()
  orders
    .filter((o) => o.marketId === marketId && o.status === "filled")
    .forEach((o) => {
      o.status = "filled" // 保持filled，但冻结已在settleFunds中释放
    })
  save(ORDERS_KEY, orders)

  return {
    settled: marketPositions.length,
    totalPayout: Math.round(totalPayout * 100) / 100,
    totalFrozen: Math.round(totalFrozen * 100) / 100,
  }
}

// ─── 公开 API: 查询 ─────────────────────────────────────

export function getUserOrders(userId: string): Order[] {
  return getOrders()
    .filter((o) => o.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getAllOrders(): Order[] {
  return [...getOrders()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getUserPositions(userId: string): Position[] {
  const allMarkets = getApprovedMarkets()
  return getPositions()
    .filter((p) => p.userId === userId)
    .map((p) => {
      const market = allMarkets.find((m) => m.id === p.marketId)
      const currentPrice = p.status === "settled"
        ? p.currentPrice
        : market?.yesPrice ?? p.currentPrice
      const pnl = p.status === "settled"
        ? (p.settledReturn ?? 0) - p.totalAmount
        : calcPnl(p.shares, p.avgPrice, currentPrice, p.side)
      return { ...p, currentPrice, pnl }
    })
}

export function getAllPositions(): Position[] {
  const allMarkets = getApprovedMarkets()
  return getPositions().map((p) => {
    const market = allMarkets.find((m) => m.id === p.marketId)
    const currentPrice = p.status === "settled"
      ? p.currentPrice
      : market?.yesPrice ?? p.currentPrice
    const pnl = p.status === "settled"
      ? (p.settledReturn ?? 0) - p.totalAmount
      : calcPnl(p.shares, p.avgPrice, currentPrice, p.side)
    return { ...p, currentPrice, pnl }
  })
}

export function getPortfolioStats(userId: string) {
  const positions = getUserPositions(userId)
  const openPositions = positions.filter((p) => p.status === "open" && p.shares > 0)
  const totalValue = openPositions.reduce((s, p) => s + p.shares * (p.currentPrice / 100), 0)
  const totalPnl = openPositions.reduce((s, p) => s + p.pnl, 0)
  const totalInvested = openPositions.reduce((s, p) => s + p.totalAmount, 0)
  return {
    totalValue: Math.round(totalValue * 100) / 100,
    totalPnl: Math.round(totalPnl * 100) / 100,
    totalInvested,
    positionCount: openPositions.length,
    roi: totalInvested > 0 ? Math.round((totalPnl / totalInvested) * 1000) / 10 : 0,
  }
}

/** 全局统计（财务后台用） */
export function getGlobalStats() {
  const orders = getOrders()
  const positions = getPositions()
  const filledOrders = orders.filter((o) => o.status === "filled")
  const settledPositions = positions.filter((p) => p.status === "settled")

  const totalBetAmount = filledOrders.reduce((s, o) => s + o.amount, 0)
  const totalPayout = settledPositions.reduce((s, p) => s + (p.settledReturn ?? 0), 0)
  const totalFrozenBets = settledPositions.reduce((s, p) => s + p.totalAmount, 0)
  const platformRevenue = totalFrozenBets - totalPayout // 输家资金归平台
  const userProfits = Math.max(0, totalPayout - totalFrozenBets)

  // active markets with bets
  const activeMarketIds = new Set(
    positions.filter((p) => p.status === "open").map((p) => p.marketId)
  )

  return {
    totalBetAmount: Math.round(totalBetAmount * 100) / 100,
    totalPayout: Math.round(totalPayout * 100) / 100,
    platformRevenue: Math.round(platformRevenue * 100) / 100,
    userProfits: Math.round(userProfits * 100) / 100,
    totalOrders: orders.length,
    totalPositions: positions.length,
    activePositions: positions.filter((p) => p.status === "open").length,
    settledPositions: settledPositions.length,
    activeMarketsWithBets: activeMarketIds.size,
  }
}

export function cancelOrder(orderId: string): Order | undefined {
  const orders = getOrders()
  const order = orders.find((o) => o.id === orderId)
  if (order && order.status === "filled") {
    order.status = "cancelled"
    save(ORDERS_KEY, orders)

    const positions = getPositions()
    const posIdx = positions.findIndex(
      (p) => p.marketId === order.marketId && p.side === order.side && p.userId === order.userId && p.status === "open"
    )
    if (posIdx >= 0) {
      positions[posIdx].shares -= order.shares
      if (positions[posIdx].shares <= 0) {
        positions[posIdx].status = "closed"
      }
      save(POSITIONS_KEY, positions)
    }

    // 解冻资金
    unfreezeFunds(order.userId, order.amount)
  }
  return order
}

export function resetBetting() {
  _orders = []
  _positions = []
  save(ORDERS_KEY, [])
  save(POSITIONS_KEY, [])
}

function calcPnl(shares: number, avgPrice: number, currentPrice: number, side: OrderSide): number {
  if (side === "YES") {
    return Math.round((shares * (currentPrice - avgPrice) / 100) * 100) / 100
  }
  return Math.round((shares * ((100 - currentPrice) - (100 - avgPrice)) / 100) * 100) / 100
}
