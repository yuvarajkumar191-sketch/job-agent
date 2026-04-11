import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { job_id } = body;

    if (!job_id) {
      return NextResponse.json({ error: 'job_id is required' }, { status: 400 });
    }

    const n8nWebhookUrl = process.env.N8N_TAILOR_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      return NextResponse.json({ error: 'Tailor webhook not configured' }, { status: 500 });
    }

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: 'n8n workflow failed', details: errText }, { status: 500 });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Tailor API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
