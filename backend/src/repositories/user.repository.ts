/**
 * User Repository — Real Mode 数据库操作
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const userRepo = {
  async findByWallet(walletAddress: string) {
    return prisma.user.findUnique({ where: { walletAddress } })
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  },

  async create(data: { walletAddress: string; handle: string; referralCode: string; role?: string }) {
    return prisma.user.create({
      data: {
        walletAddress: data.walletAddress,
        handle: data.handle,
        referralCode: data.referralCode,
        role: (data.role as any) || "user",
        balance: 5000,
        totalDeposited: 5000,
      },
    })
  },

  async updateBalance(id: string, balance: number, frozenBalance: number) {
    return prisma.user.update({ where: { id }, data: { balance, frozenBalance } })
  },

  async findAll(params?: { search?: string; status?: string; riskLevel?: string }) {
    const where: any = {}
    if (params?.status) where.status = params.status
    return prisma.user.findMany({ where, orderBy: { createdAt: "desc" } })
  },

  async updateKyc(id: string, status: string) {
    return prisma.user.update({ where: { id }, data: { kycStatus: status as any, kycReviewedAt: new Date() } })
  },

  async updateRisk(id: string, level: string, reason: string) {
    return prisma.user.update({ where: { id }, data: { riskLevel: level as any, riskReason: reason, riskTaggedAt: new Date() } })
  },
}
