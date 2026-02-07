export const maxDuration = 30

import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter: 5 requests per minute per IP
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX = 5

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) ?? []

  // Remove entries older than the window
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)

  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, recent)
    return false
  }

  recent.push(now)
  rateLimitMap.set(ip, recent)
  return true
}

// Periodically clean up stale entries so the map doesn't grow unbounded
setInterval(() => {
  const now = Date.now()
  for (const [ip, timestamps] of rateLimitMap) {
    const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
    if (recent.length === 0) {
      rateLimitMap.delete(ip)
    } else {
      rateLimitMap.set(ip, recent)
    }
  }
}, RATE_LIMIT_WINDOW_MS)

// ---------------------------------------------------------------------------
// POST /api/generate-covenant
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  // --- Rate limiting ---
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  if (!rateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again in a minute.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // --- Parse & validate body ---
  let answers: string[]
  let displayName: string | undefined

  try {
    const body = await request.json()
    answers = body.answers
    displayName = body.displayName
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  if (!Array.isArray(answers) || answers.length !== 7) {
    return new Response(
      JSON.stringify({ error: 'Exactly 7 answers are required.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  if (answers.some((a) => typeof a !== 'string' || a.trim().length < 10)) {
    return new Response(
      JSON.stringify({ error: 'Each answer must be at least 10 characters.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // --- Build prompts ---
  const systemPrompt = `You are a thoughtful writer who creates personalized humanistic technology covenants. Read someone's reflections on their relationship with technology and craft a deeply personal pledge — a covenant — that captures their unique values, boundaries, and aspirations.

The covenant you create should:
- Be written in first person ("I commit to...", "I will...", "I choose to...")
- Open with a personalized preamble (2-3 sentences) reflecting the person's specific situation
- Contain 5-7 specific, actionable commitments drawn directly from their answers
- Close with an aspirational statement about the future they want to help build
- Use warm, dignified, serious language — not corporate, not casual
- Feel like something worth framing on a wall
- Be approximately 250-350 words total

Format:
- Title line: "My Covenant with Technology" (or personalized variation)
- Blank line
- Preamble paragraph
- Blank line
- Numbered commitments (each starting with "I commit to..." or "I choose to..." or "I will...")
- Blank line
- Closing aspirational paragraph

Do NOT include generic platitudes. Every commitment should be traceable to something specific the person wrote.`

  const userMessage = `Here are my reflections on my relationship with technology:

**Who I Am (Identity):**
${answers[0]}

**What Sparked My Reflection (Catalyst):**
${answers[1]}

**On Awareness:**
${answers[2]}

**On Values:**
${answers[3]}

**On Boundaries:**
${answers[4]}

**On Agency:**
${answers[5]}

**On Legacy:**
${answers[6]}

Please create my personal technology covenant based on these reflections.`

  // --- Stream generation with reasoning ---
  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    temperature: 0.8,
    maxOutputTokens: 4096,
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: 4096,
          includeThoughts: true,
        },
      },
    },
    onFinish: async ({ text }) => {
      try {
        const supabase = createServerClient()
        await supabase.from('covenants').insert({
          display_name: displayName || 'Anonymous',
          answers: answers,
          covenant_text: text,
        })
      } catch (err) {
        console.error('Failed to save covenant to Supabase:', err)
      }
    },
  })

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  })
}
