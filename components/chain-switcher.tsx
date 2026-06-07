"use client"

import { useState } from "react"
import { ChevronDown, Check } from "lucide-react"
import { chainMeta, chainOrder } from "@/lib/data"
import { useChain } from "@/components/chain-provider"
import { cn } from "@/lib/utils"

/** Network switcher used in the header — switches the wallet's active chain */
export function ChainSwitcher({ className }: { className?: string }) {
  const { activeChain, setActiveChain } = useChain()
  const [open, setOpen] = useState(false)
  const active = chainMeta[activeChain]

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-11 items-center gap-2 rounded-full glass px-3 text-sm font-semibold"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={cn("size-2 rounded-full", active.dot)} aria-hidden />
        <span className="hidden sm:inline">{active.short}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-13 z-50 w-52 rounded-2xl glass-strong p-2 shadow-2xl" role="listbox">
            <p className="px-3 py-1.5 text-xs text-muted-foreground">选择网络</p>
            {chainOrder.map((c) => {
              const m = chainMeta[c]
              const selected = c === activeChain
              return (
                <button
                  key={c}
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setActiveChain(c)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-accent"
                >
                  <span className={cn("flex size-7 items-center justify-center rounded-full text-[10px] font-bold text-background", m.dot)}>
                    {m.symbol}
                  </span>
                  <span className="flex-1 text-left">
                    <span className="block font-semibold">{m.short}</span>
                    <span className="block text-xs text-muted-foreground">{m.token} 结算</span>
                  </span>
                  {selected && <Check className="size-4 text-yes" />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
