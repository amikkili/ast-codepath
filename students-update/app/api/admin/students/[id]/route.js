// app/api/admin/students/[id]/route.js
// ─────────────────────────────────────────────────────────────────────────────
// PATCH  → update plan (FREE / BASIC / PRO)
// DELETE → remove student from database
// ─────────────────────────────────────────────────────────────────────────────
import { db } from '../../../../../lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return null
  return session
}

export async function PATCH(req, { params }) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { plan } = await req.json()
  if (!['FREE', 'BASIC', 'PRO'].includes(plan))
    return Response.json({ error: 'Invalid plan' }, { status: 400 })

  const user = await db.user.update({
    where: { id: params.id },
    data: { plan },
    select: { id: true, name: true, email: true, plan: true },
  })
  return Response.json({ student: user })
}

export async function DELETE(req, { params }) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Forbidden' }, { status: 403 })

  // Safety: do not allow deleting yourself
  if (params.id === session.user.id)
    return Response.json({ error: 'Cannot delete your own admin account' }, { status: 400 })

  await db.user.delete({ where: { id: params.id } })
  return Response.json({ ok: true })
}
