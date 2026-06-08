/**
 * Mock 数据 — 开发阶段使用
 * 数据结构与 Prisma Schema 完全一致
 */

// ─── 用户 ────────────────────────────────────────────────
export const mockUsers = [
  {
    id: "u-001",
    walletAddress: "0x7a3F9C21Ab1234DeF5678901234567890ABCDEF01",
    handle: "vitalik.base",
    referralCode: "FUTUREX-VITALIK",
    referredBy: null,
    balance: 5000,
    frozenBalance: 500,
    totalEarned: 1240,
    totalWithdrawn: 200,
    totalDeposited: 5000,
    role: "admin" as const,
    status: "active" as const,
    createdAt: new Date("2025-06-01").toISOString(),
  },
  {
    id: "u-002",
    walletAddress: "0x2b8D4F12Bb5678CDe9012345678901234ABCDEF02",
    handle: "king.base",
    referralCode: "FUTUREX-KING",
    referredBy: "u-003",
    balance: 3200,
    frozenBalance: 800,
    totalEarned: 450,
    totalWithdrawn: 0,
    totalDeposited: 3000,
    role: "user" as const,
    status: "active" as const,
    createdAt: new Date("2025-07-15").toISOString(),
  },
  {
    id: "u-003",
    walletAddress: "0x9c1A7E33Cc9012DEf345678901234567890ABCDEF03",
    handle: "whale.base",
    referralCode: "FUTUREX-WHALE",
    referredBy: null,
    balance: 15000,
    frozenBalance: 2000,
    totalEarned: 5800,
    totalWithdrawn: 3000,
    totalDeposited: 12000,
    role: "user" as const,
    status: "active" as const,
    createdAt: new Date("2025-04-01").toISOString(),
  },
]

// ─── 市场 ────────────────────────────────────────────────
export const mockMarkets = [
  {
    id: "m-001",
    question: "巴西会赢得 2026 世界杯冠军吗？",
    category: "worldcup" as const,
    chain: "base" as const,
    yesPrice: 23,
    volume: 4820000,
    liquidity: 920000,
    participants: 12840,
    endDate: "2026-07-19",
    resolutionSource: "FIFA 官方赛果",
    outcome: null,
    status: "active" as const,
    featured: true,
    creatorId: "u-001",
    createdAt: new Date("2025-06-01").toISOString(),
  },
  {
    id: "m-002",
    question: "比特币在 2026 年底前突破 $150,000？",
    category: "crypto" as const,
    chain: "bsc" as const,
    yesPrice: 38,
    volume: 8920000,
    liquidity: 2400000,
    participants: 24100,
    endDate: "2026-12-31",
    resolutionSource: "Coinbase BTC/USD 现货价",
    outcome: null,
    status: "active" as const,
    featured: true,
    creatorId: "u-003",
    createdAt: new Date("2025-08-01").toISOString(),
  },
  {
    id: "m-003",
    question: "美联储会在 Q3 前再降息一次吗？",
    category: "finance" as const,
    chain: "bsc" as const,
    yesPrice: 71,
    volume: 4120000,
    liquidity: 980000,
    participants: 13600,
    endDate: "2026-09-30",
    resolutionSource: "FOMC 官方利率决议",
    outcome: null,
    status: "active" as const,
    featured: false,
    creatorId: "u-001",
    createdAt: new Date("2025-09-10").toISOString(),
  },
]

// ─── 审核 ────────────────────────────────────────────────
export const mockReviews = [
  {
    id: "rv-001",
    marketId: "m-004",
    reviewerId: "u-001",
    status: "pending" as const,
    rejectReason: null,
    reviewedAt: null,
    createdAt: new Date("2026-06-08").toISOString(),
    market: {
      id: "m-004",
      question: "2026年内会出现公认的AGI突破吗？",
      category: "ai" as const,
      chain: "base" as const,
      endDate: "2026-12-31",
      resolutionSource: "多源专家共识 + 媒体裁定",
      creatorId: "u-002",
      creatorHandle: "king.base",
    },
  },
]

// ─── 订单 ────────────────────────────────────────────────
export const mockOrders = [
  {
    id: "ord-001",
    userId: "u-001",
    marketId: "m-002",
    side: "YES" as const,
    amount: 500,
    price: 38,
    shares: 1315.79,
    estimatedReturn: 1315.79,
    status: "filled" as const,
    createdAt: new Date("2026-06-08T10:30:00").toISOString(),
    marketQuestion: "比特币在 2026 年底前突破 $150,000？",
  },
  {
    id: "ord-002",
    userId: "u-002",
    marketId: "m-001",
    side: "NO" as const,
    amount: 300,
    price: 77,
    shares: 389.61,
    estimatedReturn: 389.61,
    status: "filled" as const,
    createdAt: new Date("2026-06-08T11:00:00").toISOString(),
    marketQuestion: "巴西会赢得 2026 世界杯冠军吗？",
  },
]

// ─── 持仓 ────────────────────────────────────────────────
export const mockPositions = [
  {
    id: "pos-001",
    userId: "u-001",
    marketId: "m-002",
    side: "YES" as const,
    totalAmount: 500,
    avgPrice: 38,
    shares: 1315.79,
    currentPrice: 38,
    pnl: 0,
    status: "open" as const,
    marketQuestion: "比特币在 2026 年底前突破 $150,000？",
  },
  {
    id: "pos-002",
    userId: "u-002",
    marketId: "m-001",
    side: "NO" as const,
    totalAmount: 300,
    avgPrice: 77,
    shares: 389.61,
    currentPrice: 77,
    pnl: 0,
    status: "open" as const,
    marketQuestion: "巴西会赢得 2026 世界杯冠军吗？",
  },
]

// ─── 结算 ────────────────────────────────────────────────
export const mockSettlements = [
  {
    id: "stl-001",
    marketId: "m-005",
    outcome: "YES" as const,
    totalPositions: 8,
    totalPayout: 12400,
    totalFrozen: 15000,
    settledBy: "u-001",
    settledAt: new Date("2026-06-01").toISOString(),
  },
]

// ─── 提现 ────────────────────────────────────────────────
export const mockWithdrawals = [
  {
    id: "wd-001",
    userId: "u-001",
    chain: "base" as const,
    token: "USDC",
    amount: 200,
    fee: 2,
    netAmount: 198,
    toAddress: "0x7a3F9C21Ab1234DeF5678901234567890ABCDEF01",
    status: "PAID" as const,
    isLarge: false,
    rejectReason: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: new Date("2026-06-05").toISOString(),
  },
  {
    id: "wd-002",
    userId: "u-003",
    chain: "bsc" as const,
    token: "USDT",
    amount: 5000,
    fee: 2,
    netAmount: 4998,
    toAddress: "0x9c1A7E33Cc9012DEf345678901234567890ABCDEF03",
    status: "PENDING" as const,
    isLarge: true,
    rejectReason: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: new Date("2026-06-08").toISOString(),
  },
]

// ─── 邀请 ────────────────────────────────────────────────
export const mockReferrals = [
  { id: "ref-001", userId: "u-002", inviterId: "u-003", level: 1, createdAt: new Date("2025-07-15").toISOString() },
]

// ─── 返佣 ────────────────────────────────────────────────
export const mockCommissions = [
  {
    id: "cm-001",
    fromUserId: "u-002",
    toUserId: "u-003",
    orderId: "ord-002",
    level: 1,
    rate: 30,
    betAmount: 300,
    commissionAmount: 2.25,
    marketQuestion: "巴西会赢得 2026 世界杯冠军吗？",
    createdAt: new Date("2026-06-08T11:00:00").toISOString(),
  },
]

// ─── 资金流 ──────────────────────────────────────────────
export const mockTreasuryRecords = [
  {
    id: "tx-001",
    type: "inflow" as const,
    chain: "base" as const,
    token: "USDC",
    amount: 15000,
    fromAddress: "0xuser1...",
    toAddress: "0xCol1ectBase...",
    status: "confirmed" as const,
    note: "用户下注收款",
    createdAt: new Date("2026-06-08T08:00:00").toISOString(),
  },
  {
    id: "tx-002",
    type: "outflow" as const,
    chain: "base" as const,
    token: "USDC",
    amount: 5000,
    fromAddress: "0xPaymentBase...",
    toAddress: "0xuser3...",
    status: "confirmed" as const,
    note: "提现打款",
    createdAt: new Date("2026-06-08T09:00:00").toISOString(),
  },
]
