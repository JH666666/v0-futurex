import { Hono } from "hono"
import { z } from "zod"
import { getUserFullProfile, getUserActivityLogs, getLevelConfig } from "../services/user-profile.service.js"
import { authMiddleware, adminMiddleware } from "../middleware/auth.js"

const profile = new Hono()
profile.use("*", authMiddleware)

// GET /api/user/profile — 用户完整资料
profile.get("/", (c) => {
  const u = c.get("user")
  const data = getUserFullProfile(u.id)
  if (!data) return c.json({ success: false, message: "用户不存在" }, 404)
  return c.json({ success: true, message: "OK", data })
})

// GET /api/user/activities — 行为日志
profile.get("/activities", (c) => {
  const u = c.get("user")
  const type = c.req.query("type")
  const limit = parseInt(c.req.query("limit") || "20")
  const logs = getUserActivityLogs(u.id, type, limit)
  return c.json({ success: true, message: "OK", data: { logs } })
})

// GET /api/user/levels — 等级配置（公开）
profile.get("/levels", (c) => {
  return c.json({ success: true, message: "OK", data: getLevelConfig() })
})

// ─── 管理员 ──────────────────────────────────────────────

// GET /api/admin/users — 所有用户
profile.get("/admin/users", adminMiddleware, (c) => {
  const { getAllUsers } = require("../services/user-profile.service.js")
  const data = getAllUsers({
    search: c.req.query("search") || undefined,
    status: c.req.query("status") || undefined,
    riskLevel: c.req.query("riskLevel") as any || undefined,
    kycStatus: c.req.query("kycStatus") as any || undefined,
  })
  return c.json({ success: true, message: "OK", data })
})

// GET /api/admin/users/:id — 用户详情
profile.get("/admin/users/:id", adminMiddleware, (c) => {
  const user = getUserFullProfile(c.req.param("id"))
  const logs = getUserActivityLogs(c.req.param("id"))
  if (!user) return c.json({ success: false, message: "用户不存在" }, 404)
  return c.json({ success: true, message: "OK", data: { user, logs } })
})

// POST /api/admin/users/:id/kyc — KYC 审核
profile.post("/admin/users/:id/kyc", adminMiddleware, async (c) => {
  const u = c.get("user")
  const body = await c.req.json()
  const schema = z.object({ status: z.enum(["APPROVED", "REJECTED"]) })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return c.json({ success: false, message: "参数错误" }, 400)

  const { reviewKyc } = require("../services/user-profile.service.js")
  const result = reviewKyc(c.req.param("id"), parsed.data.status, u.handle)
  if (!result) return c.json({ success: false, message: "用户不存在" }, 404)
  return c.json({ success: true, message: `KYC ${parsed.data.status}`, data: result })
})

// POST /api/admin/users/:id/risk — 更新风控标签
profile.post("/admin/users/:id/risk", adminMiddleware, async (c) => {
  const u = c.get("user")
  const body = await c.req.json()
  const schema = z.object({ level: z.enum(["normal", "high_risk", "restrict_withdraw", "ban_betting", "blacklist"]), reason: z.string() })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return c.json({ success: false, message: "参数错误" }, 400)

  const { updateRiskTag } = require("../services/user-profile.service.js")
  const result = updateRiskTag(c.req.param("id"), parsed.data.level, parsed.data.reason)
  if (!result) return c.json({ success: false, message: "用户不存在" }, 404)
  return c.json({ success: true, message: "风控标签已更新", data: result })
})

// PUT /api/admin/levels — 更新等级配置
profile.put("/admin/levels", adminMiddleware, async (c) => {
  const body = await c.req.json()
  const { updateLevelConfig } = require("../services/user-profile.service.js")
  const result = updateLevelConfig(body)
  return c.json({ success: true, message: "等级配置已更新", data: result })
})

export { profile }
