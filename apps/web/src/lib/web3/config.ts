import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia, mainnet } from 'wagmi/chains'
import type { Config } from 'wagmi'

export const config: Config = getDefaultConfig({
  appName: 'Drive Platform',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: process.env.NODE_ENV === 'production' ? [mainnet] : [sepolia],
  ssr: true,
})
