"use client"

import { WagmiProvider, createConfig, http } from "wagmi"
import { base, bsc } from "wagmi/chains"
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"

const config = getDefaultConfig({
  appName: "FutureX",
  projectId: "futurex-v1",
  chains: [base, bsc],
  transports: { [base.id]: http(), [bsc.id]: http() },
  connectors: [injected(), walletConnect({ projectId: "futurex-v1" }), coinbaseWallet({ appName: "FutureX" })],
  ssr: true,
})

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
