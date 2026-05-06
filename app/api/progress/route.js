import { db } from '../../../lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const progress = await db.progress.findMany({
    where: { userId: session.user.id },
    select: { lessonId: true, done: true },
  })
  return Response.json({ progress })
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { lessonId, done } = await req.json()
  if (!lessonId) return Response.json({ error: 'lessonId required' }, { status: 400 })

  const progress = await db.progress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    update: { done },
    create: { userId: session.user.id, lessonId, done: done ?? true },
  })
  return Response.json({ progress })
}
