import { prisma } from "../lib/db.js"
import { MOCK_MODE } from "../lib/config.js"
import { mockReferrals, mockCommissions } from "../lib/mock-data.js"

const RATES = [30, 20, 10, 5, 5]

export async function generateInviteCode(walletAddress: string): Promise<string> {
  // Auto-generate: FX- + first 8 chars of wallet
  return `FX-${walletAddress.slice(2, 10).toUpperCase()}`
}

export async function processReferral(newUserId: string, newUserWallet: string, inviteCode?: string) {
  if (!inviteCode) return null

  if (MOCK_MODE) {
    const inviter = mockReferrals.find((r: any) => r.userId === inviteCode)
    if (inviter) mockReferrals.push({ id: `ref-${Date.now()}`, userId: newUserId, inviterId: inviter.inviterId, level: 1, createdAt: new Date().toISOString() })
    return null
  }

  try {
    // Find inviter by invite code
    const inviter = await prisma.user.findFirst({
      where: { referralCode: inviteCode }
    })
    if (!inviter || inviter.id === newUserId) return null

    // Check if already referred
    const existing = await prisma.referral.findFirst({ where: { userId: newUserId } })
    if (existing) return null

    // Create referral
    await prisma.referral.create({
      data: { userId: newUserId, inviterId: inviter.id, level: 1 }
    })
    // Update inviter's referral code on the new user
    await prisma.user.update({
      where: { id: newUserId },
      data: { referredBy: inviter.id }
    })
    return { inviterId: inviter.id, inviterHandle: inviter.handle }
  } catch (e) {
    console.error("processReferral error:", e)
    return null
  }
}

export async function calculateCommission(input: {
  betUserId: string, betAmount: number, marketQuestion: string, orderId: string
}) {
  if (MOCK_MODE) return []

  try {
    const commissions: any[] = []
    let currentUserId = input.betUserId

    for (let level = 1; level <= 5; level++) {
      const ref = await prisma.referral.findFirst({ where: { userId: currentUserId } })
      if (!ref) break

      const rate = RATES[level - 1]
      const platformFee = input.betAmount * 0.025
      const amount = Math.round(platformFee * rate / 100 * 100) / 100

      if (amount > 0) {
        const comm = await prisma.commission.create({
          data: {
            fromUserId: input.betUserId,
            toUserId: ref.inviterId,
            orderId: input.orderId,
            level, rate,
            betAmount: input.betAmount,
            commissionAmount: amount,
            marketQuestion: input.marketQuestion,
          }
        })
        commissions.push(comm)
      }
      currentUserId = ref.inviterId
    }
    return commissions
  } catch (e) {
    console.error("calculateCommission error:", e)
    return []
  }
}

export async function getReferralStats(userId: string) {
  try {
    const [directCount, teamCount] = await Promise.all([
      prisma.referral.count({ where: { inviterId: userId } }),
      prisma.referral.count({ where: { inviterId: userId } }),
    ])
    const commissions = await prisma.commission.aggregate({
      _sum: { commissionAmount: true },
      where: { toUserId: userId }
    })
    return {
      directInvites: directCount,
      teamSize: teamCount,
      totalCommission: Number(commissions._sum.commissionAmount || 0),
    }
  } catch { return { directInvites: 0, teamSize: 0, totalCommission: 0 } }
}
