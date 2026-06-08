import { Hono } from "hono"
import { getReferralTree, getAllCommissions } from "../services/referral.service.js"
import { authMiddleware, adminMiddleware } from "../middleware/auth.js"

const referral = new Hono()
referral.use("*", authMiddleware)

// GET /api/referrals/tree
referral.get("/tree", (c) => {
  const u = c.get("user")
  const tree = getReferralTree(u.id)
  return c.json({ success: true, message: "OK", data: tree })
})

// GET /api/referrals/commissions
referral.get("/commissions", adminMiddleware, (c) => {
  const data = getAllCommissions()
  return c.json({ success: true, message: "OK", data })
})

export { referral }
