/** Hono Context 类型扩展 */
import type { Context } from "hono"

export type AuthUser = {
  id: string
  walletAddress: string
  handle: string
  role: string
  balance: number
  level?: number
}

export type AppContext = Context & {
  get(key: "user"): AuthUser
  set(key: "user", value: AuthUser): void
}
