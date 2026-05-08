// middleware.js  ← REPLACE your existing middleware.js
// FIX: Added '/profile' alongside '/profile/:path*'
// In Next.js 14, ':path*' means "zero or more" but some builds need explicit path too

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token    = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Admin-only protection
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: '/login' },
  }
)

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/course/:path*',
    '/admin',
    '/admin/:path*',
    '/upgrade',
    '/profile',           // ← explicit match for /profile
    '/profile/:path*',    // ← match for /profile/anything
  ],
}
