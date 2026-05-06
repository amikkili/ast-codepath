import './globals.css'
import { COMPANY } from '../lib/constants'
import { SessionProvider } from './providers'

export const metadata = {
  title: `${COMPANY.product} — ${COMPANY.name}`,
  description: `${COMPANY.tagline}. Online programming courses by ${COMPANY.name}.`,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
