import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AppShell } from '@/components/app-shell'
import { AuthProvider } from '@/lib/auth-context'
import { ChainProvider } from '@/components/chain-provider'
import { ThemeProvider } from '@/components/theme-provider'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'FutureX — Predict the Future. Earn the Reward.',
  description:
    '下一代预测市场，覆盖体育、加密货币、AI 与全球大事件。以优雅、沉浸的体验预测未来，赢取奖励。',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'FutureX' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1a1d2e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={`dark ${geistSans.variable} ${geistMono.variable} bg-background`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('futurex-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}var d=document.documentElement;d.classList.toggle('dark',t==='dark');d.style.colorScheme=t;}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <ThemeProvider>
            <ChainProvider>
              <AppShell>{children}</AppShell>
            </ChainProvider>
          </ThemeProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
