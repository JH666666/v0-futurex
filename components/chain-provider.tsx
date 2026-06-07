"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Chain } from "@/lib/data"

type ChainContextValue = {
  /** The chain the connected wallet is operating on */
  activeChain: Chain
  setActiveChain: (c: Chain) => void
  /** Market list filter: a specific chain or "all" */
  filterChain: Chain | "all"
  setFilterChain: (c: Chain | "all") => void
}

const ChainContext = createContext<ChainContextValue | null>(null)

export function ChainProvider({ children }: { children: ReactNode }) {
  const [activeChain, setActiveChain] = useState<Chain>("base")
  const [filterChain, setFilterChain] = useState<Chain | "all">("all")

  return (
    <ChainContext.Provider value={{ activeChain, setActiveChain, filterChain, setFilterChain }}>
      {children}
    </ChainContext.Provider>
  )
}

export function useChain() {
  const ctx = useContext(ChainContext)
  if (!ctx) throw new Error("useChain must be used within ChainProvider")
  return ctx
}
