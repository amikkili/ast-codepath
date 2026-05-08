// app/api/progress/route.js  ← REPLACE existing file
// UPDATED: After marking a lesson done, checks if course is complete
//          → automatically triggers certificate generation
import { db }             from '../../../lib/db'
import { getServerSession } from 'next-auth'
import { authOptions }    from '../../../lib/auth'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const progress = await db.progress.findMany({
    where:  { userId: session.user.id },
    select: { lessonId: true, done: true },
  })
  return Response.json({ progress })
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { lessonId, done } = await req.json()
  if (!lessonId) return Response.json({ error: 'lessonId required' }, { status: 400 })

  // Save progress
  const progress = await db.progress.upsert({
    where:  { userId_lessonId: { userId: session.user.id, lessonId } },
    update: { done },
    create: { userId: session.user.id, lessonId, done: done ?? true },
  })

  // ── Check if this completes the course ───────────────────────────────────
  let courseCompleted = false
  let certificateIssued = false

  if (done) {
    // Find which course this lesson belongs to
    const lesson = await db.lesson.findUnique({
      where:   { id: lessonId },
      select:  { courseId: true },
    })

    if (lesson) {
      // Count total lessons in this course
      const totalLessons = await db.lesson.count({
        where: { courseId: lesson.courseId, published: true },
      })

      // Count how many the student has done in this course
      const courseLessonIds = await db.lesson.findMany({
        where:  { courseId: lesson.courseId, published: true },
        select: { id: true },
      })
      const ids     = courseLessonIds.map(l => l.id)
      const doneCount = await db.progress.count({
        where: { userId: session.user.id, lessonId: { in: ids }, done: true },
      })

      if (doneCount >= totalLessons) {
        courseCompleted = true

        // ── Trigger certificate generation (non-blocking) ─────────────────
        try {
          const appUrl  = process.env.NEXTAUTH_URL || 'http://localhost:3000'
          const certRes = await fetch(`${appUrl}/api/certificate`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', Cookie: req.headers.get('cookie') || '' },
            body:    JSON.stringify({ courseId: lesson.courseId }),
          })
          const certData = await certRes.json()
          if (certData.certificate) {
            certificateIssued = !certData.alreadyIssued
          }
        } catch (err) {
          // Non-critical — log but don't fail the progress save
          console.error('Certificate generation error (non-critical):', err)
        }
      }
    }
  }

  return Response.json({ progress, courseCompleted, certificateIssued })
}
