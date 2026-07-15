import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { Providers } from './providers'
import Navbar from '@/components/Navbar'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import RouteChangeTracker from '@/components/RouteChangeTracker'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://the-drive-web3.netlify.app'),
  title: 'The Drive — DRIVE Token Launch',
  description: 'Investor preview of The Drive token launch, roadmap, tokenomics, and compliance materials.',
  openGraph: {
    title: 'The Drive — DRIVE Token Launch',
    description: 'Investor preview of The Drive token launch, roadmap, tokenomics, and compliance materials.',
    images: [
      {
        url: '/drive-front-page-range.png',
        width: 1200,
        height: 600,
        alt: 'The Drive — Investor Preview',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Drive — DRIVE Token Launch',
    description: 'Investor preview of The Drive token launch, roadmap, tokenomics, and compliance materials.',
    images: ['/drive-front-page-range.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleAnalytics />
        <Providers>
          <Suspense fallback={null}>
            <RouteChangeTracker />
          </Suspense>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
