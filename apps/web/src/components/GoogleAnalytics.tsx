import Script from 'next/script'
import {
  buildGoogleAnalyticsConfig,
  GA_LINKER_DOMAINS,
  GA_MEASUREMENT_ID,
} from '@/lib/analytics'

export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null
  }

  const config = buildGoogleAnalyticsConfig('__PAGE_PATH_PLACEHOLDER__')

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', ${JSON.stringify(config).replace('"__PAGE_PATH_PLACEHOLDER__"', 'window.location.pathname')});
        `}
      </Script>
      {GA_LINKER_DOMAINS.length > 0 ? (
        <Script id="google-analytics-linker-domains" strategy="afterInteractive">
          {`window.__gaLinkerDomains = ${JSON.stringify(GA_LINKER_DOMAINS)};`}
        </Script>
      ) : null}
    </>
  )
}
