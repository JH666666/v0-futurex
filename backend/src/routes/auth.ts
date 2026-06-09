import { Hono } from "hono"
import { z } from "zod"
import { generateNonce, verifySignature } from "../services/auth.service.js"

const auth = new Hono()

// POST /api/auth/wallet
auth.post("/wallet", async (c) => {
  const body = await c.req.json()
  const schema = z.object({ walletAddress: z.string().min(42).max(42), inviteCode: z.string().optional() })
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return c.json({ success: false, message: "钱包地址格式错误（需要 42 位 0x 地址）" }, 400)

  const { nonce, message } = generateNonce(parsed.data.walletAddress)
  return c.json({ success: true, message: "Nonce 已生成", data: { nonce, message } })
})

// POST /api/auth/login
auth.post("/login", async (c) => {
  const body = await c.req.json()
  const schema = z.object({
    walletAddress: z.string().min(42).max(42),
    signature: z.string().min(10),
    nonce: z.string().min(1),
  })
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return c.json({ success: false, message: "参数错误：需要 walletAddress, signature, nonce" }, 400)

  const result = await verifySignature(parsed.data.walletAddress, parsed.data.signature, parsed.data.nonce)
  if ("error" in result)
    return c.json({ success: false, message: result.error }, 401)

  return c.json({
    success: true,
    message: "登录成功",
    data: { token: result.token, user: result.user },
  })
})

export { auth }
