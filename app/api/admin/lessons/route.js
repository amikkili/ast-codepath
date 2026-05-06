import { db } from '../../../../lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN')
    return null
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const courses = await db.course.findMany({
    include: { lessons: { orderBy: { lessonNo: 'asc' } } },
    orderBy: { createdAt: 'asc' },
  })
  return Response.json({ courses })
}

export async function POST(req) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { courseId, lessonNo, title, duration, videoId, accessPlan } = await req.json()

  if (!courseId || !lessonNo || !title || !videoId)
    return Response.json({ error: 'courseId, lessonNo, title and videoId are required' }, { status: 400 })

  const lesson = await db.lesson.create({
    data: {
      courseId,
      lessonNo: parseInt(lessonNo),
      title,
      duration: duration || '10 min',
      videoId,
      accessPlan: accessPlan || 'BASIC',
    },
  })
  return Response.json({ lesson })
}

export async function PUT(req) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id, ...data } = await req.json()
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const lesson = await db.lesson.update({ where: { id }, data })
  return Response.json({ lesson })
}

export async function DELETE(req) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await req.json()
  await db.lesson.delete({ where: { id } })
  return Response.json({ ok: true })
}
