import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  console.log("Seeding FutureX...")

  const u1 = await prisma.user.upsert({
    where: { walletAddress: "0x7a3F9C21Ab1234DeF5678901234567890ABCDEF0" },
    update: {}, create: {
      walletAddress: "0x7a3F9C21Ab1234DeF5678901234567890ABCDEF0",
      handle: "vitalik.base", nickname: "Vitalik", referralCode: "FX-VITALIK",
      role: "admin", level: 4, balance: 5000, totalDeposited: 5000,
      kycStatus: "APPROVED", kycName: "V", kycCountry: "CH",
    },
  }); console.log("1:", u1.handle)

  const u2 = await prisma.user.create({
    data: {
      walletAddress: "0x2b8D4F12Bb5678CDe9012345678901234ABCDEF0",
      handle: "king.base", nickname: "King", referralCode: "FX-KING",
      role: "user", level: 2, balance: 3200, totalDeposited: 3000,
      kycStatus: "PENDING", kycName: "K", kycCountry: "US",
    },
  }); console.log("2:", u2.handle)

  const u3 = await prisma.user.create({
    data: {
      walletAddress: "0xCCCC6789012345678901234567890123456780",
      handle: "whale.base", nickname: "Whale", referralCode: "FX-WHALE",
      role: "user", level: 5, balance: 15000, totalDeposited: 12000,
      kycStatus: "APPROVED", kycName: "W", kycCountry: "SG",
    },
  }); console.log("3:", u3.handle)

  const sets = [
    ["platform_fee","2.5"],["min_trade_amount","10"],["auto_approve_limit","100"],
    ["min_withdraw_amount","10"],["withdraw_fee","2"],
    ["referral_rate_l1","30"],["referral_rate_l2","20"],["referral_rate_l3","10"],
    ["referral_rate_l4","5"],["referral_rate_l5","5"],
  ]
  for (const [k,v] of sets) {
    await prisma.systemSetting.upsert({where:{key:k},update:{},create:{key:k,value:v,description:k}})
  }
  console.log("Settings:", sets.length, "items")
}

main().catch(e=>{console.error(e.message);process.exit(1)}).finally(()=>prisma.$disconnect())
