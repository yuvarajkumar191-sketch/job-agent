import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/jobs - fetch jobs with filters
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const min_score = parseInt(searchParams.get('min_score') || '0')
  const visa_only = searchParams.get('visa_only') === 'true'
  const hide_uk_required = searchParams.get('hide_uk_required') === 'true'
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('jobs')
    .select('*', { count: 'exact' })
    .gte('fit_score', min_score)
    .order('fit_score', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (visa_only) query = query.eq('visa_sponsorship_detected', true)
  if (hide_uk_required) query = query.eq('uk_experience_required', false)
  if (search) query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%`)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ jobs: data, total: count, page, limit })
}
