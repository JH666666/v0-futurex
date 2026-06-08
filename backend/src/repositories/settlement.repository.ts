import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export const settlementRepo = {
  async findAll() { return prisma.settlement.findMany({ orderBy: { settledAt: "desc" } }) },
  async create(data: { marketId: string; outcome: string; totalPositions: number; totalPayout: number; totalFrozen: number; settledBy: string }) {
    return prisma.settlement.create({ data: { ...data, outcome: data.outcome as any } })
  },
  async findPositionsByMarket(marketId: string) {
    return prisma.position.findMany({ where: { marketId, status: "open" } })
  },
  async settlePosition(id: string, payout: number, outcome: string) {
    return prisma.position.update({ where: { id }, data: { status: "settled", settledOutcome: outcome as any, settledReturn: payout, pnl: { decrement: 0 } } })
  },
  async updateUserBalance(userId: string, balanceChange: number, frozenChange: number) {
    return prisma.user.update({ where: { id: userId }, data: { balance: { increment: balanceChange }, frozenBalance: { increment: frozenChange } } })
  },
}

export const referralRepo = {
  async findAll() { return prisma.referral.findMany() },
  async findByInviter(inviterId: string) { return prisma.referral.findMany({ where: { inviterId } }) },
  async create(data: { userId: string; inviterId: string; level: number }) {
    return prisma.referral.create({ data })
  },
}

export const commissionRepo = {
  async findAll() { return prisma.commission.findMany({ orderBy: { createdAt: "desc" } }) },
  async findByUser(userId: string) { return prisma.commission.findMany({ where: { toUserId: userId }, orderBy: { createdAt: "desc" } }) },
  async create(data: { fromUserId: string; toUserId: string; orderId: string; level: number; rate: number; betAmount: number; commissionAmount: number; marketQuestion: string }) {
    return prisma.commission.create({ data })
  },
}

export const treasuryRepo = {
  async findAll() { return prisma.treasuryRecord.findMany({ orderBy: { createdAt: "desc" } }) },
  async create(data: { type: string; chain: string; token: string; amount: number; fromAddress?: string; toAddress?: string; status: string; note?: string }) {
    return prisma.treasuryRecord.create({ data: { ...data, chain: data.chain as any } })
  },
}

export const activityRepo = {
  async findByUser(userId: string) { return prisma.activityLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }) },
  async create(data: { userId: string; type: string; detail: string; amount?: number }) {
    return prisma.activityLog.create({ data })
  },
}
