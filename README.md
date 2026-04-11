# Job Agent - Personal AI Job Hunter

An AI-powered personal job hunting system that finds visa-sponsored UK roles, scores them against your CV, generates tailored application materials, and tracks everything in one dashboard.

**Built for:** Yuvaraj Kumar | MBA Finance & Analytics, Hult London | Targeting UK finance/analytics/ops roles

## What it does

- Automatically scrapes LinkedIn and other job boards daily
- Filters for UK roles with visa sponsorship (Skilled Worker / Tier 2)
- AI-scores each job against your CV (0-100 fit score)
- Flags roles that require UK experience (so you can prioritise others)
- Generates tailored CV bullets, cover letters, and LinkedIn outreach messages per job
- Tracks all applications with status pipeline (new > shortlisted > applied > interview > offer)

## Tech Stack (100% Free)

| Service | Purpose | Cost |
|---|---|---|
| GitHub | Code storage | Free |
| Vercel | Host Next.js frontend | Free |
| Supabase | Postgres database | Free |
| Railway | Self-host n8n | Free $5/mo credit |
| OpenRouter | AI (free models) | Free tier |
| Apify | LinkedIn job scraper | Free $5 credit |

## Setup Guide (Step by Step)

### Step 1 - Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to SQL Editor and paste the contents of `supabase/schema.sql`
4. Run the script - this creates all tables and default AI prompts
5. Go to Settings > API and copy:
   - Project URL
   - anon (public) key
   - service_role (secret) key

### Step 2 - Get OpenRouter API key

1. Go to [openrouter.ai](https://openrouter.ai) and sign up free
2. Go to Keys and create a new API key
3. Free models available: `mistralai/mistral-7b-instruct:free`, `google/gemma-3-27b-it:free`

### Step 3 - Get Apify API token

1. Go to [apify.com](https://apify.com) and sign up (free $5 credit)
2. Go to Settings > Integrations > API tokens
3. Copy your API token
4. The actor to use: `fetchclub~linkedin-jobs-scraper`

### Step 4 - Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import this repository (`yuvarajkumar191-sketch/job-agent`)
4. Set Root Directory to `frontend`
5. Add all environment variables from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL` - from Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - from Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` - from Supabase
   - `OPENROUTER_API_KEY` - from OpenRouter
   - `OPENROUTER_MODEL` - e.g. `mistralai/mistral-7b-instruct:free`
   - `APIFY_API_TOKEN` - from Apify
   - `INTERNAL_API_KEY` - make up a random 32+ char string
   - `NEXTAUTH_SECRET` - make up a random 32+ char string
6. Deploy! Your dashboard will be live at a `.vercel.app` URL

### Step 5 - Deploy n8n on Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project" > "Deploy from template" > search "n8n"
3. Deploy n8n (uses free $5/month credit)
4. Once deployed, open your n8n URL
5. Create an admin account
6. Import workflows from `n8n-workflows/` folder (see that folder's README)
7. Set up credentials:
   - Apify HTTP header auth
   - OpenRouter HTTP header auth (Bearer token)
   - Your backend API key as custom header `x-internal-key`
8. Activate all 3 workflows

### Step 6 - Add your CV to the system

1. Go to your deployed dashboard > Profile page
2. Paste your full CV text into the "Base CV" field
3. Set your LinkedIn URL
4. Save - the AI will use this for all scoring and material generation

### Step 7 - First run

1. In n8n, manually trigger the Job Discovery workflow
2. Wait 2-3 minutes for jobs to be scraped and classified
3. Trigger the Job Scoring workflow
4. Open your dashboard - you should see jobs with scores!
5. Filter by Visa Sponsored + Score 70+ to see your best matches

## Folder Structure

```
job-agent/
├── frontend/              Next.js dashboard app
│   ├── app/
│   │   ├── page.tsx       Dashboard with stats
│   │   ├── jobs/          Jobs list with filters
│   │   ├── applications/  Application tracker
│   │   └── api/           Backend API routes
│   └── lib/               Supabase client + types
├── n8n-workflows/         Import these into n8n
├── supabase/schema.sql    Run this in Supabase SQL editor
└── .env.example           Copy to .env.local and fill in
```

## Using the Dashboard

### Jobs Page
- Filter by minimum fit score (drag slider)
- Toggle "Visa sponsored only" to see only sponsoring employers
- Toggle "Hide UK exp required" to remove roles you can't apply to yet
- Click "Apply" to start tracking an application
- Click the external link icon to open the original job posting

### Applications Page
- See all your tracked applications
- Change status from dropdown (new > shortlisted > applied > interview > offer > rejected)
- Click "AI Materials" to generate:
  - Tailored CV bullet points for that specific role
  - A full UK-style cover letter
  - A LinkedIn outreach message to the recruiter
- Expand to read and copy the generated content

### Dashboard
- Overview stats: total jobs, new today, visa sponsored, high fit
- Pipeline view: shortlisted, applied, interviews, offers
- Quick links to filtered job views

## Customisation

To update the AI prompts, go to your Supabase dashboard > Table Editor > prompts table.
You can edit the `content` field of any prompt without touching code.

To add more job sources, add more HTTP Request nodes in the n8n Job Discovery workflow.

## Questions?

Open an issue in this repository.
