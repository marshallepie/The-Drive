'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Comma-separated list of domains for GA4 cross-domain (linker) tracking.
// gtag decorates outbound links to these domains with a _gl param so the
// session is stitched across them.
const GA_LINKER_DOMAINS = (process.env.NEXT_PUBLIC_GA_LINKER_DOMAINS || '')
  .split(',')
  .map((d) => d.trim())
  .filter(Boolean)

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

// Fires a GA page_view on every App Router client-side navigation.
// The initial load is tracked by the inline config snippet below; gtag does
// not see subsequent SPA route changes, so we send them manually here.
function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // Skip the first run: gtag's `config` already sends the initial page_view.
  // We only fire on subsequent client-side navigations to avoid double-counting.
  const isInitialLoad = useRef(true)

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      return
    }
    if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return

    const query = searchParams.toString()
    const url = query ? `${pathname}?${query}` : pathname

    window.gtag('event', 'page_view', {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [pathname, searchParams])

  return null
}

export default function GoogleAnalytics() {
  // No measurement ID configured => render nothing (e.g. local dev without GA).
  if (!GA_MEASUREMENT_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            send_page_view: true${
              GA_LINKER_DOMAINS.length
                ? `,
            linker: { domains: ${JSON.stringify(GA_LINKER_DOMAINS)}, accept_incoming: true }`
                : ''
            }
          });
        `}
      </Script>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  )
}
