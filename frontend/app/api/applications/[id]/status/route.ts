import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const body = await req.json()
  const { status } = body

  if (!status) {
    return NextResponse.json({ error: 'status is required' }, { status: 400 })
  }

  const validStatuses = ['applied', 'shortlisted', 'interview', 'offer', 'rejected']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('applications')
    .update({ status })
    .eq('id', id)
    .select('id, status')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ application: data })
}
