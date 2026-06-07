"use client"

import { chainMeta, type Chain } from "@/lib/data"
import { cn } from "@/lib/utils"

const ring: Record<Chain, string> = {
  base: "ring-primary/40 bg-primary/10",
  bsc: "ring-chart-4/40 bg-chart-4/10",
}

/** Small inline chain badge used on cards and detail headers */
export function ChainBadge({ chain, className }: { chain: Chain; className?: string }) {
  const m = chainMeta[chain]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1",
        ring[chain],
        m.color,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", m.dot)} aria-hidden />
      {m.short}
    </span>
  )
}
