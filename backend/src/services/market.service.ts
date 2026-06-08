import { MOCK_MODE } from "../lib/config.js"
import { mockMarkets, mockReviews } from "../lib/mock-data.js"
import { marketRepo } from "../repositories/market.repository.js"

export async function getMarkets(query: any) {
  const { category, chain, status, featured, search, page = 1, perPage = 20 } = query
  if (MOCK_MODE) {
    let list = [...mockMarkets]
    if (category) list = list.filter((m: any) => m.category === category)
    if (chain) list = list.filter((m: any) => m.chain === chain)
    if (status) list = list.filter((m: any) => m.status === status)
    if (featured !== undefined) list = list.filter((m: any) => m.featured === featured)
    const total = list.length
    return { markets: list.slice((page-1)*perPage, page*perPage), meta: { page, perPage, total, totalPages: Math.ceil(total/perPage) } }
  }
  const markets = await marketRepo.findAll({ category, chain, status, search, page, perPage })
  return { markets, meta: { page, perPage, total: (markets as any[]).length, totalPages: 1 } }
}

export function getMarketById(id: string) {
  if (MOCK_MODE) return mockMarkets.find((m: any) => m.id === id) || null
  return marketRepo.findById(id)
}

export function createMarket(data: any) {
  if (MOCK_MODE) {
    const m = { id: `m-${Date.now()}`, ...data, yesPrice: 50, volume: 0, liquidity: 500, participants: 0, outcome: null, status: "active", featured: false, createdAt: new Date().toISOString() }
    mockMarkets.push(m)
    mockReviews.push({ id: `rv-${Date.now()}`, marketId: m.id, reviewerId: "", status: "pending", rejectReason: null, reviewedAt: null, createdAt: new Date().toISOString(), market: { ...m, creatorHandle: "" } })
    return m
  }
  return marketRepo.create(data)
}

export function getReviews(query: any) {
  if (MOCK_MODE) {
    let list = mockReviews
    if (query.status) list = list.filter((r: any) => r.status === query.status)
    return { reviews: list, stats: { pending: mockReviews.filter((r: any) => r.status === "pending").length, approved: mockReviews.filter((r: any) => r.status === "approved").length, rejected: mockReviews.filter((r: any) => r.status === "rejected").length } }
  }
  return { reviews: [], stats: { pending: 0, approved: 0, rejected: 0 } }
}

export function approveReview(reviewId: string, reviewerId: string) {
  if (MOCK_MODE) {
    const r = mockReviews.find((r: any) => r.id === reviewId)
    if (r) { r.status = "approved"; r.reviewerId = reviewerId; r.reviewedAt = new Date().toISOString(); return r }
    return null
  }
  return null
}
