import { Hono } from "hono"
import { z } from "zod"
import { requestWithdrawal, approveWithdrawal, getWithdrawals } from "../services/withdrawal.service.js"
import { authMiddleware, adminMiddleware } from "../middleware/auth.js"

const withdraw = new Hono()
withdraw.use("*", authMiddleware)

// POST /api/withdraw/request
withdraw.post("/request", async (c) => {
  const u = c.get("user")
  const body = await c.req.json()
  const schema = z.object({
    amount: z.number().positive(),
    toAddress: z.string().min(42).max(42),
    chain: z.enum(["base", "bsc"]),
  })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return c.json({ success: false, message: "参数错误" }, 400)

  const result = await requestWithdrawal({ ...parsed.data, userId: u.id })
  if ("error" in result) return c.json({ success: false, message: result.error }, 400)

  const w = result.withdrawal!
  return c.json({
    success: true,
    message: w.status === "PAID" ? "提现成功，已自动到账" : "提现已提交，等待审核",
    data: w,
  })
})

// GET /api/withdraw/my
withdraw.get("/my", (c) => {
  const u = c.get("user")
  const list = getWithdrawals({ userId: u.id })
  return c.json({ success: true, message: "OK", data: { withdrawals: list } })
})

// POST /api/withdraw/approve
withdraw.post("/approve", adminMiddleware, async (c) => {
  const u = c.get("user")
  const body = await c.req.json()
  const schema = z.object({ withdrawalId: z.string().min(1) })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return c.json({ success: false, message: "参数错误" }, 400)

  const result = await approveWithdrawal(parsed.data.withdrawalId, u.id)
  if ("error" in result) return c.json({ success: false, message: result.error }, 400)

  return c.json({ success: true, message: "提现已通过", data: result.withdrawal })
})

export { withdraw }
