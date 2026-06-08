/**
 * Withdrawal Store — 提现系统
 *
 * 用户提现 → 自动审核(≤阈值) / 人工审核(>阈值) → 余额扣除 → 记录
 * 所有数据存入 localStorage，不依赖数据库。
 */

import { type Chain } from "@/lib/data"
import { getWallet, withdrawFunds } from "@/lib/wallet-store"

// ─── 类型 ───────────────────────────────────────────────
export type WithdrawalStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAID"

export type Withdrawal = {
  id: string
  userId: string
  userHandle: string
  chain: Chain
  token: string
  amount: number        // 提现金额
  fee: number           // 手续费
  netAmount: number     // 到账金额
  toAddress: string
  status: WithdrawalStatus
  isLarge: boolean      // > 自动审核阈值
  rejectReason?: string
  requestedAt: string
  reviewedAt?: string
  reviewedBy?: string
}

// ─── 设置 ───────────────────────────────────────────────
const SETTINGS_KEY = "futurex-withdraw-settings"

export type WithdrawSettings = {
  autoApproveLimit: number   // 自动审核阈值
  minWithdrawAmount: number  // 最小提现金额
  withdrawFee: number        // 提现手续费 (固定)
}

const defaultSettings: WithdrawSettings = {
  autoApproveLimit: 100,
  minWithdrawAmount: 10,
  withdrawFee: 2,
}

export function getWithdrawSettings(): WithdrawSettings {
  if (typeof window === "undefined") return defaultSettings
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings
  } catch { return defaultSettings }
}

export function saveWithdrawSettings(s: WithdrawSettings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)) } catch {}
}

// ─── localStorage ───────────────────────────────────────
const WITHDRAWALS_KEY = "futurex-withdrawals"

function load(): Withdrawal[] {
  if (typeof window === "undefined") return []
  try { const r = localStorage.getItem(WITHDRAWALS_KEY); return r ? JSON.parse(r) : [] } catch { return [] }
}
function persist(list: Withdrawal[]) {
  try { localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(list)) } catch {}
}

let _cache: Withdrawal[] | null = null
function getAll(): Withdrawal[] {
  if (!_cache) _cache = load()
  return _cache
}

// ─── 公开 API ───────────────────────────────────────────

/** 用户提交提现申请 */
export function requestWithdrawal(input: {
  userId: string
  userHandle: string
  amount: number
  toAddress: string
  chain: Chain
  token: string
}): Withdrawal | { error: string } {
  const settings = getWithdrawSettings()

  if (input.amount < settings.minWithdrawAmount) {
    return { error: `最小提现金额为 ${settings.minWithdrawAmount} USDT` }
  }

  // 检查余额
  const wallet = getWallet(input.userId)
  if (wallet.balance < input.amount + settings.withdrawFee) {
    return { error: `余额不足（需要 $${input.amount + settings.withdrawFee}，当前 $${wallet.balance}）` }
  }

  const isLarge = input.amount > settings.autoApproveLimit
  const netAmount = input.amount - settings.withdrawFee

  const record: Withdrawal = {
    id: `wd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: input.userId,
    userHandle: input.userHandle,
    chain: input.chain,
    token: input.token,
    amount: input.amount,
    fee: settings.withdrawFee,
    netAmount,
    toAddress: input.toAddress,
    status: isLarge ? "PENDING" : "APPROVED",
    isLarge,
    requestedAt: new Date().toISOString(),
  }

  // 自动审核(≤阈值)：直接扣余额
  if (!isLarge) {
    withdrawFunds(input.userId, input.amount)
    record.status = "PAID"
  }
  // 人工审核(>阈值)：不扣余额，等管理员审批

  const list = getAll()
  list.push(record)
  persist(list)
  return record
}

/** 管理员审批通过 */
export function approveWithdrawal(id: string, reviewer: string): Withdrawal | { error: string } {
  const list = getAll()
  const record = list.find((r) => r.id === id)
  if (!record) return { error: "提现记录不存在" }
  if (record.status !== "PENDING") return { error: "该提现不在待审核状态" }

  // 扣余额
  const wallet = getWallet(record.userId)
  if (wallet.balance < record.amount) {
    return { error: `用户余额不足（需要 $${record.amount}，当前 $${wallet.balance}）` }
  }

  withdrawFunds(record.userId, record.amount)
  record.status = "PAID"
  record.reviewedAt = new Date().toISOString()
  record.reviewedBy = reviewer
  persist(list)
  return record
}

/** 管理员拒绝 */
export function rejectWithdrawal(id: string, reason: string, reviewer: string): Withdrawal | { error: string } {
  const list = getAll()
  const record = list.find((r) => r.id === id)
  if (!record) return { error: "提现记录不存在" }
  if (record.status !== "PENDING") return { error: "该提现不在待审核状态" }

  record.status = "REJECTED"
  record.rejectReason = reason
  record.reviewedAt = new Date().toISOString()
  record.reviewedBy = reviewer
  persist(list)
  return record
}

/** 获取用户提现记录 */
export function getUserWithdrawals(userId: string): Withdrawal[] {
  return getAll()
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
}

/** 获取所有提现记录（管理后台） */
export function getAllWithdrawals(): Withdrawal[] {
  return [...getAll()].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
}

/** 获取待审核提现 */
export function getPendingWithdrawals(): Withdrawal[] {
  return getAll().filter((r) => r.status === "PENDING")
}

/** 提现统计 */
export function getWithdrawalStats() {
  const list = getAll()
  return {
    total: list.length,
    pending: list.filter((r) => r.status === "PENDING").length,
    approved: list.filter((r) => r.status === "APPROVED" || r.status === "PAID").length,
    rejected: list.filter((r) => r.status === "REJECTED").length,
    totalPendingAmount: list.filter((r) => r.status === "PENDING").reduce((s, r) => s + r.amount, 0),
    totalApprovedAmount: list.filter((r) => r.status === "APPROVED" || r.status === "PAID").reduce((s, r) => s + r.amount, 0),
    totalRejectedAmount: list.filter((r) => r.status === "REJECTED").reduce((s, r) => s + r.amount, 0),
    totalFees: list.filter((r) => r.status !== "REJECTED").reduce((s, r) => s + r.fee, 0),
  }
}

/** 重置 */
export function resetWithdrawals() {
  _cache = []
  persist([])
}
