import { MOCK_MODE } from "../lib/config.js"
import { mockOrders, mockWithdrawals, mockCommissions, mockTreasuryRecords, mockUsers } from "../lib/mock-data.js"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getFinanceOverview() {
  if (MOCK_MODE) {
    const totalBet = mockOrders.reduce((s:any,o:any)=>s+o.amount,0)
    const pendingWd = mockWithdrawals.filter((w:any)=>w.status==="PENDING").reduce((s:any,w:any)=>s+w.amount,0)
    const approvedWd = mockWithdrawals.filter((w:any)=>w.status==="PAID").reduce((s:any,w:any)=>s+w.amount,0)
    const totalBal = mockUsers.reduce((s:any,u:any)=>s+u.balance,0)
    const totalFrz = mockUsers.reduce((s:any,u:any)=>s+u.frozenBalance,0)
    const commTotal = mockCommissions.reduce((s:any,c:any)=>s+c.commissionAmount,0)
    const inflow = mockTreasuryRecords.filter((t:any)=>t.type==="inflow").reduce((s:any,t:any)=>s+t.amount,0)
    const outflow = mockTreasuryRecords.filter((t:any)=>t.type==="outflow").reduce((s:any,t:any)=>s+t.amount,0)
    return { betting: { totalBetAmount: totalBet, totalOrders: mockOrders.length }, wallet: { totalBalance: totalBal, totalFrozen: totalFrz }, withdrawal: { pendingAmount: pendingWd, approvedAmount: approvedWd }, commission: { total: commTotal, byLevel: [] }, treasury: { totalInflow: inflow, totalOutflow: outflow } }
  }
  try {
    const [orders, withdrawals, users] = await Promise.all([
      prisma.order.findMany(), prisma.withdrawal.findMany(), prisma.user.findMany(),
    ])
    const totalBet = orders.reduce((s:any,o:any)=>s+Number(o.amount),0)
    const pendingWd = withdrawals.filter((w:any)=>w.status==="PENDING").reduce((s:any,w:any)=>s+Number(w.amount),0)
    const approvedWd = withdrawals.filter((w:any)=>w.status==="PAID").reduce((s:any,w:any)=>s+Number(w.amount),0)
    const totalBal = users.reduce((s:any,u:any)=>s+Number(u.balance),0)
    const totalFrz = users.reduce((s:any,u:any)=>s+Number(u.frozenBalance),0)
    return { betting: { totalBetAmount: totalBet, totalOrders: orders.length }, wallet: { totalBalance: totalBal, totalFrozen: totalFrz }, withdrawal: { pendingAmount: pendingWd, approvedAmount: approvedWd }, commission: { total: 0, byLevel: [] }, treasury: { totalInflow: 0, totalOutflow: 0 } }
  } catch { return { betting:{totalBetAmount:0,totalOrders:0},wallet:{totalBalance:0,totalFrozen:0},withdrawal:{pendingAmount:0,approvedAmount:0},commission:{total:0,byLevel:[]},treasury:{totalInflow:0,totalOutflow:0} } }
}
