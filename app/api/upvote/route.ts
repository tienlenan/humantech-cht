import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const { id } = await request.json()

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Missing covenant id' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Read current upvotes then increment
  const { data: current, error: fetchError } = await supabase
    .from('covenants')
    .select('upvotes')
    .eq('id', id)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 404 })
  }

  const { data: updated, error: updateError } = await supabase
    .from('covenants')
    .update({ upvotes: (current.upvotes ?? 0) + 1 })
    .eq('id', id)
    .select('upvotes')
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ upvotes: updated.upvotes })
}
