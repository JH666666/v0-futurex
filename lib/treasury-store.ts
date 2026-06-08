/**
 * Treasury Store — 资金池架构
 *
 * 管理收款地址、出款合约、资金流监控。
 * 用于后台资金池仪表盘，为未来链上版本预留字段。
 * 所有数据存入 localStorage，不依赖数据库/合约。
 */

import { type Chain } from "@/lib/data"

// ══════════════════════════════════════════════════════════
// 类型定义
// ══════════════════════════════════════════════════════════

/** 链级资金配置 */
export type ChainTreasuryConfig = {
  chain: Chain
  collectionAddress: string      // 收款地址 (EOA 或合约)
  paymentContractAddress: string // 出款合约地址
  tokenAddress: string           // 结算代币合约地址
  tokenSymbol: string            // 代币符号
}

/** 资金流记录 */
export type TreasuryTransaction = {
  id: string
  type: "inflow" | "outflow"
  amount: number
  token: string
  from?: string
  to?: string
  txHash?: string       // 预留：未来链上交易哈希
  status: "confirmed" | "pending" | "failed"
  note: string
  createdAt: string
}

/** 全局资金池状态（模拟数据，实际应来自链上查询） */
export type TreasuryState = {
  todayInflow: number
  todayOutflow: number
  pendingWithdrawals: number
  contractBalance: number     // 出款合约余额
  reserveBalance: number      // 准备金
  lastUpdated: string
}

// ══════════════════════════════════════════════════════════
// 默认配置
// ══════════════════════════════════════════════════════════

const defaultConfigs: ChainTreasuryConfig[] = [
  {
    chain: "base",
    collectionAddress: "0xCol1ectBase00000000000000000000000000000001",
    paymentContractAddress: "0xPaymentBase000000000000000000000000000000001",
    tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
    tokenSymbol: "USDC",
  },
  {
    chain: "bsc",
    collectionAddress: "0xCol1ectBNB0000000000000000000000000000000001",
    paymentContractAddress: "0xPaymentBNB0000000000000000000000000000000001",
    tokenAddress: "0x55d398326f99059fF775485246999027B3197955", // USDT on BSC
    tokenSymbol: "USDT",
  },
]

const defaultState: TreasuryState = {
  todayInflow: 42800,
  todayOutflow: 12100,
  pendingWithdrawals: 8750,
  contractBalance: 524000,
  reserveBalance: 100000,
  lastUpdated: new Date().toISOString(),
}

// ══════════════════════════════════════════════════════════
// localStorage
// ══════════════════════════════════════════════════════════

const CONFIG_KEY = "futurex-treasury-config"
const TX_KEY = "futurex-treasury-tx"
const STATE_KEY = "futurex-treasury-state"

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback } catch { return fallback }
}
function persist<T>(key: string, data: T) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

let _configs: ChainTreasuryConfig[] | null = null
let _txs: TreasuryTransaction[] | null = null
let _state: TreasuryState | null = null

function getConfigs(): ChainTreasuryConfig[] {
  if (!_configs) _configs = load(CONFIG_KEY, defaultConfigs)
  return _configs
}
function getTxs(): TreasuryTransaction[] {
  if (!_txs) _txs = seedTransactions()
  return _txs
}
function getState(): TreasuryState {
  if (!_state) _state = load(STATE_KEY, defaultState)
  return _state
}

function seedTransactions(): TreasuryTransaction[] {
  const existing = load<TreasuryTransaction[]>(TX_KEY, [])
  if (existing.length > 0) return existing

  const now = new Date()
  const mock: TreasuryTransaction[] = [
    { id: "tx-1", type: "inflow", amount: 15000, token: "USDC", from: "0xuser1...", to: "0xCol1ectBase...", status: "confirmed", note: "用户下注收款", createdAt: new Date(now.getTime() - 3600000 * 3).toISOString() },
    { id: "tx-2", type: "inflow", amount: 8900, token: "USDC", from: "0xuser2...", to: "0xCol1ectBase...", status: "confirmed", note: "用户下注收款", createdAt: new Date(now.getTime() - 3600000 * 5).toISOString() },
    { id: "tx-3", type: "outflow", amount: 5000, token: "USDC", from: "0xPaymentBase...", to: "0xuser3...", status: "confirmed", note: "自动提现打款", createdAt: new Date(now.getTime() - 3600000 * 2).toISOString() },
    { id: "tx-4", type: "inflow", amount: 22000, token: "USDT", from: "0xuser4...", to: "0xCol1ectBNB...", status: "confirmed", note: "用户下注收款", createdAt: new Date(now.getTime() - 3600000 * 4).toISOString() },
    { id: "tx-5", type: "outflow", amount: 3100, token: "USDT", from: "0xPaymentBNB...", to: "0xuser5...", status: "pending", note: "大额提现待打款", createdAt: new Date(now.getTime() - 3600000).toISOString() },
  ]
  persist(TX_KEY, mock)
  return mock
}

// ══════════════════════════════════════════════════════════
// 公开 API
// ══════════════════════════════════════════════════════════

/** 获取某条链的资金配置 */
export function getTreasuryConfig(chain: Chain): ChainTreasuryConfig | undefined {
  return getConfigs().find((c) => c.chain === chain)
}

/** 获取所有链的资金配置 */
export function getAllTreasuryConfigs(): ChainTreasuryConfig[] {
  return getConfigs()
}

/** 更新某条链的资金配置 */
export function updateTreasuryConfig(chain: Chain, data: Partial<ChainTreasuryConfig>): ChainTreasuryConfig {
  const configs = getConfigs()
  const idx = configs.findIndex((c) => c.chain === chain)
  if (idx >= 0) {
    configs[idx] = { ...configs[idx], ...data }
  } else {
    configs.push({ chain, collectionAddress: "", paymentContractAddress: "", tokenAddress: "", tokenSymbol: "", ...data })
  }
  _configs = configs
  persist(CONFIG_KEY, configs)
  return configs[idx >= 0 ? idx : configs.length - 1]
}

/** 获取资金流记录 */
export function getTreasuryTransactions(filter?: { type?: "inflow" | "outflow"; limit?: number }): TreasuryTransaction[] {
  let list = [...getTxs()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  if (filter?.type) list = list.filter((t) => t.type === filter.type)
  if (filter?.limit) list = list.slice(0, filter.limit)
  return list
}

/** 添加资金流记录 */
export function addTreasuryTransaction(tx: Omit<TreasuryTransaction, "id" | "createdAt">): TreasuryTransaction {
  const txs = getTxs()
  const record: TreasuryTransaction = {
    ...tx,
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  }
  txs.push(record)
  _txs = txs
  persist(TX_KEY, txs)

  // 更新当日统计
  const state = getState()
  if (tx.type === "inflow") state.todayInflow += tx.amount
  else state.todayOutflow += tx.amount
  state.lastUpdated = new Date().toISOString()
  _state = state
  persist(STATE_KEY, state)

  return record
}

/** 获取资金池总览状态 */
export function getTreasuryState(): TreasuryState {
  return { ...getState() }
}

/** 更新资金池状态（模拟链上余额变化） */
export function updateTreasuryState(data: Partial<TreasuryState>): TreasuryState {
  const state = getState()
  Object.assign(state, data, { lastUpdated: new Date().toISOString() })
  _state = state
  persist(STATE_KEY, state)
  return state
}

/** 风险检查 */
export type RiskAlert = {
  level: "low" | "medium" | "high" | "critical"
  message: string
  detail: string
}

export function getRiskAlerts(): RiskAlert[] {
  const state = getState()
  const alerts: RiskAlert[] = []

  const fundingGap = state.pendingWithdrawals - state.contractBalance
  if (fundingGap > 0) {
    alerts.push({
      level: fundingGap > 50000 ? "critical" : "high",
      message: `资金缺口: ${fundingGap.toLocaleString()} USDC`,
      detail: `待提现 $${state.pendingWithdrawals.toLocaleString()} 超出合约余额 $${state.contractBalance.toLocaleString()}，请立即补充出款合约`,
    })
  }

  if (state.contractBalance < state.pendingWithdrawals * 1.5) {
    alerts.push({
      level: "medium",
      message: "合约余额偏低",
      detail: `建议保持合约余额至少为待提现金额的 1.5 倍`,
    })
  }

  if (state.todayOutflow > state.todayInflow * 0.8) {
    alerts.push({
      level: "medium",
      message: "今日出款/收款比例过高",
      detail: `出款 $${state.todayOutflow.toLocaleString()} / 收款 $${state.todayInflow.toLocaleString()}`,
    })
  }

  if (state.reserveBalance < 50000) {
    alerts.push({
      level: "low",
      message: "准备金低于 $50,000",
      detail: "建议补充准备金以应对突发大额提现",
    })
  }

  return alerts
}

/** 重置 */
export function resetTreasury() {
  _configs = null
  _txs = null
  _state = null
  persist(CONFIG_KEY, defaultConfigs)
  persist(TX_KEY, [])
  persist(STATE_KEY, defaultState)
}
