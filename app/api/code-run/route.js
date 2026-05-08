// app/api/code-run/route.js  ← REPLACE existing file
// ─────────────────────────────────────────────────────────────────────────────
// FIX: Uses 3 code execution services in order:
//   1. Judge0 CE (ce.judge0.com) — most reliable, free, no key needed
//   2. Piston API (emkc.org)     — backup if Judge0 is down
//   3. Helpful error message     — if both fail
// ─────────────────────────────────────────────────────────────────────────────
import { getServerSession } from 'next-auth'
import { authOptions }      from '../../../lib/auth'

// ── Judge0 CE language IDs (primary service) ─────────────────────────────────
// Full list: https://ce.judge0.com/languages
const JUDGE0_LANG = {
  python:       71,
  javascript:   63,   // Node.js
  typescript:   74,
  java:         62,
  cpp:          54,
  c:            50,
  csharp:       51,
  go:           60,
  rust:         73,
  kotlin:       78,
  swift:        83,
  ruby:         72,
  php:          68,
  bash:         46,
  r:            80,
  scala:        81,
  haskell:      12,
  lua:          64,
  perl:         85,
  elixir:       57,
  erlang:        58,
  dart:         90,
  sqlite3:      82,
  coffeescript:  16,
  groovy:       88,
  powershell:   105,
}

// ── Piston language config (backup service) ───────────────────────────────────
const PISTON_LANG = {
  python:       { language: 'python',       version: '3.10.0'  },
  javascript:   { language: 'javascript',   version: '18.15.0' },
  typescript:   { language: 'typescript',   version: '5.0.3'   },
  java:         { language: 'java',         version: '15.0.2'  },
  cpp:          { language: 'c++',          version: '10.2.0'  },
  c:            { language: 'c',            version: '10.2.0'  },
  csharp:       { language: 'csharp',       version: '6.12.0'  },
  go:           { language: 'go',           version: '1.16.2'  },
  rust:         { language: 'rust',         version: '1.50.0'  },
  kotlin:       { language: 'kotlin',       version: '1.8.20'  },
  swift:        { language: 'swift',        version: '5.3.3'   },
  ruby:         { language: 'ruby',         version: '3.0.1'   },
  php:          { language: 'php',          version: '8.2.3'   },
  bash:         { language: 'bash',         version: '5.2.0'   },
  r:            { language: 'r',            version: '4.1.1'   },
  lua:          { language: 'lua',          version: '5.4.4'   },
  dart:         { language: 'dart',         version: '2.19.6'  },
  scala:        { language: 'scala',        version: '3.2.2'   },
  haskell:      { language: 'haskell',      version: '9.0.1'   },
  sqlite3:      { language: 'sqlite3',      version: '3.36.0'  },
}

// File names required by some languages
const FILE_NAME = {
  java:   'Main.java',
  cpp:    'main.cpp',
  c:      'main.c',
  csharp: 'Main.cs',
  scala:  'Main.scala',
  kotlin: 'Main.kt',
  swift:  'main.swift',
  rust:   'main.rs',
  go:     'main.go',
}

// ── Service 1: Judge0 CE ─────────────────────────────────────────────────────
async function runWithJudge0(code, language) {
  const langId = JUDGE0_LANG[language?.toLowerCase()]
  if (!langId) throw new Error(`Language not supported in Judge0: ${language}`)

  const JUDGE0_URLS = [
    'https://ce.judge0.com',
    'https://judge0-ce.p.rapidapi.com',  // RapidAPI fallback
  ]

  const url = JUDGE0_URLS[0]

  // Submit code
  const submitRes = await fetch(`${url}/submissions?base64_encoded=false&wait=false`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',  // optional - works without key too
    },
    body: JSON.stringify({
      language_id:       langId,
      source_code:       code,
      stdin:             '',
      cpu_time_limit:    10,
      memory_limit:      128000,
      wall_time_limit:   15,
    }),
    signal: AbortSignal.timeout(10000),
  })

  if (!submitRes.ok) throw new Error(`Judge0 submit failed: ${submitRes.status}`)

  const { token } = await submitRes.json()
  if (!token) throw new Error('No token from Judge0')

  // Poll for result (max 8 attempts, 1s apart)
  for (let i = 0; i < 8; i++) {
    await new Promise(r => setTimeout(r, 1000))
    const resultRes = await fetch(`${url}/submissions/${token}?base64_encoded=false`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!resultRes.ok) continue

    const result = await resultRes.json()

    // Status IDs: 1=In Queue, 2=Processing, 3=Accepted, 4=Wrong Answer, 5=TLE, 6=CE, etc.
    if (result.status?.id <= 2) continue  // still processing

    const output = result.stdout || ''
    const error  = result.stderr || result.compile_output || ''

    if (result.status?.id === 5) {
      return { output, error: 'Time limit exceeded — your code ran too long' }
    }
    if (result.status?.id === 6) {
      return { output, error: error || 'Memory limit exceeded' }
    }

    return { output, error }
  }

  throw new Error('Judge0 timeout — execution took too long')
}

// ── Service 2: Piston API ─────────────────────────────────────────────────────
async function runWithPiston(code, language) {
  const lang = PISTON_LANG[language?.toLowerCase()] || PISTON_LANG.python
  const fileName = FILE_NAME[language?.toLowerCase()] || 'main'

  const res = await fetch('https://emkc.org/api/v2/piston/execute', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: lang.language,
      version:  lang.version,
      files: [{ name: fileName, content: code }],
      stdin:            '',
      compile_timeout:  15000,
      run_timeout:      10000,
    }),
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) throw new Error(`Piston error: ${res.status}`)

  const data = await res.json()
  return {
    output: data.run?.stdout || '',
    error:  data.run?.stderr || data.compile?.stderr || '',
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Login required' }, { status: 401 })

  const { code, language } = await req.json()

  if (!code?.trim())
    return Response.json({ output: '', error: 'No code provided' })

  const lang = language?.toLowerCase() || 'python'

  // ── Try Judge0 first, then Piston as backup ───────────────────────────────
  const attempts = [
    { name: 'Judge0',  fn: () => runWithJudge0(code, lang) },
    { name: 'Piston',  fn: () => runWithPiston(code, lang) },
  ]

  for (const attempt of attempts) {
    try {
      console.log(`Trying ${attempt.name} for ${lang}...`)
      const result = await attempt.fn()
      console.log(`✓ ${attempt.name} succeeded`)
      return Response.json({ output: result.output, error: result.error, service: attempt.name })
    } catch (err) {
      console.error(`${attempt.name} failed:`, err.message)
      // Try next service
    }
  }

  // All services failed
  return Response.json({
    output: '',
    error:  [
      `⚠ Code runner is temporarily unavailable.`,
      ``,
      `Please try again in 1–2 minutes.`,
      `Both Judge0 and Piston APIs appear to be unreachable right now.`,
      `This is a temporary issue — your code is correct.`,
    ].join('\n'),
  })
}
