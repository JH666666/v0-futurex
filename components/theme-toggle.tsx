"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
      className={cn(
        "flex size-11 items-center justify-center rounded-full glass transition-colors active:scale-95",
        className,
      )}
    >
      {isDark ? <Moon className="size-5 text-foreground" /> : <Sun className="size-5 text-foreground" />}
    </button>
  )
}
