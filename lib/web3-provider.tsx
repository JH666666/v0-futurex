"use client"

import { WagmiProvider, createConfig, http } from "wagmi"
import { base, bsc } from "wagmi/chains"
import { injected, coinbaseWallet } from "wagmi/connectors"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider, darkTheme, getDefaultConfig } from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "00000000000000000000000000000000"

const config = getDefaultConfig({
  appName: "FutureX",
  projectId,
  chains: [base, bsc],
  transports: { [base.id]: http(), [bsc.id]: http() },
  ssr: true,
})

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
