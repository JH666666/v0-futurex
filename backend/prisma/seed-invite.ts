import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

const testUsers = [
  { wallet: "0xAAAA5678901234567890123456789012345678", handle: "alice.base", code: "FX-ALICE01" },
  { wallet: "0xBBBB5678901234567890123456789012345678", handle: "bob.base", code: "FX-BOB0002" },
  { wallet: "0xCCCC5678901234567890123456789012345678", handle: "carol.base", code: "FX-CAROL03" },
  { wallet: "0xDDDD5678901234567890123456789012345678", handle: "dave.base", code: "FX-DAVE004" },
  { wallet: "0xEEEE5678901234567890123456789012345678", handle: "eve.base", code: "FX-EVE0005" },
  { wallet: "0xFFFF5678901234567890123456789012345678", handle: "frank.base", code: "FX-FRANK06" },
  { wallet: "0x11115678901234567890123456789012345678", handle: "grace.base", code: "FX-GRACE07" },
  { wallet: "0x22225678901234567890123456789012345678", handle: "hank.base", code: "FX-HANK008" },
  { wallet: "0x33335678901234567890123456789012345678", handle: "iris.base", code: "FX-IRIS009" },
  { wallet: "0x44445678901234567890123456789012345678", handle: "jack.base", code: "FX-JACK010" },
]

async function main() {
  console.log("Seeding 10 test users with referral chain...")

  // Create users
  const users: any[] = []
  for (const u of testUsers) {
    const user = await prisma.user.upsert({
      where: { walletAddress: u.wallet },
      update: {},
      create: {
        walletAddress: u.wallet, handle: u.handle, referralCode: u.code,
        role: "user", balance: 5000, totalDeposited: 5000,
      },
    })
    users.push(user)
    console.log(`  Created: ${user.handle} (${u.code})`)
  }

  // Create referral chain: alice → bob → carol → dave → eve → frank → grace → hank → iris → jack
  // So jack's bets give commissions to iris(L1), hank(L2), grace(L3), frank(L4), eve(L5)
  for (let i = 1; i < users.length; i++) {
    await prisma.referral.upsert({
      where: { userId: users[i].id },
      update: {},
      create: { userId: users[i].id, inviterId: users[i - 1].id, level: 1 },
    })
    await prisma.user.update({
      where: { id: users[i].id },
      data: { referredBy: users[i - 1].id },
    })
    console.log(`  Referral: ${users[i-1].handle} → ${users[i].handle}`)
  }

  // Create some commissions
  const baseUser = users[users.length - 1] // jack
  for (let level = 1; level <= 5 && level < users.length; level++) {
    const toUser = users[users.length - 1 - level]
    await prisma.commission.create({
      data: {
        fromUserId: baseUser.id, toUserId: toUser.id,
        orderId: "seed-order-001", level,
        rate: [30, 20, 10, 5, 5][level - 1],
        betAmount: 100, commissionAmount: 100 * 0.025 * [30, 20, 10, 5, 5][level - 1] / 100,
        marketQuestion: "种子测试数据",
      }
    })
    console.log(`  Commission L${level}: ${baseUser.handle} bet → ${toUser.handle} gets ${[30,20,10,5,5][level-1]}%`)
  }

  console.log(`\nDone: ${users.length} users, ${users.length-1} referrals, 5 commissions`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
