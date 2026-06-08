import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const marketRepo = {
  async findAll(params?: { category?: string; chain?: string; status?: string; search?: string; page?: number; perPage?: number }) {
    const where: any = {}
    if (params?.category) where.category = params.category
    if (params?.chain) where.chain = params.chain
    if (params?.status) where.status = params.status
    return prisma.market.findMany({
      where,
      include: { creator: { select: { handle: true } } },
      orderBy: { createdAt: "desc" },
      skip: ((params?.page || 1) - 1) * (params?.perPage || 20),
      take: params?.perPage || 20,
    })
  },

  async findById(id: string) {
    return prisma.market.findUnique({ where: { id }, include: { creator: { select: { handle: true } } } })
  },

  async create(data: any) {
    return prisma.market.create({ data })
  },

  async update(id: string, data: any) {
    return prisma.market.update({ where: { id }, data })
  },
}
