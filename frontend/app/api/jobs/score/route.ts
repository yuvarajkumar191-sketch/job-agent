import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyInternalKey } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST /api/jobs/score - called by n8n to update job fit score
export async function POST(req: NextRequest) {
  if (!verifyInternalKey(req)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await req.json()
  const { job_id, fit_score, fit_rationale } = body

  if (!job_id || fit_score === undefined) {
    return NextResponse.json({ error: 'job_id and fit_score are required' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('jobs')
    .update({ fit_score, fit_rationale })
    .eq('id', job_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

// GET /api/jobs/score - return unscored jobs for n8n to process
export async function GET(req: NextRequest) {
  if (!verifyInternalKey(req)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('jobs')
    .select('id, title, company, description')
    .eq('fit_score', 0)
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ jobs: data })
}
