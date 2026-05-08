// app/layout.js  ← REPLACE existing file
// ADDED: Root SEO metadata, Open Graph tags, Google Analytics
import './globals.css'
import { COMPANY } from '../lib/constants'
import { SessionProvider } from './providers'
import Script from 'next/script'

// ── Root metadata — applies to ALL pages unless overridden ────────────────────
export const metadata = {
  metadataBase: new URL('https://www.anilsofttech.com'),
  title: {
    default: `${COMPANY.product} — Learn Programming with AI | ${COMPANY.name}`,
    template: `%s | ${COMPANY.product}`,
  },
  description: `${COMPANY.tagline}. Expert programming courses in Python, JavaScript, Java + AI doubt-clearing agent available 24/7. By ${COMPANY.name}.`,
  keywords: [
    'online programming courses India',
    'learn Python online',
    'learn JavaScript online',
    'coding courses Andhra Pradesh',
    'AI programming tutor',
    'CodePath',
    'Anil Software Technologies',
    'online coding coaching',
    'programming doubt clearing',
    'IT courses India',
  ],
  authors: [{ name: COMPANY.ceo, url: 'https://www.anilsofttech.com/about' }],
  creator: COMPANY.name,
  publisher: COMPANY.name,

  // ── Open Graph (Facebook, WhatsApp, LinkedIn previews) ───────────────────
  openGraph: {
    type:        'website',
    locale:      'en_IN',
    url:         'https://www.anilsofttech.com',
    siteName:    `${COMPANY.product} by ${COMPANY.name}`,
    title:       `${COMPANY.product} — Learn Programming with AI`,
    description: `Expert video lessons + AI doubt clearing agent. Python, JavaScript, Java and more. By ${COMPANY.name}.`,
    images: [{
      url:    '/og-image.png',   // create a 1200x630 banner image and save here
      width:  1200,
      height: 630,
      alt:    `${COMPANY.product} — Online Programming Courses`,
    }],
  },

  // ── Twitter/X card ────────────────────────────────────────────────────────
  twitter: {
    card:        'summary_large_image',
    title:       `${COMPANY.product} — Learn Programming with AI`,
    description: `Expert programming courses + AI doubt-clearing agent. Available 24/7.`,
    images:      ['/og-image.png'],
  },

  // ── Robots ────────────────────────────────────────────────────────────────
  robots: {
    index:          true,
    follow:         true,
    googleBot: {
      index:             true,
      follow:            true,
      'max-image-preview': 'large',
    },
  },

  // ── Verification (add your Google Search Console code here) ──────────────
  // verification: { google: 'your-google-site-verification-code' },
}

// ── Replace with your real GA4 Measurement ID ─────────────────────────────────
// Get from: analytics.google.com → Admin → Data Streams → your stream → Measurement ID
// Looks like: G-XXXXXXXXXX
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ''

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#534AB7" />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>

        {/* ── Google Analytics 4 ───────────────────────────────────────── */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
