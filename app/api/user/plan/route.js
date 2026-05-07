// app/api/user/plan/route.js  ← REPLACE existing file
// Reads the REAL current plan from PostgreSQL database (not the cached JWT session)
// Called after payment to get the true updated plan
import { db } from '../../../../lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Always read from DB — never trust the cached JWT for plan status
  const user = await db.user.findUnique({
    where:  { id: session.user.id },
    select: { plan: true, name: true, email: true },
  })

  return Response.json({
    plan:  user?.plan  || 'FREE',
    name:  user?.name  || '',
    email: user?.email || '',
  })
}
