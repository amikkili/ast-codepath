// ─────────────────────────────────────────────────────────────────────────────
// AI Doubt Agent — powered by Groq (free tier)
// Get your free key at: https://console.groq.com → API Keys
// Add to Render env vars: GROQ_API_KEY=gsk_xxxxxxxxxxxxx
//
// Free models available:
//   llama-3.3-70b-versatile  ← best quality (default)
//   llama3-8b-8192           ← fastest
//   mixtral-8x7b-32768       ← good balance
// ─────────────────────────────────────────────────────────────────────────────

import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL   = 'llama-3.3-70b-versatile'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { question, lesson, course, language } = await req.json()
  if (!question) return Response.json({ error: 'Question required' }, { status: 400 })

  const apiKey = process.env.GROQ_API_KEY

  // ── No API key: return dummy response so UI still works ───────────────────
  if (!apiKey) {
    return Response.json({
      answer: `Great question about "${question}"! In ${language || 'Python'}, this concept works by following structured rules the interpreter executes step by step. Add GROQ_API_KEY to get real AI answers.`,
      code: language === 'Python'
        ? `# Example\ndef greet(name):\n    print(f"Hello, {name}!")\n\ngreet("Anil")  # Output: Hello, Anil!`
        : `// Example\nfunction greet(name) {\n  console.log("Hello, " + name);\n}\ngreet("Anil");`,
    })
  }

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       GROQ_MODEL,
        max_tokens:  600,
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content: `You are the AI tutor for AST CodePath by Anil Software Technologies.
Student is watching: "${lesson}" in "${course}" (language: ${language}).
Rules:
- Answer clearly in 2-3 sentences max
- Include a short working ${language} code example when helpful
- Be beginner-friendly and encouraging
REPLY ONLY with this JSON (no markdown, no fences):
{"answer":"explanation here","code":"code example or null"}`,
          },
          { role: 'user', content: question },
        ],
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Groq error:', res.status, errText)
      throw new Error(`Groq API error ${res.status}`)
    }

    const data    = await res.json()
    const rawText = data.choices?.[0]?.message?.content?.trim() || '{}'

    let parsed = { answer: rawText, code: null }
    try {
      const clean = rawText.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      parsed = { answer: rawText, code: null }
    }

    return Response.json(parsed)
  } catch (e) {
    console.error('AI Agent error:', e)
    return Response.json({ answer: 'Sorry, try again in a moment.', code: null })
  }
}
