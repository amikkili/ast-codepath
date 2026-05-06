import { db } from '../../../lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  const userPlan = session?.user?.plan || 'FREE'

  const courses = await db.course.findMany({
    where: { published: true },
    include: {
      lessons: {
        where: { published: true },
        orderBy: { lessonNo: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Mark which lessons are accessible based on user plan
  const planOrder = { FREE: 0, BASIC: 1, PRO: 2 }
  const enriched = courses.map((c) => ({
    ...c,
    lessons: c.lessons.map((l) => ({
      ...l,
      accessible: planOrder[userPlan] >= planOrder[l.accessPlan],
    })),
  }))

  return Response.json({ courses: enriched })
}
