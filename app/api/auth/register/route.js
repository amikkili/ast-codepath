// app/api/auth/register/route.js  ← REPLACE
// FIX: Corrected import paths from ../../../  to  ../../../../
import { db }                            from '../../../../lib/db'
import { sendEmail, welcomeEmail }       from '../../../../lib/email'
import bcrypt                            from 'bcryptjs'

export async function POST(req) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password)
      return Response.json({ error: 'All fields are required' }, { status: 400 })

    const existing = await db.user.findUnique({ where: { email } })
    if (existing)
      return Response.json({ error: 'Email already registered' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 10)
    const user   = await db.user.create({
      data: { name, email, password: hashed, plan: 'FREE', role: 'STUDENT' },
    })

    // Send welcome email (non-blocking)
    const template = welcomeEmail({ name })
    sendEmail({ to: email, ...template }).catch(err => {
      console.error('Welcome email failed (non-critical):', err)
    })

    return Response.json({ message: 'Account created', userId: user.id })
  } catch (e) {
    console.error('Register error:', e)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
