import { prisma } from "./lib/db.js"
import { MOCK_MODE } from "../lib/config.js"
import { mockMarkets, mockOrders, mockUsers } from "../lib/mock-data.js"


export async function getDashboardStats() {
  if (MOCK_MODE) {
    return {
      totalMarkets: mockMarkets.length,
      totalUsers: mockUsers.length,
      totalOrders: mockOrders.length,
      totalVolume: mockOrders.reduce((s:any,o:any)=>s+o.amount,0),
      featuredCount: mockMarkets.filter((m:any)=>m.featured).length,
    }
  }
  try {
    const [marketCount, userCount, orderCount, volumeResult] = await Promise.all([
      prisma.market.count(),
      prisma.user.count(),
      prisma.order.count({ where: { status: "filled" } }),
      prisma.order.aggregate({ _sum: { amount: true }, where: { status: "filled" } }),
    ])
    return {
      totalMarkets: marketCount,
      totalUsers: userCount,
      totalOrders: orderCount,
      totalVolume: Number(volumeResult._sum.amount || 0),
    }
  } catch (e) {
    console.error("Dashboard query failed:", e)
    return { totalMarkets: 0, totalUsers: 0, totalOrders: 0, totalVolume: 0, error: "Database query failed" }
  }
}
