"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

export function ProbabilityChart({ data, className }: { data: number[]; className?: string }) {
  const w = 600
  const h = 200
  const { line, area, last } = useMemo(() => {
    const min = Math.min(...data) - 6
    const max = Math.max(...data) + 6
    const range = max - min || 1
    const pts = data.map((d, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((d - min) / range) * h
      return [x, y] as const
    })
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")
    const area = `${line} L${w},${h} L0,${h} Z`
    return { line, area, last: pts[pts.length - 1] }
  }, [data])

  return (
    <div className={cn("relative w-full", className)}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-48 w-full sm:h-64">
        <defs>
          <linearGradient id="prob-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1="0" y1={h * g} x2={w} y2={h * g} stroke="var(--border)" strokeWidth="1" />
        ))}
        <path d={area} fill="url(#prob-fill)" />
        <path
          d={line}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={last[0]} cy={last[1]} r="4" fill="var(--primary)" stroke="var(--background)" strokeWidth="2" />
      </svg>
    </div>
  )
}
