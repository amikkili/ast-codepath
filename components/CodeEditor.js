'use client'
// components/CodeEditor.js  ← REPLACE existing file
// UPDATED: 30+ languages supported via Piston API (free, no key needed)
// Added: language search box, language picker dropdown
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(m => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
        <div className="w-5 h-5 border-2 border-[#534AB7] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    ),
  }
)

// ── All supported languages — Piston API + Monaco syntax highlighting ─────────
// Full list: https://emkc.org/api/v2/piston/runtimes
const ALL_LANGUAGES = [
  // Web
  { value: 'javascript', label: 'JavaScript',  color: '#F7DF1E', monacoLang: 'javascript', version: '18.15.0', cat: 'Web' },
  { value: 'typescript', label: 'TypeScript',  color: '#3178C6', monacoLang: 'typescript', version: '5.0.3',   cat: 'Web' },
  { value: 'html',       label: 'HTML',        color: '#E34C26', monacoLang: 'html',       version: '5',       cat: 'Web', pistonLang: 'html' },
  { value: 'php',        label: 'PHP',         color: '#4F5D95', monacoLang: 'php',        version: '8.2.3',   cat: 'Web' },

  // Popular
  { value: 'python',     label: 'Python',      color: '#3572A5', monacoLang: 'python',     version: '3.10.0',  cat: 'Popular' },
  { value: 'java',       label: 'Java',        color: '#b07219', monacoLang: 'java',       version: '15.0.2',  cat: 'Popular' },
  { value: 'cpp',        label: 'C++',         color: '#f34b7d', monacoLang: 'cpp',        version: '10.2.0',  cat: 'Popular', pistonLang: 'c++' },
  { value: 'c',          label: 'C',           color: '#555555', monacoLang: 'c',          version: '10.2.0',  cat: 'Popular' },
  { value: 'csharp',     label: 'C#',          color: '#178600', monacoLang: 'csharp',     version: '6.12.0',  cat: 'Popular', pistonLang: 'csharp' },

  // Modern
  { value: 'go',         label: 'Go',          color: '#00ADD8', monacoLang: 'go',         version: '1.16.2',  cat: 'Modern' },
  { value: 'rust',       label: 'Rust',        color: '#DEA584', monacoLang: 'rust',       version: '1.50.0',  cat: 'Modern' },
  { value: 'kotlin',     label: 'Kotlin',      color: '#A97BFF', monacoLang: 'kotlin',     version: '1.8.20',  cat: 'Modern' },
  { value: 'swift',      label: 'Swift',       color: '#F05138', monacoLang: 'swift',      version: '5.3.3',   cat: 'Modern' },
  { value: 'dart',       label: 'Dart',        color: '#00B4AB', monacoLang: 'dart',       version: '2.19.6',  cat: 'Modern' },

  // Scripting
  { value: 'ruby',       label: 'Ruby',        color: '#CC342D', monacoLang: 'ruby',       version: '3.0.1',   cat: 'Scripting' },
  { value: 'perl',       label: 'Perl',        color: '#0298C3', monacoLang: 'perl',       version: '5.36.0',  cat: 'Scripting' },
  { value: 'lua',        label: 'Lua',         color: '#000080', monacoLang: 'lua',        version: '5.4.4',   cat: 'Scripting' },
  { value: 'bash',       label: 'Bash/Shell',  color: '#89E051', monacoLang: 'shell',      version: '5.2.0',   cat: 'Scripting' },
  { value: 'powershell', label: 'PowerShell',  color: '#012456', monacoLang: 'powershell', version: '7.1.4',   cat: 'Scripting' },

  // Data & ML
  { value: 'r',          label: 'R',           color: '#198CE7', monacoLang: 'r',          version: '4.1.1',   cat: 'Data & ML' },
  { value: 'julia',      label: 'Julia',       color: '#A270BA', monacoLang: 'julia',      version: '1.8.5',   cat: 'Data & ML' },

  // JVM
  { value: 'scala',      label: 'Scala',       color: '#DC322F', monacoLang: 'scala',      version: '3.2.2',   cat: 'JVM' },
  { value: 'groovy',     label: 'Groovy',      color: '#4298B8', monacoLang: 'groovy',     version: '3.0.7',   cat: 'JVM' },

  // Functional
  { value: 'haskell',    label: 'Haskell',     color: '#5E5086', monacoLang: 'haskell',    version: '9.0.1',   cat: 'Functional' },
  { value: 'erlang',     label: 'Erlang',      color: '#B83998', monacoLang: 'plaintext',  version: '24.0.2',  cat: 'Functional' },
  { value: 'elixir',     label: 'Elixir',      color: '#6E4A7E', monacoLang: 'elixir',     version: '1.11.3',  cat: 'Functional' },

  // Other
  { value: 'sqlite3',    label: 'SQLite',      color: '#e38c00', monacoLang: 'sql',        version: '3.36.0',  cat: 'Database', pistonLang: 'sqlite3' },
  { value: 'coffeescript', label: 'CoffeeScript', color: '#244776', monacoLang: 'coffeescript', version: '2.7.0', cat: 'Other' },
  { value: 'nasm',       label: 'Assembly',    color: '#6E4C13', monacoLang: 'asm',        version: '2.15.05', cat: 'Other' },
]

// ── Starter code per language ──────────────────────────────────────────────────
const STARTER = {
  python:     `# Python\nprint("Hello from CodePath!")\n\nfor i in range(1, 4):\n    print(f"Line {i}")`,
  javascript: `// JavaScript\nconsole.log("Hello from CodePath!");\n\nfor (let i = 1; i <= 3; i++) {\n  console.log("Line " + i);\n}`,
  typescript: `// TypeScript\nconst greet = (name: string): string => {\n  return \`Hello, \${name}!\`;\n};\nconsole.log(greet("CodePath"));`,
  java:       `// Java\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello from CodePath!");\n    for (int i = 1; i <= 3; i++) {\n      System.out.println("Line " + i);\n    }\n  }\n}`,
  cpp:        `// C++\n#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello from CodePath!" << endl;\n  for (int i = 1; i <= 3; i++) {\n    cout << "Line " << i << endl;\n  }\n  return 0;\n}`,
  c:          `// C\n#include <stdio.h>\n\nint main() {\n  printf("Hello from CodePath!\\n");\n  for (int i = 1; i <= 3; i++) {\n    printf("Line %d\\n", i);\n  }\n  return 0;\n}`,
  csharp:     `// C#\nusing System;\n\nclass Program {\n  static void Main() {\n    Console.WriteLine("Hello from CodePath!");\n    for (int i = 1; i <= 3; i++) {\n      Console.WriteLine("Line " + i);\n    }\n  }\n}`,
  go:         `// Go\npackage main\nimport "fmt"\n\nfunc main() {\n  fmt.Println("Hello from CodePath!")\n  for i := 1; i <= 3; i++ {\n    fmt.Println("Line", i)\n  }\n}`,
  rust:       `// Rust\nfn main() {\n  println!("Hello from CodePath!");\n  for i in 1..=3 {\n    println!("Line {}", i);\n  }\n}`,
  kotlin:     `// Kotlin\nfun main() {\n  println("Hello from CodePath!")\n  for (i in 1..3) {\n    println("Line $i")\n  }\n}`,
  swift:      `// Swift\nprint("Hello from CodePath!")\nfor i in 1...3 {\n  print("Line \\(i)")\n}`,
  ruby:       `# Ruby\nputs "Hello from CodePath!"\n1.upto(3) { |i| puts "Line #{i}" }`,
  php:        `<?php\necho "Hello from CodePath!\\n";\nfor ($i = 1; $i <= 3; $i++) {\n  echo "Line $i\\n";\n}`,
  bash:       `#!/bin/bash\necho "Hello from CodePath!"\nfor i in 1 2 3; do\n  echo "Line $i"\ndone`,
  r:          `# R\ncat("Hello from CodePath!\\n")\nfor (i in 1:3) {\n  cat(paste("Line", i, "\\n"))\n}`,
  lua:        `-- Lua\nprint("Hello from CodePath!")\nfor i = 1, 3 do\n  print("Line " .. i)\nend`,
  scala:      `// Scala\nobject Main extends App {\n  println("Hello from CodePath!")\n  for (i <- 1 to 3) println(s"Line $i")\n}`,
  dart:       `// Dart\nvoid main() {\n  print("Hello from CodePath!");\n  for (var i = 1; i <= 3; i++) {\n    print("Line \$i");\n  }\n}`,
  haskell:    `-- Haskell\nmain :: IO ()\nmain = do\n  putStrLn "Hello from CodePath!"\n  mapM_ (\\i -> putStrLn $ "Line " ++ show i) [1..3]`,
  sqlite3:    `-- SQLite\nCREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, plan TEXT);\nINSERT INTO students VALUES (1, 'Anil', 'PRO');\nINSERT INTO students VALUES (2, 'Demo', 'BASIC');\nSELECT * FROM students;`,
}

const DEFAULT_CODE = `# Start writing your code here\nprint("Hello from CodePath!")\n`

// ── Group languages by category ───────────────────────────────────────────────
const CATEGORIES = [...new Set(ALL_LANGUAGES.map(l => l.cat))]

export default function CodeEditor({ defaultLanguage = 'python', lessonTitle = '' }) {
  const [language, setLanguage]   = useState(
    ALL_LANGUAGES.find(l => l.value === defaultLanguage) ? defaultLanguage : 'python'
  )
  const [code, setCode]           = useState(STARTER[defaultLanguage] || DEFAULT_CODE)
  const [output, setOutput]       = useState('')
  const [error, setError]         = useState('')
  const [running, setRunning]     = useState(false)
  const [runCount, setRunCount]   = useState(0)
  const [showPicker, setShowPicker] = useState(false)
  const [search, setSearch]       = useState('')
  const pickerRef                 = useRef(null)

  useEffect(() => {
    setCode(STARTER[language] || DEFAULT_CODE)
    setOutput('')
    setError('')
  }, [language])

  // Close picker on outside click
  useEffect(() => {
    function handler(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setShowPicker(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const currentLang = ALL_LANGUAGES.find(l => l.value === language) || ALL_LANGUAGES[0]

  const filteredLangs = search.trim()
    ? ALL_LANGUAGES.filter(l =>
        l.label.toLowerCase().includes(search.toLowerCase()) ||
        l.cat.toLowerCase().includes(search.toLowerCase())
      )
    : ALL_LANGUAGES

  async function runCode() {
    if (!code.trim() || running) return
    setRunning(true)
    setOutput('')
    setError('')

    try {
      const res  = await fetch('/api/code-run', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code, language }),
      })
      const data = await res.json()
      setOutput(data.output || '')
      setError(data.error  || '')
      setRunCount(c => c + 1)
    } catch {
      setError('Code runner unavailable — please try again.')
    } finally {
      setRunning(false)
    }
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runCode() }
  }

  return (
    <div className="flex flex-col bg-[#1e1e1e] border border-[#2a2f3e] rounded-xl overflow-hidden h-full"
      onKeyDown={handleKeyDown}>

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161b27] border-b border-[#2a2f3e] flex-shrink-0 gap-2">

        {/* Language selector button */}
        <div className="relative" ref={pickerRef}>
          <button onClick={() => setShowPicker(s => !s)}
            className="flex items-center gap-2 bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-1.5 text-xs text-[#c8d0e0] hover:border-[#534AB7]/60 transition-colors">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: currentLang.color }} />
            <span>{currentLang.label}</span>
            <span className="text-[#5a6278] ml-1">{showPicker ? '▲' : '▼'}</span>
          </button>

          {/* ── Language picker dropdown ─────────────────────────────── */}
          {showPicker && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-[#161b27] border border-[#2a2f3e] rounded-xl shadow-xl z-50 overflow-hidden">
              {/* Search */}
              <div className="p-2 border-b border-[#2a2f3e]">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search language..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#0f1117] border border-[#2a2f3e] rounded-lg px-3 py-1.5 text-xs text-[#c8d0e0] placeholder-[#5a6278] focus:border-[#534AB7]/60"
                />
              </div>

              {/* Language list */}
              <div className="overflow-y-auto max-h-64">
                {search.trim() ? (
                  // Search results — flat list
                  filteredLangs.length === 0 ? (
                    <p className="text-xs text-[#5a6278] p-3 text-center">No language found</p>
                  ) : (
                    filteredLangs.map(lang => (
                      <button key={lang.value}
                        onClick={() => { setLanguage(lang.value); setShowPicker(false); setSearch('') }}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#2a2f3e]/40 transition-colors ${language === lang.value ? 'bg-[#1e1e2a]' : ''}`}>
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: lang.color }} />
                        <span className="text-xs text-[#c8d0e0]">{lang.label}</span>
                        <span className="text-[10px] text-[#5a6278] ml-auto">{lang.cat}</span>
                        {language === lang.value && <span className="text-[10px] text-[#534AB7]">✓</span>}
                      </button>
                    ))
                  )
                ) : (
                  // Grouped by category
                  CATEGORIES.map(cat => {
                    const langs = ALL_LANGUAGES.filter(l => l.cat === cat)
                    return (
                      <div key={cat}>
                        <p className="text-[9px] font-medium text-[#5a6278] uppercase tracking-wider px-3 py-1.5 bg-[#0f1117]/50">{cat}</p>
                        {langs.map(lang => (
                          <button key={lang.value}
                            onClick={() => { setLanguage(lang.value); setShowPicker(false); setSearch('') }}
                            className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#2a2f3e]/40 transition-colors ${language === lang.value ? 'bg-[#1e1e2a]' : ''}`}>
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: lang.color }} />
                            <span className="text-xs text-[#c8d0e0]">{lang.label}</span>
                            {language === lang.value && <span className="text-[10px] text-[#534AB7] ml-auto">✓</span>}
                          </button>
                        ))}
                      </div>
                    )
                  })
                )}
              </div>

              <div className="p-2 border-t border-[#2a2f3e]">
                <p className="text-[10px] text-[#5a6278] text-center">{ALL_LANGUAGES.length} languages supported</p>
              </div>
            </div>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {runCount > 0 && <span className="text-[10px] text-[#1D9E75]">{runCount} run{runCount > 1 ? 's' : ''}</span>}
          <span className="text-[10px] text-[#5a6278] hidden md:block">Ctrl+Enter</span>
          <button onClick={runCode} disabled={running}
            className="flex items-center gap-1.5 bg-[#1D9E75] text-white text-xs font-medium px-3 py-1.5 rounded-md hover:opacity-90 disabled:opacity-50">
            {running
              ? <><div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />Running...</>
              : <><span>▶</span>Run</>
            }
          </button>
        </div>
      </div>

      {/* ── Monaco Editor ───────────────────────────────────────────── */}
      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          language={currentLang.monacoLang}
          value={code}
          onChange={val => setCode(val || '')}
          theme="vs-dark"
          options={{
            fontSize:              13,
            fontFamily:            '"Fira Code", monospace',
            fontLigatures:         true,
            minimap:               { enabled: false },
            scrollBeyondLastLine:  false,
            lineNumbers:           'on',
            automaticLayout:       true,
            tabSize:               2,
            wordWrap:              'on',
            padding:               { top: 10, bottom: 10 },
            suggestOnTriggerCharacters: true,
          }}
        />
      </div>

      {/* ── Output panel ────────────────────────────────────────────── */}
      <div className="border-t border-[#2a2f3e] flex-shrink-0">
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b27]">
          <span className="text-[10px] font-medium text-[#5a6278] uppercase tracking-wider">Output</span>
          {(output || error) && (
            <button onClick={() => { setOutput(''); setError('') }} className="text-[10px] text-[#5a6278] hover:text-[#8892a4]">Clear</button>
          )}
        </div>
        <div className="min-h-[70px] max-h-[120px] overflow-y-auto p-3 font-mono text-[12px] leading-relaxed">
          {running && <span className="text-[#5a6278]">Running {currentLang.label} code...</span>}
          {!running && !output && !error && <span className="text-[#3a3f4e]">Click Run or press Ctrl+Enter to execute</span>}
          {!running && output && <pre className="text-[#c8d0e0] whitespace-pre-wrap">{output}</pre>}
          {!running && error && <pre className="text-[#ff6b6b] whitespace-pre-wrap">{error}</pre>}
        </div>
      </div>
    </div>
  )
}
