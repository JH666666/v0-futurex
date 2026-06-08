/**
 * 增强版 Mock 用户数据 — 用户体系（等级/KYC/风控/行为日志）
 */

export type UserLevel = { level: number; name: string; minBetAmount: number; minInvites: number; minTeamVolume: number }

export const LEVEL_CONFIG: UserLevel[] = [
  { level: 1, name: "青铜", minBetAmount: 0, minInvites: 0, minTeamVolume: 0 },
  { level: 2, name: "白银", minBetAmount: 5000, minInvites: 3, minTeamVolume: 10000 },
  { level: 3, name: "黄金", minBetAmount: 20000, minInvites: 10, minTeamVolume: 50000 },
  { level: 4, name: "铂金", minBetAmount: 100000, minInvites: 50, minTeamVolume: 200000 },
  { level: 5, name: "钻石", minBetAmount: 500000, minInvites: 200, minTeamVolume: 1000000 },
]

export type KycStatus = "unverified" | "PENDING" | "APPROVED" | "REJECTED"
export type RiskLevel = "normal" | "high_risk" | "restrict_withdraw" | "ban_betting" | "blacklist"

export type UserProfile = {
  id: string; walletAddress: string; handle: string; nickname: string; avatarUrl: string
  referralCode: string; referredBy: string | null
  balance: number; frozenBalance: number; totalEarned: number; totalWithdrawn: number
  level: number; totalBetAmount: number; totalInvites: number; teamVolume: number
  kyc: { status: KycStatus; name?: string; country?: string; idNumber?: string; submittedAt?: string; reviewedAt?: string }
  risk: { level: RiskLevel; reason?: string; taggedAt?: string }
  role: string; status: string; createdAt: string
}

export type ActivityLog = {
  id: string; userId: string; type: "login" | "bet" | "withdraw" | "invite" | "settlement" | "kyc"
  detail: string; amount?: number; createdAt: string
}

// 生成完整 Mock 用户
export const mockUserProfiles: UserProfile[] = [
  {
    id: "u-001", walletAddress: "0x7a3F9C21Ab1234DeF5678901234567890ABCDEF0", handle: "vitalik.base",
    nickname: "Vitalik", avatarUrl: "", referralCode: "FUTUREX-VITALIK", referredBy: null,
    balance: 5000, frozenBalance: 500, totalEarned: 1240, totalWithdrawn: 200,
    level: 4, totalBetAmount: 185000, totalInvites: 62, teamVolume: 320000,
    kyc: { status: "APPROVED", name: "Vitalik", country: "CH", idNumber: "CH-***-1234", submittedAt: "2025-06-15", reviewedAt: "2025-06-16" },
    risk: { level: "normal" }, role: "admin", status: "active", createdAt: "2025-06-01",
  },
  {
    id: "u-002", walletAddress: "0x2b8D4F12Bb5678CDe9012345678901234ABCDEF02", handle: "king.base",
    nickname: "King", avatarUrl: "", referralCode: "FUTUREX-KING", referredBy: "u-003",
    balance: 3200, frozenBalance: 800, totalEarned: 450, totalWithdrawn: 0,
    level: 2, totalBetAmount: 6800, totalInvites: 5, teamVolume: 15000,
    kyc: { status: "PENDING", name: "King Trader", country: "US", idNumber: "US-***-5678", submittedAt: "2026-06-01" },
    risk: { level: "normal" }, role: "user", status: "active", createdAt: "2025-07-15",
  },
  {
    id: "u-003", walletAddress: "0x9c1A7E33Cc9012DEf345678901234567890ABCDEF03", handle: "whale.base",
    nickname: "Whale", avatarUrl: "", referralCode: "FUTUREX-WHALE", referredBy: null,
    balance: 15000, frozenBalance: 2000, totalEarned: 5800, totalWithdrawn: 3000,
    level: 5, totalBetAmount: 620000, totalInvites: 240, teamVolume: 1200000,
    kyc: { status: "APPROVED", name: "Whale Master", country: "SG", idNumber: "SG-***-9012", submittedAt: "2025-04-10", reviewedAt: "2025-04-11" },
    risk: { level: "normal" }, role: "user", status: "active", createdAt: "2025-04-01",
  },
  {
    id: "u-004", walletAddress: "0xbad1DEADdeadDEADdeadDEADdeadDEADdeadDEAD", handle: "spam.base",
    nickname: "SpamBot", avatarUrl: "", referralCode: "FUTUREX-SPAM", referredBy: null,
    balance: 50, frozenBalance: 0, totalEarned: 0, totalWithdrawn: 0,
    level: 1, totalBetAmount: 200, totalInvites: 0, teamVolume: 0,
    kyc: { status: "unverified" },
    risk: { level: "blacklist", reason: "批量注册 + 刷量", taggedAt: "2026-05-01" },
    role: "user", status: "banned", createdAt: "2026-01-15",
  },
  {
    id: "u-005", walletAddress: "0xhighRISK123456789012345678901234567890", handle: "risky.base",
    nickname: "Risky", avatarUrl: "", referralCode: "FUTUREX-RISK", referredBy: null,
    balance: 800, frozenBalance: 300, totalEarned: 120, totalWithdrawn: 100,
    level: 1, totalBetAmount: 1200, totalInvites: 0, teamVolume: 0,
    kyc: { status: "unverified" },
    risk: { level: "high_risk", reason: "异常下注模式，单笔金额波动过大", taggedAt: "2026-06-01" },
    role: "user", status: "active", createdAt: "2026-03-01",
  },
]

export const mockActivityLogs: ActivityLog[] = [
  { id: "log-1", userId: "u-001", type: "login", detail: "钱包登录", createdAt: "2026-06-08T10:00:00Z" },
  { id: "log-2", userId: "u-001", type: "bet", detail: "买入 YES · 比特币突破$150,000", amount: 500, createdAt: "2026-06-08T10:30:00Z" },
  { id: "log-3", userId: "u-001", type: "bet", detail: "买入 NO · 巴西世界杯冠军", amount: 300, createdAt: "2026-06-08T11:00:00Z" },
  { id: "log-4", userId: "u-001", type: "withdraw", detail: "提现 USDC → 0x7a3F...", amount: 200, createdAt: "2026-06-05T09:00:00Z" },
  { id: "log-5", userId: "u-001", type: "settlement", detail: "巴西世界杯冠军结算 · YES 胜", amount: 870, createdAt: "2026-06-03T20:00:00Z" },
  { id: "log-6", userId: "u-001", type: "invite", detail: "邀请 king.base 注册", createdAt: "2026-06-02T15:00:00Z" },
  { id: "log-7", userId: "u-002", type: "login", detail: "钱包登录", createdAt: "2026-06-08T10:00:00Z" },
  { id: "log-8", userId: "u-002", type: "bet", detail: "买入 YES · 美联储降息", amount: 800, createdAt: "2026-06-08T11:30:00Z" },
  { id: "log-9", userId: "u-002", type: "kyc", detail: "提交 KYC 审核", createdAt: "2026-06-01T10:00:00Z" },
]
