export const maxDuration = 30

import { google } from '@ai-sdk/google'
import { streamText, convertToModelMessages } from 'ai'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { messages, answers, covenantText, displayName } = body

  const systemPrompt = `You are a thoughtful, warm AI companion helping someone live by their personal technology covenant. Your role is to be a supportive coach — not preachy or lecturing, but genuinely helpful and practical.

Context about this person:
- Name: ${displayName || 'Anonymous'}
- Their personal technology covenant:
${covenantText}

- Their original reflections:
${(answers as string[]).map((a: string, i: number) => {
  const labels = ['Identity', 'Catalyst', 'Awareness', 'Values', 'Boundaries', 'Agency', 'Legacy']
  return `**${labels[i] || `Q${i + 1}`}:** ${a}`
}).join('\n\n')}

Guidelines:
- Give specific, actionable advice tied to THEIR covenant and reflections
- Be conversational and encouraging, not generic
- Keep responses concise (2-4 paragraphs max)
- Suggest practical exercises or experiments they can try
- Reference their specific commitments when relevant
- If they share a struggle, empathize first, then offer strategies
- You can ask clarifying questions to give better advice`

  try {
    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      temperature: 0.7,
      maxOutputTokens: 2048,
    })

    return result.toUIMessageStreamResponse({})
  } catch (err) {
    console.error('Companion error:', err)
    return new Response('Internal Server Error', { status: 500 })
  }
}
