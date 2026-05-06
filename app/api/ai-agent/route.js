import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { question, lesson, course, language } = await req.json()
  if (!question) return Response.json({ error: 'Question required' }, { status: 400 })

  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return Response.json({
      answer: `Great question! In ${language || 'Python'}, this concept works by following structured rules the interpreter executes step by step. Here is a simple example:`,
      code: `# Example\ndef example(x):\n    result = x * 2\n    return result\n\nprint(example(5))  # Output: 10`,
    })
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: `You are the AI tutor for AST CodePath, an online coding platform by Anil Software Technologies.
The student is watching: "${lesson}" in "${course}" (language: ${language}).
Reply in JSON only: {"answer":"2-3 sentence explanation","code":"short code example or null"}
No markdown, no backticks around the JSON.`,
        messages: [{ role: 'user', content: question }],
      }),
    })

    const data = await res.json()
    const text = data.content?.[0]?.text || '{}'
    let parsed = { answer: text, code: null }
    try { parsed = JSON.parse(text) } catch {}
    return Response.json(parsed)
  } catch (e) {
    console.error(e)
    return Response.json({ answer: 'Sorry, try again in a moment.', code: null })
  }
}
