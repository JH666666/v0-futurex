import { prisma } from "../lib/db.js"


export const withdrawRepo = {
  async create(data: {
    userId: string; userWallet: string; chain: string; token: string
    amount: number; fee: number; netAmount: number; toAddress: string
    status: string; isLarge: boolean; txHash?: string | null
  }) {
    return prisma.withdrawal.create({
      data: { ...data, chain: data.chain as any, status: data.status as any },
    })
  },

  async findByUser(userId: string) {
    return prisma.withdrawal.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })
  },

  async findAll(params?: { status?: string }) {
    const where: any = {}
    if (params?.status) where.status = params.status
    return prisma.withdrawal.findMany({ where, orderBy: { createdAt: "desc" } })
  },

  async updateStatus(id: string, status: string, reviewedBy?: string) {
    return prisma.withdrawal.update({
      where: { id },
      data: { status: status as any, reviewedBy, reviewedAt: new Date() },
    })
  },
}
