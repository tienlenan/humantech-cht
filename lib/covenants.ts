import { createServerClient, createBrowserClient } from './supabase'

export interface Covenant {
  id: string
  display_name: string
  answers: string[] // the 5 reflective answers
  covenant_text: string
  upvotes: number
  created_at: string
}

/**
 * Insert a new covenant into Supabase (server-side).
 */
export async function saveCovenant(data: {
  display_name?: string
  answers: string[]
  covenant_text: string
}) {
  const supabase = createServerClient()

  const { data: covenant, error } = await supabase
    .from('covenants')
    .insert({
      display_name: data.display_name || 'Anonymous',
      answers: data.answers,
      covenant_text: data.covenant_text,
    })
    .select()
    .single()

  if (error) throw error
  return covenant as Covenant
}

/**
 * Fetch recent covenants ordered by created_at desc (browser-side).
 */
export async function getCovenants(limit = 20) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('covenants')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Covenant[]
}

/**
 * Increment upvotes by 1 for a given covenant (browser-side).
 */
export async function upvoteCovenant(id: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.rpc('increment_upvote', {
    covenant_id: id,
  })

  if (error) {
    // Fallback: read current value, then update
    const { data: current, error: fetchError } = await supabase
      .from('covenants')
      .select('upvotes')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const { data: updated, error: updateError } = await supabase
      .from('covenants')
      .update({ upvotes: (current.upvotes ?? 0) + 1 })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError
    return updated as Covenant
  }

  return data
}
