import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, callAI } from '@/lib/db'

// GET /api/applications - fetch all applications with job details
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  let query = supabaseAdmin
    .from('applications')
    .select(`
      *,
      job:jobs(id, title, company, location, url, fit_score, visa_sponsorship_detected)
    `)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ applications: data })
}

// POST /api/applications - create a new application
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { job_id, user_id } = body

  if (!job_id || !user_id) {
    return NextResponse.json({ error: 'job_id and user_id are required' }, { status: 400 })
  }

  // Check if application already exists
  const { data: existing } = await supabaseAdmin
    .from('applications')
    .select('id')
    .eq('job_id', job_id)
    .eq('user_id', user_id)
    .single()

  if (existing) {
    return NextResponse.json({ application_id: existing.id, already_exists: true })
  }

  const { data, error } = await supabaseAdmin
    .from('applications')
    .insert({ job_id, user_id, status: 'new' })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ application_id: data?.id })
}
