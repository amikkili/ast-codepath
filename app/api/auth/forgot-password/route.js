// app/api/auth/forgot-password/route.js  ← NEW FILE
// Generates a secure one-time reset token, saves it in DB, sends reset email.
import { db }                           from '../../../../lib/db'
import { sendEmail, passwordResetEmail } from '../../../../lib/email'
import crypto                            from 'crypto'

export async function POST(req) {
  const { email } = await req.json()

  if (!email)
    return Response.json({ error: 'Email is required' }, { status: 400 })

  // Always return success — never reveal whether email exists (security)
  const successResponse = Response.json({
    message: 'If that email exists, a reset link has been sent.',
  })

  const user = await db.user.findUnique({ where: { email } })
  if (!user) return successResponse  // don't reveal user doesn't exist

  // Delete any existing tokens for this user
  await db.passwordResetToken.deleteMany({ where: { userId: user.id } })

  // Generate a secure random token
  const token     = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

  await db.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  })

  const appUrl   = process.env.NEXTAUTH_URL || 'https://www.anilsofttech.com'
  const resetUrl = `${appUrl}/reset-password?token=${token}`

  const template = passwordResetEmail({
    name:             user.name,
    resetUrl,
    expiresInMinutes: 30,
  })

  await sendEmail({ to: email, ...template })

  return successResponse
}
