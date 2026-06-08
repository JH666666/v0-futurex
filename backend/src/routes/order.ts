import { Hono } from "hono"
import { z } from "zod"
import { createOrder, getUserOrders } from "../services/order.service.js"
import { authMiddleware } from "../middleware/auth.js"

const order = new Hono()
order.use("*", authMiddleware)

// POST /api/orders/create
order.post("/create", async (c) => {
  const u = c.get("user")
  const body = await c.req.json()
  const schema = z.object({
    marketId: z.string().min(1),
    side: z.enum(["YES", "NO"]),
    amount: z.number().positive(),
    price: z.number().min(1).max(99),
    chain: z.enum(["base", "bsc"]).optional(),
  })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return c.json({ success: false, message: "参数错误" }, 400)

  const result = createOrder({ ...parsed.data, userId: u.id })
  if ("error" in result) return c.json({ success: false, message: result.error }, 400)

  return c.json({ success: true, message: "下注成功", data: result })
})

// GET /api/orders/my
order.get("/my", (c) => {
  const u = c.get("user")
  const orders = getUserOrders(u.id)
  return c.json({ success: true, message: "OK", data: { orders } })
})

export { order }
