export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

export const GA_LINKER_DOMAINS = (process.env.NEXT_PUBLIC_GA_LINKER_DOMAINS ?? '')
  .split(',')
  .map((domain) => domain.trim())
  .filter(Boolean);

export interface GoogleAnalyticsConfig {
  page_path: string;
  send_page_view?: boolean;
  linker?: {
    domains: string[];
    accept_incoming: boolean;
  };
}

export function buildGoogleAnalyticsConfig(pagePath: string): GoogleAnalyticsConfig {
  return {
    page_path: pagePath,
    send_page_view: false,
    ...(GA_LINKER_DOMAINS.length > 0
      ? {
          linker: {
            domains: GA_LINKER_DOMAINS,
            accept_incoming: true,
          },
        }
      : {}),
  };
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetIdOrName: string | Date,
      params?: GoogleAnalyticsConfig | Record<string, unknown>
    ) => void;
    __gaLinkerDomains?: string[];
  }
}

export function trackPageView(pagePath: string) {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('config', GA_MEASUREMENT_ID, buildGoogleAnalyticsConfig(pagePath));
}
