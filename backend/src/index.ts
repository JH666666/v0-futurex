/**
 * FutureX API Server v1.0
 *
 * 技术栈: Hono + Prisma + Zod
 * Mock Mode 默认开启 — 无需数据库
 *
 * 登录: 仅 Sign Message 钱包签名
 * 结算: USDC (Base) / USDT (BSC)
 * 精度: Decimal(36,18)
 */

import "dotenv/config"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { serve } from "@hono/node-server"
import { config } from "./lib/config.js"

import { auth } from "./routes/auth.js"
import { user } from "./routes/user.js"
import { market } from "./routes/market.js"
import { order } from "./routes/order.js"
import { settlement } from "./routes/settlement.js"
import { withdraw } from "./routes/withdraw.js"
import { referral } from "./routes/referral.js"
import { finance } from "./routes/finance.js"
import { profile } from "./routes/profile.js"
import { referralApi } from "./routes/referral-api.js"
import { getDashboardStats } from "./services/dashboard.service.js"

const app = new Hono()

app.use("*", cors())
app.use("*", logger())

// ─── 健康检查 ──────────────────────────────────────────
app.get("/api/health", (c) =>
  c.json({ status: "ok", service: "futurex-api", mockMode: config.mockMode })
)

// ─── 路由挂载 ──────────────────────────────────────────
app.route("/api/auth", auth)
app.route("/api/user", user)
app.route("/api/markets", market)
app.route("/api/orders", order)
app.route("/api/settlement", settlement)
app.route("/api/withdraw", withdraw)
app.route("/api/referrals", referral)
app.route("/api/referral", referralApi)
app.route("/api/finance", finance)

app.get("/api/admin/dashboard", async (c) => {
  const stats = await getDashboardStats()
  // Debug: direct query test
  try {
    const { prisma } = await import("./lib/db.js")
    const rawUsers = await prisma.user.findMany()
    console.log("Direct prisma.user.findMany:", rawUsers.length, "users")
    stats.users = rawUsers.map((u: any) => ({
      id: u.id, walletAddress: u.walletAddress, handle: u.handle,
      role: u.role, balance: Number(u.balance || 0), createdAt: u.createdAt,
    }))
  } catch(e: any) {
    console.error("Direct query error:", e.message)
  }
  return c.json({ success: true, data: stats })
})

app.route("/api", profile)

app.notFound((c) => c.json({ success: false, message: "Not Found" }, 404))
app.onError((err, c) => {
  console.error(err)
  return c.json({ success: false, message: "Internal Server Error" }, 500)
})

console.log(`\n🚀 FutureX API v1.0 — Port ${config.port} — Mock: ${config.mockMode}\n`)

serve({ fetch: app.fetch, port: config.port })
