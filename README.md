# AST CodePath — Anil Software Technologies

Online programming coaching platform with AI doubt-clearing agent.
CEO: Anil Kumar Mikkili | contact@anilsofttech.com | +91 9866376367

---

## Project structure

```
ast-codepath/
├── app/
│   ├── page.js                        ← Landing page (branded)
│   ├── login/page.js                  ← Sign in / Sign up
│   ├── dashboard/page.js              ← Student dashboard
│   ├── course/[id]/page.js            ← Video player + AI agent
│   ├── admin/page.js                  ← Admin — add/manage videos
│   └── api/
│       ├── auth/[...nextauth]/        ← NextAuth login
│       ├── auth/register/             ← Sign up endpoint
│       ├── courses/                   ← List all courses
│       ├── progress/                  ← Track lesson progress
│       ├── ai-agent/                  ← AI doubt clearing
│       └── admin/lessons/             ← Admin CRUD for lessons
├── components/
│   ├── Navbar.js                      ← Navigation with auth state
│   └── VideoPlayer.js                 ← Cloudflare Stream iframe
├── lib/
│   ├── db.js                          ← Prisma client
│   ├── auth.js                        ← NextAuth config
│   └── constants.js                   ← Company info, plans
├── prisma/
│   ├── schema.prisma                  ← Database tables
│   └── seed.js                        ← Initial data (admin + demo)
├── middleware.js                       ← Route protection
├── .env.example                        ← All required env vars
└── render.yaml                         ← Render deployment config
```

---

## STEP 1 — Run locally on Windows

```cmd
rem 1. Install dependencies
npm install

rem 2. Copy env file
copy .env.example .env.local

rem 3. Edit .env.local — fill in DATABASE_URL and NEXTAUTH_SECRET
rem    (for local: use a local PostgreSQL or skip and test without DB)

rem 4. Run database migrations (once you have DATABASE_URL set)
npx prisma migrate dev --name init

rem 5. Seed the database (creates admin + demo student + course)
node prisma/seed.js

rem 6. Start the app
npm run dev

rem Open http://localhost:3000
```

---

## STEP 2 — Open Cloudflare account + upload one video

1. Go to https://dash.cloudflare.com → Sign up free
2. In the left sidebar: **Stream** → Enable Stream
3. Click **Upload** → Select your MP4 video file
4. Wait for processing (~2 minutes)
5. Click on the video → Copy the **Video ID** (looks like: a4ecd5a7b8c9d0e1)
6. You will paste this in the Admin Panel after deploying

---

## STEP 3 — Create PostgreSQL on Render

1. Go to https://dashboard.render.com → **New** → **PostgreSQL**
2. Name: `ast-codepath-db`
3. Plan: Free
4. Click **Create Database**
5. Copy the **External Database URL** — you will need this

---

## STEP 4 — Deploy to Render

1. Push this project to GitHub:
```cmd
git init
git add .
git commit -m "AST CodePath initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ast-codepath.git
git push -u origin main
```

2. Go to https://dashboard.render.com → **New** → **Web Service**
3. Connect your GitHub repo
4. Set these **Environment Variables** in Render:

| Key | Value |
|---|---|
| `DATABASE_URL` | (paste from your Render PostgreSQL) |
| `NEXTAUTH_SECRET` | (run: `openssl rand -base64 32` and paste result) |
| `NEXTAUTH_URL` | `https://your-app.onrender.com` |
| `ANTHROPIC_API_KEY` | (from console.anthropic.com) |

5. Build command: `npm install && npx prisma generate && npx prisma migrate deploy && node prisma/seed.js && npm run build`
6. Start command: `npm start`
7. Click **Create Web Service**

---

## STEP 5 — Add your first real video

1. Open your app URL → go to `/login`
2. Sign in as admin: `contact@anilsofttech.com` / `Admin@AST2026`
3. Click **Admin** in the navbar → go to `/admin`
4. You will see the guide to paste your Cloudflare Video ID
5. Fill in the lesson form → paste your Cloudflare Video ID → click **Save and publish**
6. Go to `/dashboard` → open the course → your video plays!

---

## Multi-tenant — how it works

| Plan | Access |
|---|---|
| FREE | Only lessons marked as "Free preview" (accessPlan = FREE) |
| BASIC ($12/mo) | All pre-recorded lessons |
| PRO ($39/mo) | All lessons + live sessions |

- Each student has their own account, progress, and plan stored in PostgreSQL
- Middleware protects all routes — unauthenticated users are redirected to /login
- Admin route is restricted to users with `role = ADMIN`

---

## Login accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | contact@anilsofttech.com | Admin@AST2026 |
| Demo student | demo@student.com | Student@123 |

---

## Next steps after testing

| Feature | What to add |
|---|---|
| Real payments | Stripe Billing — update user.plan after payment |
| Video security | Cloudflare signed tokens (prevent URL sharing) |
| More courses | Use Admin panel to add courses + lessons |
| Email | Resend.com for welcome emails |
| Certificates | PDF generation on course completion |
