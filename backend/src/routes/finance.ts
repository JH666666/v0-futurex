import { Hono } from "hono"
import { getFinanceOverview } from "../services/finance.service.js"
import { authMiddleware, adminMiddleware } from "../middleware/auth.js"

const finance = new Hono()
finance.use("*", authMiddleware)
finance.use("*", adminMiddleware)

// GET /api/finance/overview
finance.get("/overview", (c) => {
  const data = getFinanceOverview()
  return c.json({ success: true, message: "OK", data })
})

export { finance }
