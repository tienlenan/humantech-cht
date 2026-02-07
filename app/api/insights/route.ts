export const maxDuration = 20

import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createServerClient()

  // Fetch all covenants
  const { data: covenants, error } = await supabase
    .from('covenants')
    .select('covenant_text, display_name, created_at, upvotes')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const totalCovenants = covenants?.length ?? 0
  const totalUpvotes = covenants?.reduce((sum, c) => sum + (c.upvotes ?? 0), 0) ?? 0

  // Time-based stats
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const recentCovenants = covenants?.filter(
    (c) => new Date(c.created_at) > thirtyDaysAgo
  ).length ?? 0

  // If we have enough covenants, generate AI narrative
  let narrative = ''
  if (totalCovenants >= 1) {
    // Sample up to 10 recent covenants for analysis
    const sample = (covenants ?? [])
      .slice(0, 10)
      .map((c) => c.covenant_text.slice(0, 200))
      .join('\n---\n')

    try {
      const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        prompt: `Analyze these ${totalCovenants} technology covenants from a community of people reflecting on their relationship with technology. Here are samples:

${sample}

Write a brief community insight (3-4 sentences) that:
- Identifies 2-3 common themes or concerns across covenants
- Notes what this community values most
- Is written in third person ("This community...")
- Feels warm and encouraging, not clinical
- Does NOT use bullet points or headers, just flowing prose`,
        temperature: 0.7,
        maxOutputTokens: 1024,
      })
      narrative = text
    } catch (err) {
      console.error('Failed to generate narrative:', err)
    }
  }

  return NextResponse.json({
    totalCovenants,
    totalUpvotes,
    recentCovenants,
    narrative,
  })
}
