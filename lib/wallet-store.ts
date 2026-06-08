/**
 * Wallet Store — 用户余额系统
 *
 * 账户余额 | 冻结金额 | 累计收益 | 累计提现
 * 全部存入 localStorage。
 */

// ─── 类型 ───────────────────────────────────────────────
export type WalletState = {
  balance: number       // 可用余额
  frozen: number        // 冻结金额（已下单未结算）
  totalEarned: number   // 累计收益
  totalWithdrawn: number // 累计提现
  totalDeposited: number // 累计充值
}

// ─── localStorage ───────────────────────────────────────
const WALLET_KEY_PREFIX = "futurex-wallet-"

function getKey(userId: string) { return WALLET_KEY_PREFIX + userId }

function loadWallet(userId: string): WalletState {
  if (typeof window === "undefined") return defaultWallet()
  try {
    const raw = localStorage.getItem(getKey(userId))
    if (raw) return JSON.parse(raw)
  } catch {}
  const w = defaultWallet()
  saveWallet(userId, w)
  return w
}

function saveWallet(userId: string, w: WalletState) {
  try { localStorage.setItem(getKey(userId), JSON.stringify(w)) } catch {}
}

function defaultWallet(): WalletState {
  return {
    balance: 5000,
    frozen: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    totalDeposited: 5000,
  }
}

// ─── 内存缓存 ───────────────────────────────────────────
const _cache = new Map<string, WalletState>()

function get(userId: string): WalletState {
  if (!_cache.has(userId)) _cache.set(userId, loadWallet(userId))
  return _cache.get(userId)!
}

function save(userId: string) {
  saveWallet(userId, get(userId))
}

// ─── 公开 API ───────────────────────────────────────────

/** 获取用户余额信息 */
export function getWallet(userId: string): WalletState {
  return { ...get(userId) }
}

/** 冻结资金（下单时调用） */
export function freezeFunds(userId: string, amount: number): WalletState | null {
  const w = get(userId)
  if (w.balance < amount) return null // 余额不足

  w.balance -= amount
  w.frozen += amount
  save(userId)
  return { ...w }
}

/** 结算返还（管理员结算时调用） */
export function settleFunds(userId: string, frozen: number, payout: number): WalletState {
  const w = get(userId)

  w.frozen = Math.max(0, w.frozen - frozen)
  w.balance += payout

  // 累计收益只计算盈利部分
  if (payout > frozen) {
    w.totalEarned += (payout - frozen)
  }

  save(userId)
  return { ...w }
}

/** 取消订单返还 */
export function unfreezeFunds(userId: string, amount: number): WalletState {
  const w = get(userId)
  w.balance += amount
  w.frozen = Math.max(0, w.frozen - amount)
  save(userId)
  return { ...w }
}

/** 提现 */
export function withdrawFunds(userId: string, amount: number): WalletState | null {
  const w = get(userId)
  if (w.balance < amount) return null

  w.balance -= amount
  w.totalWithdrawn += amount
  save(userId)
  return { ...w }
}

/** 充值 */
export function depositFunds(userId: string, amount: number): WalletState {
  const w = get(userId)
  w.balance += amount
  w.totalDeposited += amount
  save(userId)
  return { ...w }
}

/** 获取所有钱包（管理后台用） */
export function getAllWallets(): Map<string, WalletState> {
  const wallets = new Map<string, WalletState>()
  if (typeof window === "undefined") return wallets

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(WALLET_KEY_PREFIX)) {
      const userId = key.replace(WALLET_KEY_PREFIX, "")
      wallets.set(userId, loadWallet(userId))
    }
  }
  return wallets
}

/** 全局统计 */
export function getGlobalStats() {
  const wallets = getAllWallets()
  let totalBalance = 0
  let totalFrozen = 0
  let totalEarned = 0
  let totalWithdrawn = 0

  wallets.forEach((w) => {
    totalBalance += w.balance
    totalFrozen += w.frozen
    totalEarned += w.totalEarned
    totalWithdrawn += w.totalWithdrawn
  })

  return { totalBalance, totalFrozen, totalEarned, totalWithdrawn }
}

/** 重置 */
export function resetWallet(userId: string) {
  const w = defaultWallet()
  _cache.set(userId, w)
  save(userId)
}
