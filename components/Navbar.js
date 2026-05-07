'use client'
// components/Navbar.js  ← REPLACE your existing Navbar.js with this
// FIX: "Pricing" now links to /upgrade (Stripe page) for logged-in users
//      instead of /#pricing (landing page section)
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { COMPANY } from '../lib/constants'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="h-14 bg-[#161b27] border-b border-[#2a2f3e] flex items-center justify-between px-6 flex-shrink-0">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#534AB7]" />
        <span className="text-[15px] font-medium text-[#e2e8f0]">{COMPANY.product}</span>
        <span className="text-[10px] text-[#5a6278] hidden md:block">by {COMPANY.name}</span>
      </Link>

      {/* Center links */}
      <div className="hidden md:flex items-center gap-6">
        <Link href="/#courses" className="text-xs text-[#8892a4] hover:text-[#e2e8f0] transition-colors">
          Courses
        </Link>

        {/* ── FIX: logged-in users go to /upgrade, guests go to /#pricing ── */}
        <Link
          href={session ? '/upgrade' : '/#pricing'}
          className="text-xs text-[#8892a4] hover:text-[#e2e8f0] transition-colors"
        >
          Pricing
        </Link>

        {session?.user?.role === 'ADMIN' && (
          <Link href="/admin" className="text-xs text-[#7f77dd] hover:text-[#e2e8f0] transition-colors">
            Admin
          </Link>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {session ? (
          <>
            <Link
              href="/dashboard"
              className="text-xs text-[#c8d0e0] hover:text-[#e2e8f0] transition-colors hidden md:block"
            >
              Dashboard
            </Link>

            {/* Plan badge — clicking it goes to upgrade page */}
            <Link href="/upgrade" className="flex items-center gap-2 group">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-all group-hover:opacity-80 ${
                session.user.plan === 'PRO'   ? 'bg-[#1e2a1e] text-[#1D9E75]' :
                session.user.plan === 'BASIC' ? 'bg-[#1e1e2a] text-[#7f77dd]' :
                'bg-[#2a2f3e] text-[#8892a4]'
              }`}>
                {session.user.plan}
              </span>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-xs text-[#8892a4] hover:text-[#e2e8f0] transition-colors"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-xs text-[#c8d0e0] border border-[#2a2f3e] rounded-md px-3 py-1.5 hover:bg-[#2a2f3e]/30 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/login?tab=signup"
              className="text-xs bg-[#534AB7] text-[#EEEDFE] font-medium px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity"
            >
              Start free
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
