// middleware.js  ← REPLACE your existing middleware.js with this
// ─────────────────────────────────────────────────────────────────────────────
// FIX: Added /upgrade to protected routes so NextAuth always injects the
//      session cookie on that page. Without this, the page sometimes tries
//      to render before the session is available, treating the user as logged out.
// ─────────────────────────────────────────────────────────────────────────────
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token    = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Admin-only routes — redirect non-admins to dashboard
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // ── FIX: Return true = user is allowed through (session will be loaded)
      // If token is missing, NextAuth redirects to /login automatically
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: '/login' },
  }
)

// ── FIX: Added /upgrade to the matcher ───────────────────────────────────────
// This tells Next.js to always run auth middleware on /upgrade
// so the session cookie is always present when the page renders
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/course/:path*',
    '/admin/:path*',
    '/upgrade',          // ← THIS WAS MISSING — now session always loads here
  ],
}
