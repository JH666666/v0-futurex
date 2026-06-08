import type { Context, Next } from "hono"
import { getUserFromToken } from "../services/auth.service.js"

/** Bearer Token 认证 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ success: false, message: "未提供认证令牌" }, 401)
  }
  const user = getUserFromToken(authHeader.slice(7))
  if (!user) {
    return c.json({ success: false, message: "令牌无效或已过期" }, 401)
  }
  c.set("user", user)
  await next()
}

/** 管理员权限 */
export async function adminMiddleware(c: Context, next: Next) {
  const user = c.get("user")
  if (!user || !["admin", "super_admin", "finance"].includes(user.role)) {
    return c.json({ success: false, message: "权限不足，需要管理员权限" }, 403)
  }
  await next()
}
