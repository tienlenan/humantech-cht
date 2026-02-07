export const maxDuration = 15

import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { questionLabel, questionText, currentText, previousAnswers } = body

  const prevContext = previousAnswers?.length
    ? previousAnswers
        .slice(-2)
        .map((a: { label: string; answer: string }) => `${a.label}: ${a.answer.slice(0, 120)}`)
        .join('\n')
    : ''

  try {
    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: z.object({
        suggestions: z.array(z.string()).length(3),
      }),
      prompt: `Generate 3 short first-person suggestion phrases (15-25 words each) for this reflection question.

Question (${questionLabel}): "${questionText}"
${currentText ? `Started writing: "${currentText.slice(0, 80)}"` : ''}
${prevContext ? `Previous:\n${prevContext}` : ''}

Each suggestion should be personal, specific, and written as if the user is speaking.`,
      maxOutputTokens: 1024,
    })

    return NextResponse.json(result.object)
  } catch (err) {
    console.error('Suggest error:', err)
    return NextResponse.json({ suggestions: [] })
  }
}
