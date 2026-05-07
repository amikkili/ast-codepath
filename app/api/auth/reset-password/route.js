// app/api/auth/reset-password/route.js  ← REPLACE
// FIX: Corrected import paths
import { db }    from '../../../../lib/db'
import bcrypt    from 'bcryptjs'

export async function POST(req) {
  const { token, password } = await req.json()

  if (!token || !password)
    return Response.json({ error: 'Token and password are required' }, { status: 400 })

  if (password.length < 6)
    return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

  const record = await db.passwordResetToken.findUnique({
    where:   { token },
    include: { user: true },
  })

  if (!record)
    return Response.json({ error: 'Invalid or expired reset link' }, { status: 400 })

  if (record.used)
    return Response.json({ error: 'This reset link has already been used' }, { status: 400 })

  if (new Date() > record.expiresAt)
    return Response.json({ error: 'Reset link has expired. Request a new one.' }, { status: 400 })

  const hashed = await bcrypt.hash(password, 10)

  await db.user.update({
    where: { id: record.userId },
    data:  { password: hashed },
  })

  await db.passwordResetToken.update({
    where: { id: record.id },
    data:  { used: true },
  })

  return Response.json({ message: 'Password updated successfully. You can now sign in.' })
}
