import { MOCK_MODE } from "../lib/config.js"
import { mockUserProfiles, mockActivityLogs, LEVEL_CONFIG } from "../lib/mock-users.js"
import { userRepo } from "../repositories/user.repository.js"
import { activityRepo } from "../repositories/settlement.repository.js"

export async function getUserFullProfile(userId: string) {
  if (MOCK_MODE) {
    const u = mockUserProfiles.find((u:any)=>u.id===userId)
    if (!u) return null
    return { ...u, levelInfo: LEVEL_CONFIG.find((l:any)=>l.level===u.level) }
  }
  const u = await userRepo.findById(userId)
  if (!u) return null
  return { ...u, levelInfo: LEVEL_CONFIG.find((l:any)=>l.level===u.level) }
}

export async function getUserActivityLogs(userId: string, type?: string, limit=20) {
  if (MOCK_MODE) {
    let logs = mockActivityLogs.filter((l:any)=>l.userId===userId)
    if (type) logs = logs.filter((l:any)=>l.type===type)
    return logs.slice(0, limit)
  }
  try { return await activityRepo.findByUser(userId) } catch { return [] }
}

export async function getAllUsers(query?: any) {
  if (MOCK_MODE) {
    let list = mockUserProfiles
    if (query?.search) { const s=query.search.toLowerCase(); list=list.filter((u:any)=>u.handle.includes(s)||u.walletAddress.toLowerCase().includes(s)) }
    if (query?.status) list=list.filter((u:any)=>u.status===query.status)
    return { users: list, stats: { total: mockUserProfiles.length, active: mockUserProfiles.filter((u:any)=>u.status==="active").length, kycPending: mockUserProfiles.filter((u:any)=>u.kyc.status==="PENDING").length, kycApproved: mockUserProfiles.filter((u:any)=>u.kyc.status==="APPROVED").length, highRisk: mockUserProfiles.filter((u:any)=>u.risk.level!=="normal").length } }
  }
  try { return { users: await userRepo.findAll(query), stats: { total:0,active:0,kycPending:0,kycApproved:0,highRisk:0 } } }
  catch(e) { console.error("DB error:", (e as any).message); return { users:[], stats:{total:0,active:0,kycPending:0,kycApproved:0,highRisk:0}, error: (e as any).message } }
}

export async function reviewKyc(userId: string, status: string, reviewer: string) {
  if (MOCK_MODE) {
    const u = mockUserProfiles.find((u:any)=>u.id===userId)
    if (!u) return null
    u.kyc.status=status; u.kyc.reviewedAt=new Date().toISOString()
    return u
  }
  try { return await userRepo.updateKyc(userId, status) } catch { return null }
}

export async function updateRiskTag(userId: string, level: string, reason: string) {
  if (MOCK_MODE) {
    const u = mockUserProfiles.find((u:any)=>u.id===userId)
    if (!u) return null
    u.risk={level, reason, taggedAt:new Date().toISOString()}
    return u
  }
  try { return await userRepo.updateRisk(userId, level, reason) } catch { return null }
}

export function getLevelConfig() { return LEVEL_CONFIG }
export function updateLevelConfig(levels: typeof LEVEL_CONFIG) { LEVEL_CONFIG.length=0; LEVEL_CONFIG.push(...levels); return LEVEL_CONFIG }
