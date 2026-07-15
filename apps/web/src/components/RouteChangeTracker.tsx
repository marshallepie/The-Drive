'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackPageView } from '@/lib/analytics'

export default function RouteChangeTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) {
      return
    }

    const search = searchParams.toString()
    const pagePath = `${pathname}${search ? `?${search}` : ''}`
    trackPageView(pagePath)
  }, [pathname, searchParams])

  return null
}
