import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, callAI } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST /api/applications/[id]/materials
// Generates tailored CV bullets, cover letter, and outreach email using AI
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const applicationId = params.id

  // Get application + job details
  const { data: app, error: appErr } = await supabaseAdmin
    .from('applications')
    .select('*, job:jobs(title, company, description)')
    .eq('id', applicationId)
    .single()

  if (appErr || !app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  // Get the user's CV text
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('base_cv_text, name')
    .eq('id', app.user_id)
    .single()

  const cvText = user?.base_cv_text || 'MBA Finance & Analytics, Hult International Business School London. 4 years credit underwriting at HDFC Bank India. Skills: financial analysis, data analytics, operations management, Excel, SQL, Tableau.'
  const jobDesc = app.job?.description || ''
  const jobTitle = app.job?.title || ''
  const company = app.job?.company || ''

  // 1) Generate tailored CV bullets
  const bulletsPrompt = `You are optimising a CV for a UK job application. Use UK English spelling.
Candidate CV:
${cvText}

Target job description:
${jobDesc}

Suggest up to 6 bullet points (STAR style, quantified where possible) to add or refine for this role.
Focus on credit analysis, risk, operations, data, and finance achievements.

Return JSON only: {"bullets": ["bullet1", "bullet2", ...]}`

  // 2) Generate cover letter
  const coverLetterPrompt = `Write a concise one-page UK-style cover letter for this role. Professional, direct tone.
Do NOT start with "I am writing to apply".
Focus on: 4 years credit underwriting at HDFC Bank, MBA Finance & Analytics at Hult London, data analytics, operations.
Already based in London (Wembley). Do not mention visa sponsorship.

Job: ${jobTitle} at ${company}
Job description: ${jobDesc}
CV summary: ${cvText.substring(0, 500)}

Return cover letter as plain text only.`

  // 3) Generate outreach email
  const outreachPrompt = `Write a short 4-5 line professional LinkedIn outreach message to a recruiter.
Confident, direct tone. Not desperate.
Mention: MBA Finance & Analytics at Hult London, 4 years credit underwriting at HDFC Bank, based in London.
Target role: ${jobTitle} at ${company}
Return message as plain text only.`

  try {
    const [bulletsRaw, coverLetter, outreachEmail] = await Promise.all([
      callAI(bulletsPrompt),
      callAI(coverLetterPrompt),
      callAI(outreachPrompt),
    ])

    // Parse bullets JSON
    let tailoredBullets = bulletsRaw
    try {
      const parsed = JSON.parse(bulletsRaw)
      tailoredBullets = parsed.bullets?.join('\n') || bulletsRaw
    } catch {}

    // Save to database
    await supabaseAdmin
      .from('applications')
      .update({
        cover_letter_text: coverLetter,
        cv_variant_text: tailoredBullets,
        outreach_email_text: outreachEmail,
        tailored_bullets: tailoredBullets,
      })
      .eq('id', applicationId)

    return NextResponse.json({
      cover_letter_text: coverLetter,
      cv_variant_text: tailoredBullets,
      outreach_email_text: outreachEmail,
      tailored_bullets: tailoredBullets,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
