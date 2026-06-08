import { Hono } from "hono"
import { getUserProfile, getUserPositions } from "../services/user.service.js"
import { authMiddleware } from "../middleware/auth.js"

const user = new Hono()
user.use("*", authMiddleware)

// GET /api/user/profile
user.get("/profile", (c) => {
  const u = c.get("user")
  const profile = getUserProfile(u.id)
  if (!profile) return c.json({ success: false, message: "用户不存在" }, 404)
  return c.json({ success: true, message: "OK", data: profile })
})

// GET /api/user/positions
user.get("/positions", (c) => {
  const u = c.get("user")
  const positions = getUserPositions(u.id)
  return c.json({ success: true, message: "OK", data: { positions } })
})

export { user }
