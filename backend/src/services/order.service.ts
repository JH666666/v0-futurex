import { MOCK_MODE } from "../lib/config.js"
import { mockOrders, mockPositions, mockUsers } from "../lib/mock-data.js"
import { orderRepo } from "../repositories/order.repository.js"
import { calculateCommission } from "./referral-api.service.js"

export function createOrder(data: any) {
  if (MOCK_MODE) {
    const user = mockUsers.find((u: any) => u.id === data.userId)
    if (!user) return { error: "用户不存在" }
    if (user.balance < data.amount) return { error: "余额不足" }
    const chain = data.chain || "base"
    const token = chain === "base" ? "USDC" : "USDT"
    user.balance -= data.amount; user.frozenBalance += data.amount
    const shares = (data.amount * 100) / data.price
    const order = { id: `ord-${Date.now()}`, userId: data.userId, userWallet: user.walletAddress, marketId: data.marketId, side: data.side, amount: data.amount, price: data.price, chain, token, txHash: `mock_tx_${Date.now()}`, shares: Math.round(shares*100)/100, estimatedReturn: Math.round(shares*100)/100, status: "filled", createdAt: new Date().toISOString(), marketQuestion: "" }
    mockOrders.push(order)
    const existing = mockPositions.find((p: any) => p.userId===data.userId && p.marketId===data.marketId && p.side===data.side && p.status==="open")
    if (existing) {
      const nt = existing.totalAmount+data.amount; existing.avgPrice = Math.round(((existing.avgPrice*existing.totalAmount)+(data.price*data.amount))/nt); existing.totalAmount=nt; existing.shares+=order.shares; existing.currentPrice=data.price
    } else {
      mockPositions.push({ id: `pos-${Date.now()}`, userId: data.userId, marketId: data.marketId, side: data.side, totalAmount: data.amount, avgPrice: data.price, shares: order.shares, currentPrice: data.price, pnl:0, status:"open", marketQuestion:"" })
    }
    return { order, wallet: { balance: user.balance, frozenBalance: user.frozenBalance } }
  }
  // Real mode
  const shares = (data.amount * 100) / data.price
  try {
    const o = await orderRepo.create({ ...data, chain: data.chain||"base", token: data.chain==="bsc"?"USDT":"USDC", userWallet: "", txHash: "", shares, estimatedReturn: shares })
    // Trigger 5-level commission
    calculateCommission({ betUserId: data.userId, betAmount: data.amount, marketQuestion: "", orderId: o.id }).catch(() => {})
    return { order: o, wallet: { balance: 0, frozenBalance: 0 } }
  } catch { return { error: "数据库错误" } }
}

export function getUserOrders(userId: string) {
  if (MOCK_MODE) return mockOrders.filter((o: any) => o.userId===userId).sort((a:any,b:any)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())
  return orderRepo.findByUser(userId)
}
