/**
 * Referral Store — 5 级邀请返佣系统
 *
 * 一级 30% · 二级 20% · 三级 10% · 四级 5% · 五级 5%
 * 所有数据存入 localStorage，不依赖数据库。
 */

// ─── 类型 ───────────────────────────────────────────────
export type ReferralRelation = {
  userId: string       // 被邀请人
  userHandle: string
  inviterId: string    // 邀请人
  inviterHandle: string
  level: number        // 1=直接, 2=间接...
  createdAt: string
}

export type CommissionRecord = {
  id: string
  fromUserId: string     // 下注的人
  fromUserHandle: string
  toUserId: string       // 获得返佣的人
  toUserHandle: string
  level: number          // 1-5
  rate: number           // 返佣比例 %
  betAmount: number      // 原始下注额
  commissionAmount: number // 返佣金额
  marketQuestion: string
  createdAt: string
}

// ─── 返佣比例 ───────────────────────────────────────────
export const COMMISSION_RATES = [30, 20, 10, 5, 5] // level 1-5

// ─── localStorage ───────────────────────────────────────
const RELATIONS_KEY = "futurex-referrals"
const COMMISSIONS_KEY = "futurex-commissions"

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback } catch { return fallback }
}
function save<T>(key: string, data: T) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

let _relations: ReferralRelation[] | null = null
let _commissions: CommissionRecord[] | null = null

function getRelations(): ReferralRelation[] {
  if (!_relations) _relations = seedRelations()
  return _relations
}
function getCommissions(): CommissionRecord[] {
  if (!_commissions) _commissions = load<CommissionRecord[]>(COMMISSIONS_KEY, [])
  return _commissions
}

// ─── 种子数据 ───────────────────────────────────────────
function seedRelations(): ReferralRelation[] {
  const existing = load<ReferralRelation[]>(RELATIONS_KEY, [])
  if (existing.length > 0) return existing

  // 预置邀请关系链: whale → king → vitalik → degen → alpha → maven
  const chain: ReferralRelation[] = [
    { userId: "king.base", userHandle: "king.base", inviterId: "whale.base", inviterHandle: "whale.base", level: 1, createdAt: "2026-01-10" },
    { userId: "vitalik.base", userHandle: "vitalik.base", inviterId: "king.base", inviterHandle: "king.base", level: 1, createdAt: "2026-01-15" },
    { userId: "degen.base", userHandle: "degen.base", inviterId: "vitalik.base", inviterHandle: "vitalik.base", level: 1, createdAt: "2026-02-01" },
    { userId: "alpha.base", userHandle: "alpha.base", inviterId: "degen.base", inviterHandle: "degen.base", level: 1, createdAt: "2026-02-10" },
    { userId: "maven.base", userHandle: "maven.base", inviterId: "alpha.base", inviterHandle: "alpha.base", level: 1, createdAt: "2026-03-01" },
  ]
  save(RELATIONS_KEY, chain)
  return chain
}

// ─── 公开 API ───────────────────────────────────────────

/** 获取某人的直接邀请列表 */
export function getDirectInvitees(userId: string): ReferralRelation[] {
  return getRelations().filter((r) => r.inviterId === userId)
}

/** 获取某人的邀请人 */
export function getInviter(userId: string): ReferralRelation | undefined {
  return getRelations().find((r) => r.userId === userId)
}

/** 获取某人所有上级（5 级） */
export function getUplineChain(userId: string): ReferralRelation[] {
  const result: ReferralRelation[] = []
  let current = userId
  for (let level = 1; level <= 5; level++) {
    const rel = getRelations().find((r) => r.userId === current)
    if (!rel) break
    result.push({ ...rel, level, inviterId: rel.inviterId, inviterHandle: rel.inviterHandle })
    current = rel.inviterId
  }
  return result
}

/** 获取某人的团队（所有下级，不限层级） */
export function getTeam(userId: string): ReferralRelation[] {
  const all: ReferralRelation[] = []
  function recurse(id: string) {
    const direct = getRelations().filter((r) => r.inviterId === id)
    direct.forEach((r) => {
      all.push(r)
      recurse(r.userId)
    })
  }
  recurse(userId)
  return all
}

/** 统计某人团队规模和总返佣 */
export function getTeamStats(userId: string) {
  const team = getTeam(userId)
  const commissions = getCommissions().filter((c) => c.toUserId === userId)
  const totalCommission = commissions.reduce((s, c) => s + c.commissionAmount, 0)

  return {
    teamSize: team.length,
    directInvites: getDirectInvitees(userId).length,
    totalCommission: Math.round(totalCommission * 100) / 100,
    commissionCount: commissions.length,
  }
}

/** 添加邀请关系 */
export function addReferral(userId: string, userHandle: string, inviterId: string, inviterHandle: string): ReferralRelation | { error: string } {
  const relations = getRelations()
  if (relations.find((r) => r.userId === userId)) return { error: "该用户已有邀请人" }
  if (userId === inviterId) return { error: "不能邀请自己" }

  const rel: ReferralRelation = {
    userId, userHandle, inviterId, inviterHandle,
    level: 1, createdAt: new Date().toISOString(),
  }
  relations.push(rel)
  save(RELATIONS_KEY, relations)
  // 重新加载缓存
  _relations = relations
  return rel
}

/** 下注时触发返佣（由 betting-store 调用） */
export function calculateCommissions(input: {
  betUserId: string
  betUserHandle: string
  betAmount: number
  marketQuestion: string
}): CommissionRecord[] {
  const platformFee = input.betAmount * 0.025 // 2.5% 平台费用于返佣
  const upline = getUplineChain(input.betUserId)
  const commissions = getCommissions()
  const records: CommissionRecord[] = []

  upline.forEach((rel) => {
    const rate = COMMISSION_RATES[rel.level - 1]
    if (!rate) return
    const commissionAmount = Math.round(platformFee * rate / 100 * 100) / 100

    const record: CommissionRecord = {
      id: `cm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fromUserId: input.betUserId,
      fromUserHandle: input.betUserHandle,
      toUserId: rel.inviterId,
      toUserHandle: rel.inviterHandle,
      level: rel.level,
      rate,
      betAmount: input.betAmount,
      commissionAmount,
      marketQuestion: input.marketQuestion,
      createdAt: new Date().toISOString(),
    }
    commissions.push(record)
    records.push(record)
  })

  save(COMMISSIONS_KEY, commissions)
  _commissions = commissions
  return records
}

/** 获取所有返佣记录 */
export function getAllCommissions(): CommissionRecord[] {
  return [...getCommissions()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

/** 获取某人的返佣记录 */
export function getUserCommissions(userId: string): CommissionRecord[] {
  return getCommissions()
    .filter((c) => c.toUserId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

/** 返佣全局统计 */
export function getCommissionStats() {
  const commissions = getCommissions()
  const byLevel = COMMISSION_RATES.map((rate, i) => {
    const levelComms = commissions.filter((c) => c.level === i + 1)
    return {
      level: i + 1,
      rate,
      count: levelComms.length,
      total: levelComms.reduce((s, c) => s + c.commissionAmount, 0),
    }
  })
  return {
    total: commissions.length,
    totalAmount: commissions.reduce((s, c) => s + c.commissionAmount, 0),
    byLevel,
  }
}

/** 获取所有邀请关系 */
export function getAllRelations(): ReferralRelation[] {
  return [...getRelations()]
}

/** 重置 */
export function resetReferrals() {
  _relations = null
  _commissions = null
  save(RELATIONS_KEY, [])
  save(COMMISSIONS_KEY, [])
}
