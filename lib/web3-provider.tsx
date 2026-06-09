"use client"

import { WagmiProvider, createConfig, http } from "wagmi"
import { base, bsc } from "wagmi/chains"
import { injected, coinbaseWallet } from "wagmi/connectors"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"

const config = createConfig({
  chains: [base, bsc],
  transports: {
    [base.id]: http(),
    [bsc.id]: http(),
  },
  connectors: [
    injected({ target: "metaMask" }),
    injected({ target: { id: "okxWallet", name: "OKX Wallet", provider: typeof window !== "undefined" ? (window as any).okxwallet : undefined } }),
    coinbaseWallet({ appName: "FutureX" }),
  ],
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
