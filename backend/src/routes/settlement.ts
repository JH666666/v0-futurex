import { Hono } from "hono"
import { z } from "zod"
import { executeSettlement, getSettlements } from "../services/settlement.service.js"
import { authMiddleware, adminMiddleware } from "../middleware/auth.js"

const settlement = new Hono()
settlement.use("*", authMiddleware)
settlement.use("*", adminMiddleware)

// POST /api/settlement/execute
settlement.post("/execute", async (c) => {
  const u = c.get("user")
  const body = await c.req.json()
  const schema = z.object({ marketId: z.string().min(1), outcome: z.enum(["YES", "NO"]) })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return c.json({ success: false, message: "参数错误" }, 400)

  const result = await executeSettlement(parsed.data.marketId, parsed.data.outcome, u.id)
  if ("error" in result) return c.json({ success: false, message: result.error }, 400)

  const s = result.settlement!
  return c.json({
    success: true,
    message: `结算完成：${s.totalPositions} 个持仓，返还 ${s.totalPayout} USDC`,
    data: s,
  })
})

// GET /api/settlement/list
settlement.get("/list", (c) => {
  return c.json({ success: true, message: "OK", data: { settlements: getSettlements() } })
})

export { settlement }
