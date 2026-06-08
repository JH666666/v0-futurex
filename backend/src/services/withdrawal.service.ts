import { MOCK_MODE } from "../lib/config.js"
import { mockWithdrawals, mockUsers } from "../lib/mock-data.js"
import { withdrawRepo } from "../repositories/withdraw.repository.js"

const AUTO_LIMIT = 100

export async function requestWithdrawal(data: { userId: string; amount: number; toAddress: string; chain: "base"|"bsc" }) {
  if (MOCK_MODE) {
    const user = mockUsers.find((u:any)=>u.id===data.userId)
    if (!user) return { error: "用户不存在" }
    if (data.amount<=0) return { error: "金额无效" }
    const isLarge = data.amount > AUTO_LIMIT; const fee=2; const netAmount=data.amount-fee
    if (user.balance < data.amount) return { error: "余额不足" }
    const token = data.chain==="base"?"USDC":"USDT"
    const r = { id:`wd-${Date.now()}`, userId:data.userId, userWallet:user.walletAddress, chain:data.chain, token, amount:data.amount, fee, netAmount, toAddress:data.toAddress, status:isLarge?"PENDING":"PAID", isLarge, rejectReason:null, reviewedBy:null, reviewedAt:null, txHash: isLarge?null:`mock_pay_${Date.now()}`, createdAt:new Date().toISOString() }
    mockWithdrawals.push(r)
    if (!isLarge) { user.balance-=data.amount; user.totalWithdrawn+=netAmount }
    return { withdrawal: r }
  }
  try {
    const isLarge = data.amount > AUTO_LIMIT; const fee=2; const netAmount=data.amount-fee
    const token = data.chain==="base"?"USDC":"USDT"
    return { withdrawal: await withdrawRepo.create({ ...data, userWallet:"", chain:data.chain, token, fee, netAmount, status: isLarge?"PENDING":"PAID", isLarge, txHash: isLarge?null:`db_${Date.now()}` }) }
  } catch { return { error: "数据库错误" } }
}

export async function approveWithdrawal(withdrawalId: string, reviewerId: string) {
  if (MOCK_MODE) {
    const w = mockWithdrawals.find((w:any)=>w.id===withdrawalId)
    if (!w || w.status!=="PENDING") return { error: "状态错误" }
    const u = mockUsers.find((u:any)=>u.id===w.userId)
    if (!u || u.balance < w.amount) return { error: "余额不足" }
    u.balance-=w.amount; u.totalWithdrawn+=w.netAmount; w.status="PAID"; w.reviewedBy=reviewerId; w.reviewedAt=new Date().toISOString()
    return { withdrawal: w }
  }
  try { return { withdrawal: await withdrawRepo.updateStatus(withdrawalId, "PAID", reviewerId) } }
  catch { return { error: "数据库错误" } }
}

export function getWithdrawals(query: { status?: string; userId?: string }) {
  if (MOCK_MODE) {
    let list = mockWithdrawals
    if (query.status) list = list.filter((w:any)=>w.status===query.status)
    if (query.userId) list = list.filter((w:any)=>w.userId===query.userId)
    return list.sort((a:any,b:any)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())
  }
  return withdrawRepo.findAll(query.status ? { status: query.status } : {})
}
