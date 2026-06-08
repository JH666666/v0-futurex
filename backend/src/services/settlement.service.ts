import { MOCK_MODE } from "../lib/config.js"
import { mockPositions, mockSettlements, mockUsers } from "../lib/mock-data.js"
import { settlementRepo } from "../repositories/settlement.repository.js"

export async function executeSettlement(marketId: string, outcome: "YES"|"NO", settledBy: string) {
  if (MOCK_MODE) {
    const positions = mockPositions.filter((p:any)=>p.marketId===marketId&&p.status==="open")
    if (!positions.length) return { error: "无活跃持仓" }
    let totalPayout=0, totalFrozen=0
    positions.forEach((p:any)=>{
      const win = p.side===outcome; const payout = win ? p.shares : 0
      totalFrozen+=p.totalAmount; totalPayout+=payout
      p.status="settled"; (p as any).settledOutcome=outcome; (p as any).settledReturn=payout; p.pnl=payout-p.totalAmount; p.currentPrice=outcome==="YES"?100:0
      const u = mockUsers.find((u:any)=>u.id===p.userId)
      if(u){ u.frozenBalance=Math.max(0,u.frozenBalance-p.totalAmount); u.balance+=payout; if(payout>p.totalAmount) u.totalEarned+=(payout-p.totalAmount) }
    })
    const s = { id:`stl-${Date.now()}`, marketId, outcome, totalPositions:positions.length, totalPayout:Math.round(totalPayout*100)/100, totalFrozen, settledBy, settledAt:new Date().toISOString() }
    mockSettlements.push(s); return { settlement: s }
  }
  // Real mode
  try {
    const positions = await settlementRepo.findPositionsByMarket(marketId)
    if (!positions.length) return { error: "无活跃持仓" }
    let totalPayout=0, totalFrozen=0
    for (const p of positions) {
      const win = p.side===outcome; const payout = win ? Number(p.shares) : 0
      totalFrozen+=Number(p.totalAmount); totalPayout+=payout
      await settlementRepo.settlePosition(p.id, payout, outcome)
      await settlementRepo.updateUserBalance(p.userId, payout - Number(p.totalAmount), -Number(p.totalAmount))
    }
    const s = await settlementRepo.create({ marketId, outcome, totalPositions:positions.length, totalPayout, totalFrozen, settledBy })
    return { settlement: s }
  } catch { return { error: "数据库错误" } }
}

export function getSettlements() {
  if (MOCK_MODE) return mockSettlements
  return settlementRepo.findAll()
}
