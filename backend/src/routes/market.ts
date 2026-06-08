import { Hono } from "hono"
import { z } from "zod"
import { getMarkets, getMarketById, createMarket, getReviews, approveReview } from "../services/market.service.js"
import { authMiddleware, adminMiddleware } from "../middleware/auth.js"

const market = new Hono()

// GET /api/markets
market.get("/", async (c) => {
  const result = await getMarkets({
    category: c.req.query("category"),
    chain: c.req.query("chain"),
    status: c.req.query("status") || "active",
    featured: c.req.query("featured") === "true" ? true : undefined,
    search: c.req.query("search"),
    page: parseInt(c.req.query("page") || "1"),
    perPage: parseInt(c.req.query("perPage") || "20"),
  })
  return c.json({ success: true, message: "OK", data: result.markets, meta: result.meta })
})

// GET /api/markets/:id
market.get("/:id", (c) => {
  const m = getMarketById(c.req.param("id"))
  if (!m) return c.json({ success: false, message: "市场不存在" }, 404)
  return c.json({ success: true, message: "OK", data: m })
})

// POST /api/markets/create
market.post("/create", authMiddleware, async (c) => {
  const u = c.get("user")
  const body = await c.req.json()
  const schema = z.object({
    question: z.string().min(5),
    description: z.string().optional(),
    category: z.enum(["worldcup","crypto","ai","politics","finance","entertainment"]),
    chain: z.enum(["base","bsc"]),
    endDate: z.string(),
    resolutionSource: z.string().min(1),
  })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return c.json({ success: false, message: "参数错误" }, 400)

  const m = createMarket({ ...parsed.data, creatorId: u.id })
  return c.json({ success: true, message: "市场已提交审核", data: m })
})

// POST /api/markets/review
market.post("/review", authMiddleware, adminMiddleware, (c) => {
  const result = getReviews({})
  return c.json({ success: true, message: "OK", data: result })
})

// POST /api/markets/approve
market.post("/approve", authMiddleware, adminMiddleware, async (c) => {
  const u = c.get("user")
  const body = await c.req.json()
  const schema = z.object({ reviewId: z.string().min(1) })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return c.json({ success: false, message: "参数错误" }, 400)

  const review = approveReview(parsed.data.reviewId, u.id)
  if (!review) return c.json({ success: false, message: "审核记录不存在" }, 404)
  return c.json({ success: true, message: "审核已通过", data: review })
})

export { market }
