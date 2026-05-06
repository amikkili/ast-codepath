const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ── Admin user (Anil Kumar Mikkili) ──────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@AST2026', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'contact@anilsofttech.com' },
    update: {},
    create: {
      name: 'Anil Kumar Mikkili',
      email: 'contact@anilsofttech.com',
      password: adminPassword,
      plan: 'PRO',
      role: 'ADMIN',
    },
  })
  console.log('Admin created:', admin.email)

  // ── Demo student ──────────────────────────────────────────────────────────
  const studentPassword = await bcrypt.hash('Student@123', 10)
  const student = await prisma.user.upsert({
    where: { email: 'demo@student.com' },
    update: {},
    create: {
      name: 'Demo Student',
      email: 'demo@student.com',
      password: studentPassword,
      plan: 'BASIC',
      role: 'STUDENT',
    },
  })
  console.log('Demo student created:', student.email)

  // ── Python Fundamentals course ───────────────────────────────────────────
  const course = await prisma.course.upsert({
    where: { id: 'python-fundamentals' },
    update: {},
    create: {
      id: 'python-fundamentals',
      title: 'Python Fundamentals',
      language: 'Python',
      color: '#3572A5',
      level: 'Beginner',
      description: 'Master Python from scratch — variables, functions, OOP and more.',
    },
  })
  console.log('Course created:', course.title)

  // ── Lesson 1 — Free preview (replace VIDEO_ID with your Cloudflare ID) ───
  const lesson1 = await prisma.lesson.upsert({
    where: { courseId_lessonNo: { courseId: course.id, lessonNo: 1 } },
    update: {},
    create: {
      courseId: course.id,
      lessonNo: 1,
      title: 'Introduction & Setup',
      duration: '8 min',
      // ┌─────────────────────────────────────────────────────────────────┐
      // │  REPLACE THIS with your actual Cloudflare Stream Video ID       │
      // │  Go to: dash.cloudflare.com → Stream → your uploaded video      │
      // │  Copy the Video ID (looks like: a4ecd5a7b8c9d0e1)              │
      // └─────────────────────────────────────────────────────────────────┘
      videoId: 'REPLACE_WITH_YOUR_CLOUDFLARE_VIDEO_ID',
      accessPlan: 'FREE',
    },
  })
  console.log('Lesson 1 created:', lesson1.title)

  console.log('\nSeed complete!')
  console.log('─────────────────────────────────────')
  console.log('Admin login:   contact@anilsofttech.com / Admin@AST2026')
  console.log('Student login: demo@student.com / Student@123')
  console.log('─────────────────────────────────────')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
