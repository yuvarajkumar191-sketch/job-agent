import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyInternalKey } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST /api/jobs/upsert - called by n8n to insert/update jobs
export async function POST(req: NextRequest) {
  if (!verifyInternalKey(req)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await req.json()
  const {
    external_id, source, title, company, location, url,
    description, visa_sponsorship_detected, uk_experience_required,
    salary_range, job_type
  } = body

  if (!external_id || !title) {
    return NextResponse.json({ error: 'external_id and title are required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('jobs')
    .upsert({
      external_id,
      source: source || 'linkedin',
      title,
      company,
      location,
      url,
      description,
      visa_sponsorship_detected: visa_sponsorship_detected ?? false,
      uk_experience_required: uk_experience_required ?? false,
      salary_range,
      job_type,
      scraped_at: new Date().toISOString(),
    }, { onConflict: 'external_id,source' })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, job_id: data?.id })
}
