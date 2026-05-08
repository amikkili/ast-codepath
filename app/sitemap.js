// app/sitemap.js  ← NEW FILE
// Next.js auto-generates /sitemap.xml from this file.
// Submit this URL to Google Search Console after deployment:
//   https://www.anilsofttech.com/sitemap.xml
import { db } from '../lib/db'

export default async function sitemap() {
  const baseUrl = 'https://www.anilsofttech.com'
  const now     = new Date()

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticPages = [
    { url: baseUrl,                       lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${baseUrl}/about`,            lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/contact`,          lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/upgrade`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${baseUrl}/privacy`,          lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${baseUrl}/terms`,            lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${baseUrl}/login`,            lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]

  // ── Dynamic course pages ──────────────────────────────────────────────────
  let coursePages = []
  try {
    const courses = await db.course.findMany({
      where:   { published: true },
      select:  { id: true, updatedAt: true },
    })
    coursePages = courses.map((c) => ({
      url:             `${baseUrl}/course/${c.id}`,
      lastModified:    c.updatedAt,
      changeFrequency: 'weekly',
      priority:        0.7,
    }))
  } catch {
    // DB not available during build — skip dynamic pages
  }

  return [...staticPages, ...coursePages]
}
