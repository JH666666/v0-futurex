import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const orderRepo = {
  async create(data: {
    userId: string; marketId: string; side: "YES" | "NO"; amount: number; price: number
    chain: string; token: string; userWallet: string; txHash: string; shares: number; estimatedReturn: number
  }) {
    return prisma.order.create({ data: { ...data, chain: data.chain as any, side: data.side as any } })
  },

  async findByUser(userId: string) {
    return prisma.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })
  },

  async findAll() {
    return prisma.order.findMany({ orderBy: { createdAt: "desc" } })
  },
}
