import { MOCK_MODE } from "../lib/config.js"
import { mockUsers } from "../lib/mock-data.js"
import { userRepo } from "../repositories/user.repository.js"

const nonceStore = new Map<string,{nonce:string;expires:number}>()

export function generateNonce(walletAddress: string) {
  const nonce = `futurex-${Date.now()}-${Math.random().toString(36).slice(2,10)}`
  nonceStore.set(walletAddress, { nonce, expires: Date.now()+5*60*1000 })
  return { nonce, message: `Sign this message to login to FutureX\n\nWallet: ${walletAddress}\nNonce: ${nonce}` }
}

export async function verifySignature(walletAddress: string, signature: string, nonce: string) {
  const stored = nonceStore.get(walletAddress)
  if (!stored) return { error: "请先生成 nonce" }
  if (stored.nonce !== nonce) return { error: "nonce 不匹配" }
  if (Date.now() > stored.expires) return { error: "nonce 已过期" }
  nonceStore.delete(walletAddress)
  if (!signature || signature.length < 10) return { error: "签名无效" }

  if (MOCK_MODE) {
    let user = mockUsers.find((u:any) => u.walletAddress.toLowerCase() === walletAddress.toLowerCase())
    if (!user) {
      user = { id: `u-${Date.now()}`, walletAddress, handle: `${walletAddress.slice(2,10)}.base`, referralCode: `FX-${walletAddress.slice(2,8).toUpperCase()}`, referredBy: null, balance: 5000, frozenBalance: 0, totalEarned: 0, totalWithdrawn: 0, totalDeposited: 5000, role: "user", status: "active", level: 1, createdAt: new Date().toISOString() }
      mockUsers.push(user)
    }
    return { token: `jwt_mock_${user.id}_${Date.now()}`, user }
  }

  // Real mode
  let user = await userRepo.findByWallet(walletAddress)
  if (!user) {
    user = await userRepo.create({ walletAddress, handle: `${walletAddress.slice(2,10)}.base`, referralCode: `FX-${walletAddress.slice(2,8).toUpperCase()}` })
  }
  return { token: `jwt_real_${user.id}_${Date.now()}`, user }
}

export function getUserFromToken(token: string) {
  if (!token) return null
  const parts = token.split("_")
  if (parts[0] !== "jwt") return null
  const userId = parts[2]
  if (MOCK_MODE) return mockUsers.find((u:any) => u.id === userId) || null
  return userRepo.findById(userId)
}
