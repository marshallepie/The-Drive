import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'The Drive — Investor Preview',
  description: 'Invited-access preview of The Drive while the marketplace remains under construction.',
  openGraph: {
    title: 'The Drive — Investor Preview',
    description: 'Invited-access preview of The Drive while the marketplace remains under construction.',
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
    title: 'The Drive — Investor Preview',
    description: 'Invited-access preview of The Drive while the marketplace remains under construction.',
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
