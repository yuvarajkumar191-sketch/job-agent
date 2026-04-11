# n8n Workflows

This folder contains the 3 n8n automation workflows for the Job Agent.

## How to import into n8n

1. Open your n8n instance (self-hosted on Railway)
2. Click **+** to create a new workflow
3. Click the **...** menu top right → **Import from file**
4. Upload the JSON file
5. Set your credentials (Apify API key, OpenRouter API key)
6. Activate the workflow

## Workflows

### 1. Job Discovery (`1-job-discovery.json`)
- Runs every 6 hours via Cron
- Scrapes LinkedIn jobs via Apify
- Filters for UK roles matching your target titles
- Uses AI to detect visa sponsorship and UK experience requirements
- POSTs each job to your backend `/api/jobs/upsert`

### 2. Job Scoring (`2-job-scoring.json`)
- Runs every 2 hours
- Fetches unscored jobs from your backend GET `/api/jobs/score`
- Sends each job description + your CV to OpenRouter AI
- Gets back fit score 0-100 and rationale
- POSTs score back to `/api/jobs/score`

### 3. Materials Generator (`3-materials-generator.json`)
- Triggered by webhook from your frontend
- Generates tailored CV bullets, cover letter, and LinkedIn outreach
- Returns results directly to your frontend via webhook response

## Required credentials in n8n

- **Apify API**: Token from apify.com
- **OpenRouter API**: Key from openrouter.ai (use HTTP Request node with Bearer auth)
- **Your Backend API**: Set `INTERNAL_API_KEY` as a header `x-internal-key`

## Setup checklist

- [ ] n8n deployed on Railway
- [ ] Apify account + actor configured
- [ ] OpenRouter account + free model selected
- [ ] Backend deployed on Vercel with correct env vars
- [ ] All 3 workflows imported and activated
