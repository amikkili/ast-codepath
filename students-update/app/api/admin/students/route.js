// app/api/admin/students/route.js
// ─────────────────────────────────────────────────────────────────────────────
// GET  → list all students with progress counts
// POST → create a new student account manually (admin only)
// ─────────────────────────────────────────────────────────────────────────────
import { db } from '../../../../lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  if (!await requireAdmin())
    return Response.json({ error: 'Forbidden' }, { status: 403 })

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, email: true,
      plan: true, role: true, createdAt: true,
      _count: { select: { progress: { where: { done: true } } } },
    },
  })

  return Response.json({ students: users })
}

export async function POST(req) {
  if (!await requireAdmin())
    return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { name, email, password, plan } = await req.json()
  if (!name || !email || !password)
    return Response.json({ error: 'name, email and password are required' }, { status: 400 })

  const existing = await db.user.findUnique({ where: { email } })
  if (existing)
    return Response.json({ error: 'Email already registered' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 10)
  const user = await db.user.create({
    data: { name, email, password: hashed, plan: plan || 'FREE', role: 'STUDENT' },
    select: { id: true, name: true, email: true, plan: true, role: true, createdAt: true },
  })
  return Response.json({ student: user })
}
