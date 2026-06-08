/**
 * 全局配置 — Mock Mode 开关
 *
 * MOCK_MODE=true  → 使用内存 Mock 数据，无需数据库
 * MOCK_MODE=false → 连接真实 Supabase/PostgreSQL
 */

export const MOCK_MODE = process.env.MOCK_MODE !== "false"

export const config = {
  port: parseInt(process.env.PORT || "3001"),
  jwtSecret: process.env.JWT_SECRET || "futurex-dev-secret",
  mockMode: MOCK_MODE,
  databaseUrl: process.env.DATABASE_URL || "",
  redisUrl: process.env.REDIS_URL || "",
}

// 代币配置
export const TOKEN_CONFIG = {
  base: {
    symbol: "USDC",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
  },
  bsc: {
    symbol: "USDT",
    address: "0x55d398326f99059fF775485246999027B3197955",
    decimals: 18,
  },
} as const
