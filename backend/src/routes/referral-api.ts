import { Hono } from "hono"
import { getReferralStats, calculateCommission } from "../services/referral-api.service.js"
import { authMiddleware } from "../middleware/auth.js"

const referralApi = new Hono()
referralApi.use("*", authMiddleware)

referralApi.get("/stats", async (c) => {
  const u = c.get("user")
  const stats = await getReferralStats(u.id)
  return c.json({ success: true, data: stats })
})

referralApi.get("/commissions", async (c) => {
  const u = c.get("user")
  const { prisma } = await import("../lib/db.js")
  try {
    const commissions = await prisma.commission.findMany({
      where: { toUserId: u.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    return c.json({ success: true, data: commissions })
  } catch { return c.json({ success: true, data: [] }) }
})

export { referralApi }
