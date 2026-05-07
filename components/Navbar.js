'use client'
// components/Navbar.js  ← REPLACE existing file
// ADDED: Mobile hamburger menu, responsive layout
import { useState }          from 'react'
import Link                  from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { COMPANY }           from '../lib/constants'

export default function Navbar() {
  const { data: session }  = useSession()
  const [menuOpen, setMenu] = useState(false)

  return (
    <nav className="h-14 bg-[#161b27] border-b border-[#2a2f3e] flex items-center justify-between px-4 md:px-6 flex-shrink-0 relative">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 z-10">
        <span className="w-2.5 h-2.5 rounded-full bg-[#534AB7] flex-shrink-0" />
        <span className="text-[15px] font-medium text-[#e2e8f0]">{COMPANY.product}</span>
        <span className="text-[10px] text-[#5a6278] hidden lg:block">by {COMPANY.name}</span>
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-6">
        <Link href="/#courses" className="text-xs text-[#8892a4] hover:text-[#e2e8f0] transition-colors">Courses</Link>
        <Link href={session ? '/upgrade' : '/#pricing'} className="text-xs text-[#8892a4] hover:text-[#e2e8f0] transition-colors">Pricing</Link>
        {session?.user?.role === 'ADMIN' && (
          <Link href="/admin" className="text-xs text-[#7f77dd] hover:text-[#e2e8f0] transition-colors">Admin</Link>
        )}
      </div>

      {/* Desktop right */}
      <div className="hidden md:flex items-center gap-3">
        {session ? (
          <>
            <Link href="/dashboard" className="text-xs text-[#c8d0e0] hover:text-[#e2e8f0] transition-colors">Dashboard</Link>
            <Link href="/upgrade">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full cursor-pointer ${
                session.user.plan === 'PRO'   ? 'bg-[#1e2a1e] text-[#1D9E75]' :
                session.user.plan === 'BASIC' ? 'bg-[#1e1e2a] text-[#7f77dd]' :
                'bg-[#2a2f3e] text-[#8892a4]'}`}>
                {session.user.plan}
              </span>
            </Link>
            <button onClick={() => signOut({ callbackUrl: '/' })} className="text-xs text-[#8892a4] hover:text-[#e2e8f0] transition-colors">
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-xs text-[#c8d0e0] border border-[#2a2f3e] rounded-md px-3 py-1.5 hover:bg-[#2a2f3e]/30 transition-colors">Sign in</Link>
            <Link href="/login?tab=signup" className="text-xs bg-[#534AB7] text-[#EEEDFE] font-medium px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity">Start free</Link>
          </>
        )}
      </div>

      {/* Mobile right — plan badge + hamburger */}
      <div className="flex md:hidden items-center gap-3 z-10">
        {session && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            session.user.plan === 'PRO'   ? 'bg-[#1e2a1e] text-[#1D9E75]' :
            session.user.plan === 'BASIC' ? 'bg-[#1e1e2a] text-[#7f77dd]' :
            'bg-[#2a2f3e] text-[#8892a4]'}`}>
            {session.user.plan}
          </span>
        )}
        <button
          onClick={() => setMenu(!menuOpen)}
          className="w-8 h-8 flex flex-col items-center justify-center gap-1.5 rounded-md hover:bg-[#2a2f3e]/50 transition-colors"
          aria-label="Toggle menu"
        >
          <span className={`block w-4 h-0.5 bg-[#c8d0e0] transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-4 h-0.5 bg-[#c8d0e0] transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-4 h-0.5 bg-[#c8d0e0] transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-[#161b27] border-b border-[#2a2f3e] z-50 md:hidden shadow-lg">
          <div className="flex flex-col py-2">
            {session ? (
              <>
                <Link href="/dashboard" onClick={() => setMenu(false)}
                  className="px-5 py-3 text-sm text-[#c8d0e0] hover:bg-[#2a2f3e]/30 transition-colors">
                  Dashboard
                </Link>
                <Link href="/#courses" onClick={() => setMenu(false)}
                  className="px-5 py-3 text-sm text-[#8892a4] hover:bg-[#2a2f3e]/30 transition-colors">
                  Courses
                </Link>
                <Link href="/upgrade" onClick={() => setMenu(false)}
                  className="px-5 py-3 text-sm text-[#8892a4] hover:bg-[#2a2f3e]/30 transition-colors">
                  Pricing & Plans
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin" onClick={() => setMenu(false)}
                    className="px-5 py-3 text-sm text-[#7f77dd] hover:bg-[#2a2f3e]/30 transition-colors">
                    Admin Panel
                  </Link>
                )}
                <div className="border-t border-[#2a2f3e] mt-1 pt-1">
                  <button onClick={() => { setMenu(false); signOut({ callbackUrl: '/' }) }}
                    className="w-full text-left px-5 py-3 text-sm text-[#8892a4] hover:bg-[#2a2f3e]/30 transition-colors">
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/#courses" onClick={() => setMenu(false)}
                  className="px-5 py-3 text-sm text-[#8892a4] hover:bg-[#2a2f3e]/30">Courses</Link>
                <Link href="/#pricing" onClick={() => setMenu(false)}
                  className="px-5 py-3 text-sm text-[#8892a4] hover:bg-[#2a2f3e]/30">Pricing</Link>
                <div className="border-t border-[#2a2f3e] mt-1 pt-1 px-4 pb-3 flex gap-3">
                  <Link href="/login" onClick={() => setMenu(false)}
                    className="flex-1 text-center text-xs text-[#c8d0e0] border border-[#2a2f3e] rounded-md px-3 py-2 hover:bg-[#2a2f3e]/30">
                    Sign in
                  </Link>
                  <Link href="/login?tab=signup" onClick={() => setMenu(false)}
                    className="flex-1 text-center text-xs bg-[#534AB7] text-[#EEEDFE] font-medium px-3 py-2 rounded-md hover:opacity-90">
                    Start free
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
