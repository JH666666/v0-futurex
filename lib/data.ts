export type Category = "worldcup" | "crypto" | "ai" | "politics" | "finance" | "entertainment"

export type Market = {
  id: string
  question: string
  category: Category
  yesPrice: number // cents 1-99
  volume: number // USDC
  liquidity: number
  participants: number
  endDate: string
  image?: string
  resolution: string
  trend: number[] // probability history
  change24h: number // percentage points
  featured?: boolean
  outcomes?: { label: string; price: number }[]
}

export const categoryLabels: Record<Category, string> = {
  worldcup: "World Cup",
  crypto: "Crypto",
  ai: "AI",
  politics: "Politics",
  finance: "Finance",
  entertainment: "Entertainment",
}

export const categoryMeta: Record<Category, { label: string; emoji: string }> = {
  worldcup: { label: "世界杯", emoji: "⚽" },
  crypto: { label: "加密货币", emoji: "₿" },
  ai: { label: "人工智能", emoji: "🤖" },
  politics: { label: "政治", emoji: "🏛" },
  finance: { label: "金融", emoji: "💰" },
  entertainment: { label: "娱乐", emoji: "🎬" },
}

function gen(seed: number, n = 24) {
  const out: number[] = []
  let v = 40 + (seed % 30)
  for (let i = 0; i < n; i++) {
    v += Math.sin(seed + i * 0.7) * 6 + (((seed * (i + 3)) % 11) - 5)
    v = Math.max(8, Math.min(92, v))
    out.push(Math.round(v))
  }
  return out
}

export const markets: Market[] = [
  {
    id: "wc-winner-brazil",
    question: "巴西会赢得 2026 世界杯冠军吗？",
    category: "worldcup",
    yesPrice: 23,
    volume: 4820000,
    liquidity: 920000,
    participants: 12840,
    endDate: "2026-07-19",
    resolution: "FIFA 官方赛果",
    trend: gen(3),
    change24h: 2.4,
    featured: true,
  },
  {
    id: "wc-winner-argentina",
    question: "阿根廷会卫冕 2026 世界杯吗？",
    category: "worldcup",
    yesPrice: 19,
    volume: 5610000,
    liquidity: 1100000,
    participants: 15230,
    endDate: "2026-07-19",
    resolution: "FIFA 官方赛果",
    trend: gen(7),
    change24h: -1.1,
    featured: true,
  },
  {
    id: "wc-host-usa-semi",
    question: "美国队能进入半决赛吗？",
    category: "worldcup",
    yesPrice: 31,
    volume: 2140000,
    liquidity: 540000,
    participants: 8920,
    endDate: "2026-07-14",
    resolution: "FIFA 官方赛果",
    trend: gen(11),
    change24h: 4.8,
  },
  {
    id: "wc-topscorer-mbappe",
    question: "姆巴佩会成为本届世界杯金靴吗？",
    category: "worldcup",
    yesPrice: 14,
    volume: 1680000,
    liquidity: 380000,
    participants: 6210,
    endDate: "2026-07-19",
    resolution: "FIFA 官方统计",
    trend: gen(17),
    change24h: 1.7,
  },
  {
    id: "wc-match-bra-fra",
    question: "巴西 vs 法国 揭幕战 — 巴西获胜？",
    category: "worldcup",
    yesPrice: 46,
    volume: 980000,
    liquidity: 260000,
    participants: 4120,
    endDate: "2026-06-12",
    resolution: "比赛 90 分钟结果",
    trend: gen(23),
    change24h: -3.2,
  },
  {
    id: "crypto-btc-150k",
    question: "比特币在 2026 年底前突破 $150,000？",
    category: "crypto",
    yesPrice: 38,
    volume: 8920000,
    liquidity: 2400000,
    participants: 24100,
    endDate: "2026-12-31",
    resolution: "Coinbase BTC/USD 现货价",
    trend: gen(29),
    change24h: 5.6,
    featured: true,
  },
  {
    id: "crypto-eth-flip",
    question: "ETH 市值会在 2026 翻转 BTC 吗？",
    category: "crypto",
    yesPrice: 8,
    volume: 3210000,
    liquidity: 760000,
    participants: 9870,
    endDate: "2026-12-31",
    resolution: "CoinGecko 市值数据",
    trend: gen(31),
    change24h: -0.9,
  },
  {
    id: "crypto-base-tvl",
    question: "Base 链 TVL 会超过 $50B 吗？",
    category: "crypto",
    yesPrice: 27,
    volume: 1920000,
    liquidity: 510000,
    participants: 7340,
    endDate: "2026-09-30",
    resolution: "DefiLlama TVL 数据",
    trend: gen(37),
    change24h: 3.1,
  },
  {
    id: "ai-agi-2026",
    question: "2026 年内会出现公认的 AGI 突破吗？",
    category: "ai",
    yesPrice: 12,
    volume: 2740000,
    liquidity: 640000,
    participants: 11200,
    endDate: "2026-12-31",
    resolution: "多源专家共识 + 媒体裁定",
    trend: gen(41),
    change24h: 1.3,
    featured: true,
  },
  {
    id: "ai-gpt6",
    question: "OpenAI 会在 Q3 前发布新一代旗舰模型？",
    category: "ai",
    yesPrice: 58,
    volume: 1450000,
    liquidity: 320000,
    participants: 5610,
    endDate: "2026-09-30",
    resolution: "OpenAI 官方发布公告",
    trend: gen(43),
    change24h: 6.2,
  },
  {
    id: "ai-model-cost",
    question: "前沿模型推理成本会再降 50% 吗？",
    category: "ai",
    yesPrice: 64,
    volume: 890000,
    liquidity: 210000,
    participants: 3420,
    endDate: "2026-12-31",
    resolution: "主流 API 定价对比",
    trend: gen(47),
    change24h: -2.0,
  },
  {
    id: "pol-us-election",
    question: "2026 美国中期选举民主党赢得众议院？",
    category: "politics",
    yesPrice: 47,
    volume: 6240000,
    liquidity: 1380000,
    participants: 19800,
    endDate: "2026-11-03",
    resolution: "AP 官方选举结果",
    trend: gen(53),
    change24h: 2.9,
    featured: true,
  },
  {
    id: "pol-uk-pm",
    question: "英国首相会在 2026 年内更换吗？",
    category: "politics",
    yesPrice: 33,
    volume: 1280000,
    liquidity: 340000,
    participants: 5240,
    endDate: "2026-12-31",
    resolution: "英国政府官方公告",
    trend: gen(59),
    change24h: -1.6,
  },
  {
    id: "fin-fed-cut",
    question: "美联储会在 Q3 前再降息一次吗？",
    category: "finance",
    yesPrice: 71,
    volume: 4120000,
    liquidity: 980000,
    participants: 13600,
    endDate: "2026-09-30",
    resolution: "FOMC 官方利率决议",
    trend: gen(61),
    change24h: 3.4,
    featured: true,
  },
  {
    id: "fin-sp500-7000",
    question: "标普 500 会在 2026 年底突破 7000 点？",
    category: "finance",
    yesPrice: 42,
    volume: 2980000,
    liquidity: 720000,
    participants: 10240,
    endDate: "2026-12-31",
    resolution: "S&P 官方收盘指数",
    trend: gen(67),
    change24h: 1.2,
  },
  {
    id: "ent-oscar-bestpic",
    question: "下届奥斯卡最佳影片会是科幻片吗？",
    category: "entertainment",
    yesPrice: 18,
    volume: 760000,
    liquidity: 180000,
    participants: 3120,
    endDate: "2026-03-15",
    resolution: "奥斯卡官方颁奖结果",
    trend: gen(71),
    change24h: 0.8,
  },
  {
    id: "ent-gta6",
    question: "GTA 6 会在 2026 年内正式发售吗？",
    category: "entertainment",
    yesPrice: 56,
    volume: 3410000,
    liquidity: 640000,
    participants: 14200,
    endDate: "2026-12-31",
    resolution: "Rockstar 官方发售公告",
    trend: gen(73),
    change24h: 4.1,
    featured: true,
  },
]

export function getMarket(id: string) {
  return markets.find((m) => m.id === id)
}

export function formatUSDC(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

export const groupStandings = [
  { group: "A", teams: ["墨西哥", "波兰", "沙特", "突尼斯"] },
  { group: "B", teams: ["加拿大", "比利时", "摩洛哥", "克罗地亚"] },
  { group: "C", teams: ["美国", "英格兰", "塞内加尔", "伊朗"] },
  { group: "D", teams: ["法国", "丹麦", "日本", "厄瓜多尔"] },
]

export const matches = [
  { id: "m1", home: "巴西", away: "法国", date: "06-12 20:00", yes: 46, stage: "小组赛 A1" },
  { id: "m2", home: "阿根廷", away: "西班牙", date: "06-13 18:00", yes: 52, stage: "小组赛 B1" },
  { id: "m3", home: "美国", away: "英格兰", date: "06-13 21:00", yes: 34, stage: "小组赛 C1" },
  { id: "m4", home: "德国", away: "葡萄牙", date: "06-14 20:00", yes: 49, stage: "小组赛 D1" },
  { id: "m5", home: "荷兰", away: "克罗地亚", date: "06-15 18:00", yes: 58, stage: "小组赛 A2" },
]

export const leaders = [
  { rank: 1, name: "0xCryptoOracle", handle: "vitalik.base", pnl: 248200, accuracy: 78, volume: 1820000, roi: 142, streak: 12 },
  { rank: 2, name: "PredictKing", handle: "king.base", pnl: 192400, accuracy: 74, volume: 1540000, roi: 118, streak: 8 },
  { rank: 3, name: "SoccerWhale", handle: "whale.base", pnl: 167800, accuracy: 71, volume: 2110000, roi: 89, streak: 5 },
  { rank: 4, name: "BaseDegen", handle: "degen.base", pnl: 134500, accuracy: 69, volume: 980000, roi: 134, streak: 9 },
  { rank: 5, name: "AlphaSeeker", handle: "alpha.base", pnl: 118900, accuracy: 73, volume: 760000, roi: 156, streak: 3 },
  { rank: 6, name: "MarketMaven", handle: "maven.base", pnl: 98200, accuracy: 67, volume: 1230000, roi: 79, streak: 6 },
  { rank: 7, name: "GoalGetter", handle: "goal.base", pnl: 87600, accuracy: 70, volume: 540000, roi: 162, streak: 4 },
  { rank: 8, name: "ChainProphet", handle: "prophet.base", pnl: 76400, accuracy: 65, volume: 890000, roi: 86, streak: 2 },
]

export const positions = [
  { id: "p1", market: "巴西会赢得 2026 世界杯冠军吗？", side: "YES" as const, shares: 1200, avg: 19, current: 23, value: 276 },
  { id: "p2", market: "比特币突破 $150,000？", side: "YES" as const, shares: 800, avg: 31, current: 38, value: 304 },
  { id: "p3", market: "美国队能进入半决赛吗？", side: "NO" as const, shares: 540, avg: 72, current: 69, value: 372.6 },
  { id: "p4", market: "ETH 翻转 BTC？", side: "NO" as const, shares: 2000, avg: 89, current: 92, value: 1840 },
]

export const closedPositions = [
  { id: "c1", market: "阿根廷夺得美洲杯？", side: "YES" as const, shares: 600, entry: 44, exit: 100, pnl: 336 },
  { id: "c2", market: "以太坊现货 ETF 通过？", side: "YES" as const, shares: 1000, entry: 61, exit: 100, pnl: 390 },
  { id: "c3", market: "梅西转会 MLS？", side: "NO" as const, shares: 450, entry: 38, exit: 0, pnl: -171 },
]

export type Activity = {
  id: string
  user: string
  action: "buy" | "sell"
  side: "YES" | "NO"
  amount: number
  price: number
  time: string
}

export const activityFeed: Activity[] = [
  { id: "a1", user: "0x7f…3ad", action: "buy", side: "YES", amount: 1200, price: 23, time: "12 秒前" },
  { id: "a2", user: "whale.base", action: "buy", side: "NO", amount: 4800, price: 77, time: "44 秒前" },
  { id: "a3", user: "0x2c…91b", action: "sell", side: "YES", amount: 600, price: 24, time: "1 分钟前" },
  { id: "a4", user: "degen.base", action: "buy", side: "YES", amount: 320, price: 22, time: "2 分钟前" },
  { id: "a5", user: "0x9a…f02", action: "buy", side: "NO", amount: 1500, price: 78, time: "3 分钟前" },
  { id: "a6", user: "alpha.base", action: "sell", side: "NO", amount: 980, price: 76, time: "5 分钟前" },
]

export const dailyCheckins = [
  { day: 1, reward: 50, claimed: true },
  { day: 2, reward: 75, claimed: true },
  { day: 3, reward: 100, claimed: true },
  { day: 4, reward: 150, claimed: false, today: true },
  { day: 5, reward: 200, claimed: false },
  { day: 6, reward: 300, claimed: false },
  { day: 7, reward: 500, claimed: false },
]

export type Badge = {
  id: string
  name: string
  desc: string
  unlocked: boolean
}

export const badges: Badge[] = [
  { id: "b1", name: "首单预测", desc: "完成第一笔预测交易", unlocked: true },
  { id: "b2", name: "连胜大师", desc: "连续 5 次预测正确", unlocked: true },
  { id: "b3", name: "巨鲸玩家", desc: "单笔交易超过 $1,000", unlocked: true },
  { id: "b4", name: "世界杯专家", desc: "在 10 个世界杯市场盈利", unlocked: false },
  { id: "b5", name: "市场创造者", desc: "创建首个被验证的市场", unlocked: false },
  { id: "b6", name: "钻石之手", desc: "持有头寸至结算超过 30 天", unlocked: false },
]

export const referrals = [
  { name: "0x4d…8c1", joined: "3 天前", earned: 120, status: "活跃" as const },
  { name: "soccer.base", joined: "1 周前", earned: 340, status: "活跃" as const },
  { name: "0xab…77e", joined: "2 周前", earned: 80, status: "待激活" as const },
  { name: "trader.base", joined: "3 周前", earned: 510, status: "活跃" as const },
]
