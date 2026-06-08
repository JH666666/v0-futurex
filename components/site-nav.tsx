"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Trophy, Plus, Wallet2, Crown, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { WalletConnect } from "@/components/wallet-connect"
import { ChainSwitcher } from "@/components/chain-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"

const deskLinks = [
  { href: "/", label: "首页" },
  { href: "/world-cup", label: "世界杯中心" },
  { href: "/leaderboard", label: "排行榜" },
  { href: "/referral", label: "邀请" },
  { href: "/portfolio", label: "我的持仓" },
  { href: "/profile", label: "用户中心" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { isAdmin } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg brand-gradient font-bold text-background">
            X
          </span>
          <span className="hidden text-base font-bold tracking-tight sm:block">FutureX</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {deskLinks.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l.label}
              </Link>
            )
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith("/admin") ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              管理
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/create"
            className="hidden h-11 items-center gap-1.5 rounded-full glass px-4 text-sm font-semibold sm:inline-flex lg:hidden xl:inline-flex"
          >
            <Plus className="size-4" /> 创建预测
          </Link>
          <ThemeToggle />
          <ChainSwitcher />
          <WalletConnect />
        </div>
      </div>
    </header>
  )
}

export function MobileNav() {
  const pathname = usePathname()
  const links = [
    { href: "/", label: "首页", icon: Home },
    { href: "/world-cup", label: "世界杯", icon: Trophy },
    { href: "/create", label: "创建", icon: Plus },
    { href: "/portfolio", label: "持仓", icon: Wallet2 },
    { href: "/profile", label: "我的", icon: User },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/80 backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 px-2 pb-[env(safe-area-inset-bottom)]">
        {links.map((l) => {
          const Icon = l.icon
          const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href)
          const isCreate = l.href === "/create"
          return (
            <Link
              key={l.href}
              href={l.href}
              className="flex min-h-14 flex-col items-center justify-center gap-1 py-2"
            >
              {isCreate ? (
                <span className="-mt-5 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                  <Icon className="size-6" />
                </span>
              ) : (
                <Icon className={cn("size-5", active ? "text-primary" : "text-muted-foreground")} />
              )}
              <span className={cn("text-[10px] font-medium", active ? "text-foreground" : "text-muted-foreground")}>
                {l.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
