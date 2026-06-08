"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BarChart3,
  Users,
  CheckCircle,
  Settings,
  ChevronLeft,
  ClipboardCheck,
  PlusCircle,
  SlidersHorizontal,
  Star,
  Gift,
  DollarSign,
  ArrowDownUp,
  Receipt,
  Building2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", label: "总览", icon: LayoutDashboard, exact: true },

  // P1 核心功能
  { href: "/admin/review", label: "审核中心", icon: ClipboardCheck },
  { href: "/admin/create", label: "市场创建", icon: PlusCircle },
  { href: "/admin/markets", label: "市场管理", icon: BarChart3 },
  { href: "/admin/odds", label: "赔率配置", icon: SlidersHorizontal },
  { href: "/admin/featured", label: "引流市场", icon: Star },

  // P2 用户与数据
  { href: "/admin/users", label: "用户管理", icon: Users },
  { href: "/admin/referrals", label: "邀请管理", icon: Gift },
  { href: "/admin/finance", label: "财务统计", icon: DollarSign },

  { href: "/admin/orders", label: "订单管理", icon: Receipt },

  // 结算与设置
  { href: "/admin/treasury", label: "资金池", icon: Building2 },
  { href: "/admin/withdrawals", label: "提现管理", icon: ArrowDownUp },
  { href: "/admin/settlement", label: "结算管理", icon: CheckCircle },
  { href: "/admin/settings", label: "系统设置", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl gap-6 px-4 py-6 sm:px-6">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-22 flex flex-col gap-1">
          <Link
            href="/"
            className="mb-3 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" />
            返回首页
          </Link>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </aside>

      {/* Mobile nav: horizontal scroll */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "glass text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
