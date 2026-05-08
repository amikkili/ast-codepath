// app/robots.js  ← NEW FILE
// Next.js auto-generates /robots.txt from this file.
// Tells Google: index public pages, never index admin/api/dashboard.
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     ['/', '/about', '/contact', '/upgrade', '/privacy', '/terms'],
        disallow:  ['/admin', '/api/', '/dashboard', '/course/', '/reset-password', '/forgot-password'],
      },
    ],
    sitemap: 'https://www.anilsofttech.com/sitemap.xml',
    host:    'https://www.anilsofttech.com',
  }
}
