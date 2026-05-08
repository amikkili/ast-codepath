// app/not-found.js  ← NEW FILE
// Next.js automatically uses this for all 404 errors
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center px-6 text-center">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-12">
        <span className="w-2.5 h-2.5 rounded-full bg-[#534AB7]" />
        <span className="text-[15px] font-medium text-[#e2e8f0]">CodePath</span>
      </Link>

      {/* 404 graphic */}
      <div className="relative mb-6">
        <p className="text-[120px] font-bold text-[#1e1e2a] leading-none select-none">404</p>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl">🔍</span>
        </div>
      </div>

      <h1 className="text-2xl font-medium text-[#e2e8f0] mb-3">Page not found</h1>
      <p className="text-sm text-[#8892a4] max-w-sm leading-relaxed mb-8">
        The page you are looking for does not exist or has been moved.
        Let's get you back on track.
      </p>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/"
          className="bg-[#534AB7] text-[#EEEDFE] text-sm font-medium px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
          Go to homepage
        </Link>
        <Link href="/dashboard"
          className="text-sm text-[#c8d0e0] border border-[#2a2f3e] px-6 py-2.5 rounded-lg hover:bg-[#2a2f3e]/30 transition-colors">
          Go to dashboard
        </Link>
      </div>

      {/* Helpful links */}
      <div className="mt-10 flex gap-6 text-[11px] text-[#5a6278]">
        {[['Courses','/#courses'],['Pricing','/upgrade'],['Contact','/contact'],['About','/about']].map(([l,h]) => (
          <Link key={l} href={h} className="hover:text-[#8892a4] transition-colors">{l}</Link>
        ))}
      </div>
    </div>
  )
}
