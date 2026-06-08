import { MOCK_MODE } from "../lib/config.js"
import { mockReferrals, mockCommissions } from "../lib/mock-data.js"
import { referralRepo, commissionRepo } from "../repositories/settlement.repository.js"

const RATES = [30, 20, 10, 5, 5]

export async function getReferralTree(userId: string) {
  if (MOCK_MODE) {
    const direct = mockReferrals.filter((r:any)=>r.inviterId===userId)
    const comms = mockCommissions.filter((c:any)=>c.toUserId===userId)
    return { teamSize: direct.length, directInvites: direct.length, totalCommission: comms.reduce((s:any,c:any)=>s+c.commissionAmount,0), rates: RATES, commissions: comms }
  }
  try {
    const direct = await referralRepo.findByInviter(userId)
    const comms = await commissionRepo.findByUser(userId)
    return { teamSize: direct.length, directInvites: direct.length, totalCommission: comms.reduce((s:any,c:any)=>s+Number(c.commissionAmount),0), rates: RATES, commissions: comms }
  } catch { return { teamSize: 0, directInvites: 0, totalCommission: 0, rates: RATES, commissions: [] } }
}

export async function getAllCommissions() {
  if (MOCK_MODE) {
    const byLevel = RATES.map((rate,i)=>{ const lc=mockCommissions.filter((c:any)=>c.level===i+1); return { level:i+1, rate, count:lc.length, total:lc.reduce((s:any,c:any)=>s+c.commissionAmount,0) } })
    return { total: mockCommissions.length, totalAmount: mockCommissions.reduce((s:any,c:any)=>s+c.commissionAmount,0), byLevel, commissions: mockCommissions }
  }
  try {
    const all = await commissionRepo.findAll()
    const byLevel = RATES.map((rate,i)=>{ const lc=all.filter((c:any)=>c.level===i+1); return { level:i+1, rate, count:lc.length, total:lc.reduce((s:any,c:any)=>s+Number(c.commissionAmount),0) } })
    return { total: all.length, totalAmount: all.reduce((s:any,c:any)=>s+Number(c.commissionAmount),0), byLevel, commissions: all }
  } catch { return { total: 0, totalAmount: 0, byLevel: [], commissions: [] } }
}
