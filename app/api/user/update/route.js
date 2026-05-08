// app/api/user/update/route.js  ← NEW FILE
import { db }             from '../../../../lib/db'
import { getServerSession } from 'next-auth'
import { authOptions }    from '../../../../lib/auth'
import bcrypt             from 'bcryptjs'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // ── Update name ───────────────────────────────────────────────────────────
  if (body.name && !body.currentPassword) {
    if (!body.name.trim())
      return Response.json({ error: 'Name cannot be empty' }, { status: 400 })
    await db.user.update({
      where: { id: session.user.id },
      data:  { name: body.name.trim() },
    })
    return Response.json({ ok: true, message: 'Name updated' })
  }

  // ── Change password ───────────────────────────────────────────────────────
  if (body.currentPassword && body.newPassword) {
    const user = await db.user.findUnique({ where: { id: session.user.id } })
    const valid = await bcrypt.compare(body.currentPassword, user.password)
    if (!valid)
      return Response.json({ error: 'Current password is incorrect' }, { status: 400 })
    if (body.newPassword.length < 6)
      return Response.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
    const hashed = await bcrypt.hash(body.newPassword, 10)
    await db.user.update({
      where: { id: session.user.id },
      data:  { password: hashed },
    })
    return Response.json({ ok: true, message: 'Password updated' })
  }

  return Response.json({ error: 'Invalid request' }, { status: 400 })
}
