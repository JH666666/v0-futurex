import { prisma } from "./lib/db.js"
import { MOCK_MODE } from "../lib/config.js"
import { mockMarkets, mockOrders, mockUsers } from "../lib/mock-data.js"
import { userRepo } from "../repositories/user.repository.js"

export async function getDashboardStats() {
  if (MOCK_MODE) {
    return {
      totalMarkets: mockMarkets.length,
      totalUsers: mockUsers.length,
      totalOrders: mockOrders.length,
      totalVolume: mockOrders.reduce((s:any,o:any)=>s+o.amount,0),
      users: mockUsers.map((u:any) => ({ id: u.id, walletAddress: u.walletAddress, handle: u.handle, role: u.role || "user", balance: u.balance, createdAt: u.createdAt })),
    }
  }
  try {
    const [marketCount, userCount, orderCount, volumeResult, users] = await Promise.all([
      prisma.market.count(),
      prisma.user.count(),
      prisma.order.count({ where: { status: "filled" } }),
      prisma.order.aggregate({ _sum: { amount: true }, where: { status: "filled" } }),
      userRepo.findAll(),
    ])
    return {
      totalMarkets: marketCount,
      totalUsers: userCount,
      totalOrders: orderCount,
      totalVolume: Number(volumeResult._sum.amount || 0),
      users: (users || []).map((u: any) => ({
        id: u.id, walletAddress: u.walletAddress, handle: u.handle,
        role: u.role, balance: Number(u.balance || 0), createdAt: u.createdAt,
      })),
    }
  } catch (e) {
    console.error("Dashboard query failed:", e)
    return { totalMarkets: 0, totalUsers: 0, totalOrders: 0, totalVolume: 0, users: [], error: String(e) }
  }
}
