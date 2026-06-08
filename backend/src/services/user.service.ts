import { MOCK_MODE } from "../lib/config.js"
import { mockUsers, mockPositions } from "../lib/mock-data.js"
import { userRepo } from "../repositories/user.repository.js"

export async function getUserProfile(userId: string) {
  if (MOCK_MODE) {
    const u = mockUsers.find((u:any)=>u.id===userId)
    if (!u) return null
    const { walletAddress, handle, balance, frozenBalance, totalEarned, totalWithdrawn, role, status, level, createdAt } = u
    return { walletAddress, handle, balance, frozenBalance, totalEarned, totalWithdrawn, role, status, level, createdAt }
  }
  return userRepo.findById(userId)
}

export function getUserPositions(userId: string) {
  if (MOCK_MODE) return mockPositions.filter((p:any)=>p.userId===userId)
  return []
}
