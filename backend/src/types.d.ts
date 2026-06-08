/** Hono Context 类型扩展 */
import type { AuthUser } from "./lib/types.js"

declare module "hono" {
  interface ContextVariableMap {
    user: AuthUser
  }
}
