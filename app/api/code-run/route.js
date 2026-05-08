// app/api/code-run/route.js  ← REPLACE existing file
// Updated: handles all 30+ languages. Piston API language name mapping.
import { getServerSession } from 'next-auth'
import { authOptions }      from '../../../lib/auth'

// Maps our language value → Piston API language name + version
const PISTON_MAP = {
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
  dart:         { language: 'dart',         version: '2.19.6'  },
  ruby:         { language: 'ruby',         version: '3.0.1'   },
  php:          { language: 'php',          version: '8.2.3'   },
  perl:         { language: 'perl',         version: '5.36.0'  },
  lua:          { language: 'lua',          version: '5.4.4'   },
  bash:         { language: 'bash',         version: '5.2.0'   },
  powershell:   { language: 'powershell',   version: '7.1.4'   },
  r:            { language: 'r',            version: '4.1.1'   },
  julia:        { language: 'julia',        version: '1.8.5'   },
  scala:        { language: 'scala',        version: '3.2.2'   },
  groovy:       { language: 'groovy',       version: '3.0.7'   },
  haskell:      { language: 'haskell',      version: '9.0.1'   },
  erlang:       { language: 'erlang',       version: '24.0.2'  },
  elixir:       { language: 'elixir',       version: '1.11.3'  },
  sqlite3:      { language: 'sqlite3',      version: '3.36.0'  },
  coffeescript: { language: 'coffeescript', version: '2.7.0'   },
  html:         { language: 'javascript',   version: '18.15.0' }, // render HTML via Node
}

// File extensions for Piston (some languages need specific filenames)
const FILE_EXT = {
  java:  'Main.java',
  cpp:   'main.cpp',
  c:     'main.c',
  csharp:'Main.cs',
  scala: 'Main.scala',
  kotlin:'Main.kt',
  swift: 'main.swift',
  rust:  'main.rs',
  go:    'main.go',
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Login required' }, { status: 401 })

  const { code, language } = await req.json()

  if (!code?.trim())
    return Response.json({ output: '', error: 'No code provided' })

  const lang = PISTON_MAP[language?.toLowerCase()] || PISTON_MAP.python
  const fileName = FILE_EXT[language?.toLowerCase()] || 'main'

  try {
    const res = await fetch('https://emkc.org/api/v2/piston/execute', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: lang.language,
        version:  lang.version,
        files: [{ name: fileName, content: code }],
        stdin:            '',
        args:             [],
        compile_timeout:  15000,
        run_timeout:      10000,
        compile_memory_limit: -1,
        run_memory_limit:     -1,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Piston error ${res.status}: ${errText}`)
    }

    const data    = await res.json()
    const output  = data.run?.stdout  || ''
    const error   = data.run?.stderr  || data.compile?.stderr || ''
    const exitCode = data.run?.code

    // Helpful message for non-zero exit codes
    const exitMsg = (exitCode !== 0 && exitCode !== null && !error)
      ? `\n[Process exited with code ${exitCode}]`
      : ''

    return Response.json({
      output:   output + exitMsg,
      error,
      language: lang.language,
    })
  } catch (err) {
    console.error('Code run error:', err.message)
    return Response.json({
      output: '',
      error:  'Code runner temporarily unavailable. Please try again in a moment.',
    })
  }
}
