"use client"

import { usePathname } from "next/navigation"
import { SiteHeader, MobileNav } from "@/components/site-nav"

/**
 * AppShell — 根据路由决定显示前台还是后台布局
 *
 * /admin/* 路由 → 只渲染子页面，不显示前台导航
 * 其他路由   → 正常显示头部导航 + 底部 Tab
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")

  if (isAdmin) {
    // 后台：不要前台导航，直接渲染子页面（admin 有自己的 layout）
    return <>{children}</>
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen pb-24 lg:pb-0">{children}</main>
      <MobileNav />
    </>
  )
}
