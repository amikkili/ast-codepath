// components/Skeletons.js  ← NEW FILE
// Reusable skeleton loading components — replace blank white flashes
// with smooth animated grey placeholders

// ── Base skeleton block ───────────────────────────────────────────────────────
export function SkeletonBlock({ className = '' }) {
  return <div className={`bg-[#2a2f3e] rounded animate-pulse ${className}`} />
}

// ── Dashboard skeleton ────────────────────────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <SkeletonBlock className="h-3 w-32 mb-2" />
        <SkeletonBlock className="h-7 w-52 mb-1" />
        <SkeletonBlock className="h-3 w-48" />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[...Array(4)].map((_,i) => (
          <div key={i} className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-4">
            <SkeletonBlock className="h-3 w-24 mb-2" />
            <SkeletonBlock className="h-7 w-16" />
          </div>
        ))}
      </div>
      {/* Course cards */}
      <SkeletonBlock className="h-4 w-32 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_,i) => (
          <div key={i} className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <SkeletonBlock className="h-2 w-2 rounded-full" />
              <SkeletonBlock className="h-3 w-16" />
            </div>
            <SkeletonBlock className="h-4 w-40 mb-2" />
            <SkeletonBlock className="h-3 w-32 mb-4" />
            <SkeletonBlock className="h-1 w-full rounded-full mb-1" />
            <SkeletonBlock className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Course player skeleton ────────────────────────────────────────────────────
export function CourseSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-[#0f1117] overflow-hidden animate-pulse">
      {/* Top bar */}
      <div className="h-12 bg-[#161b27] border-b border-[#2a2f3e] flex items-center px-4 gap-4">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-3 w-1 mx-2" />
        <SkeletonBlock className="h-3 w-40" />
        <div className="ml-auto flex items-center gap-3">
          <SkeletonBlock className="h-1 w-20" />
          <SkeletonBlock className="h-3 w-12" />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-52 bg-[#161b27] border-r border-[#2a2f3e] p-4 flex flex-col gap-3">
          <SkeletonBlock className="h-3 w-28 mb-2" />
          {[...Array(6)].map((_,i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <SkeletonBlock className="h-2.5 w-20" />
              <SkeletonBlock className="h-3 w-36" />
              <SkeletonBlock className="h-2.5 w-12" />
            </div>
          ))}
        </div>
        {/* Video area */}
        <div className="flex-1 flex flex-col">
          <SkeletonBlock className="w-full bg-[#161b27]" style={{ height: '55%' }} />
          <div className="p-4 flex flex-col gap-3">
            <SkeletonBlock className="h-4 w-64" />
            <div className="flex gap-2">
              <SkeletonBlock className="h-5 w-16 rounded-full" />
              <SkeletonBlock className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>
        {/* AI panel */}
        <div className="w-64 bg-[#161b27] border-l border-[#2a2f3e] p-4 flex flex-col gap-3">
          <SkeletonBlock className="h-4 w-32 mb-2" />
          {[...Array(3)].map((_,i) => (
            <div key={i} className={`flex flex-col gap-1.5 ${i % 2 === 0 ? 'items-start' : 'items-end'}`}>
              <SkeletonBlock className={`h-12 rounded-xl ${i % 2 === 0 ? 'w-48' : 'w-36'}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Admin skeleton ────────────────────────────────────────────────────────────
export function AdminSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 animate-pulse">
      <SkeletonBlock className="h-3 w-48 mb-2" />
      <SkeletonBlock className="h-7 w-56 mb-2" />
      <SkeletonBlock className="h-3 w-72 mb-8" />
      <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl p-6 mb-6">
        <SkeletonBlock className="h-4 w-40 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_,i) => (
            <div key={i} className="flex flex-col gap-2">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#161b27] border border-[#2a2f3e] rounded-xl overflow-hidden">
        {[...Array(4)].map((_,i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-[#1a1d2a]">
            <SkeletonBlock className="h-3 w-4" />
            <SkeletonBlock className="h-3 w-40" />
            <SkeletonBlock className="h-3 w-28" />
            <SkeletonBlock className="h-5 w-14 rounded-full ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
