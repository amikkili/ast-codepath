import { db } from '../../../../lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password)
      return Response.json({ error: 'All fields are required' }, { status: 400 })

    const existing = await db.user.findUnique({ where: { email } })
    if (existing)
      return Response.json({ error: 'Email already registered' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 10)
    const user = await db.user.create({
      data: { name, email, password: hashed, plan: 'FREE', role: 'STUDENT' },
    })

    return Response.json({ message: 'Account created', userId: user.id })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
