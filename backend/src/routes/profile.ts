import { Hono } from "hono"
import { z } from "zod"
import { getUserFullProfile, getUserActivityLogs, getLevelConfig, getAllUsers, reviewKyc, updateRiskTag, updateLevelConfig } from "../services/user-profile.service.js"
import { authMiddleware, adminMiddleware } from "../middleware/auth.js"

const profile = new Hono()
profile.use("*", authMiddleware)

// GET /api/user/profile
profile.get("/user/profile", (c) => {
  const u = c.get("user")
  const data = getUserFullProfile(u.id)
  if (!data) return c.json({ success: false, message: "用户不存在" }, 404)
  return c.json({ success: true, message: "OK", data })
})

// GET /api/user/activities
profile.get("/user/activities", (c) => {
  const u = c.get("user")
  const type = c.req.query("type")
  const limit = parseInt(c.req.query("limit") || "20")
  const logs = getUserActivityLogs(u.id, type, limit)
  return c.json({ success: true, message: "OK", data: { logs } })
})

// GET /api/user/levels
profile.get("/user/levels", (c) => {
  return c.json({ success: true, message: "OK", data: getLevelConfig() })
})

// GET /api/admin/users
profile.get("/admin/users", adminMiddleware, async (c) => {
  const data = await getAllUsers({
    search: c.req.query("search") || undefined,
    status: c.req.query("status") || undefined,
    riskLevel: c.req.query("riskLevel") as any || undefined,
    kycStatus: c.req.query("kycStatus") as any || undefined,
  })
  return c.json({ success: true, message: "OK", data })
})

// GET /api/admin/users/:id
profile.get("/admin/users/:id", adminMiddleware, async (c) => {
  const user = await getUserFullProfile(c.req.param("id"))
  const logs = await getUserActivityLogs(c.req.param("id"))
  if (!user) return c.json({ success: false, message: "用户不存在" }, 404)
  return c.json({ success: true, message: "OK", data: { user, logs } })
})

// POST /api/admin/users/:id/kyc
profile.post("/admin/users/:id/kyc", adminMiddleware, async (c) => {
  const u = c.get("user")
  const body = await c.req.json()
  const schema = z.object({ status: z.enum(["APPROVED", "REJECTED"]) })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return c.json({ success: false, message: "参数错误" }, 400)

  const result = await reviewKyc(c.req.param("id"), parsed.data.status, u.handle)
  if (!result) return c.json({ success: false, message: "用户不存在" }, 404)
  return c.json({ success: true, message: `KYC ${parsed.data.status}`, data: result })
})

// POST /api/admin/users/:id/risk
profile.post("/admin/users/:id/risk", adminMiddleware, async (c) => {
  const u = c.get("user")
  const body = await c.req.json()
  const schema = z.object({ level: z.enum(["normal","high_risk","restrict_withdraw","ban_betting","blacklist"]), reason: z.string() })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return c.json({ success: false, message: "参数错误" }, 400)

  const result = await updateRiskTag(c.req.param("id"), parsed.data.level, parsed.data.reason)
  if (!result) return c.json({ success: false, message: "用户不存在" }, 404)
  return c.json({ success: true, message: "风控标签已更新", data: result })
})

// PUT /api/admin/levels
profile.put("/admin/levels", adminMiddleware, async (c) => {
  const body = await c.req.json()
  const result = updateLevelConfig(body)
  return c.json({ success: true, message: "等级配置已更新", data: result })
})

export { profile }
