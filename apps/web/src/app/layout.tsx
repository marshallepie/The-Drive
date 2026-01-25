import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'The Drive - Automotive Marketplace',
  description: 'Buy and sell vehicles with traditional or Web3 payments',
  openGraph: {
    title: 'The Drive - Automotive Marketplace',
    description: 'Buy and sell vehicles with traditional or Web3 payments',
    images: [
      {
        url: '/drive-front-page-range.png',
        width: 1200,
        height: 600,
        alt: 'The Drive - Automotive Marketplace',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Drive - Automotive Marketplace',
    description: 'Buy and sell vehicles with traditional or Web3 payments',
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
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
