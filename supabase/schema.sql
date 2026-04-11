-- Job Agent Database Schema
-- Run this once in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS table
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  linkedin_url text,
  base_cv_text text,
  base_cv_url text,
  target_roles text[] default array['credit analyst','data analyst','operations analyst','marketing analyst'],
  target_location text default 'United Kingdom',
  preferred_sectors text[] default array['banking','fintech','consulting','finance'],
  created_at timestamptz default now()
);

-- JOBS table
create table if not exists jobs (
  id uuid primary key default uuid_generate_v4(),
  external_id text not null,
  source text not null default 'linkedin',
  title text not null,
  company text,
  location text,
  url text,
  description text,
  visa_sponsorship_detected boolean default false,
  uk_experience_required boolean default false,
  fit_score integer default 0,
  fit_rationale text,
  salary_range text,
  job_type text,
  scraped_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(external_id, source)
);

-- APPLICATIONS table
create table if not exists applications (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  status text default 'new' check (status in ('new','shortlisted','applied','interview','offer','rejected')),
  cover_letter_text text,
  cv_variant_text text,
  outreach_email_text text,
  tailored_bullets text,
  notes text,
  applied_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PROMPTS table (store your AI prompt templates)
create table if not exists prompts (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('fit_score','cv_bullets','cover_letter','outreach_email')),
  name text,
  content text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists jobs_visa_idx on jobs(visa_sponsorship_detected);
create index if not exists jobs_score_idx on jobs(fit_score desc);
create index if not exists jobs_created_idx on jobs(created_at desc);
create index if not exists applications_status_idx on applications(status);
create index if not exists applications_user_idx on applications(user_id);

-- Auto-update updated_at on applications
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_applications_updated_at
  before update on applications
  for each row execute function update_updated_at_column();

-- Insert default AI prompt templates
insert into prompts (type, name, content) values
('fit_score', 'Default Fit Score Prompt',
'You are an expert UK recruiter for finance, operations, data and marketing roles.
Here is a candidate CV:
[CV_TEXT]

Here is a job description:
[JOB_DESCRIPTION]

1) Give a fit score from 0-100 for how well this candidate matches the role in the UK context.
2) Briefly explain in 3 bullet points why.
3) Indicate with Yes/No whether the role suits someone without prior UK work experience but with 4+ years overseas experience and an MBA from a UK university.

Return JSON only: {"score": number, "rationale": ["bullet1","bullet2","bullet3"], "suitable_without_uk_exp": "Yes/No"}'),

('cv_bullets', 'Default CV Bullets Prompt',
'You are optimising a CV for a UK job application. Use UK English spelling.
Candidate CV:
[CV_TEXT]

Target job description:
[JOB_DESCRIPTION]

Suggest up to 6 bullet points (STAR style, quantified where possible) that can be added or refined to better match this specific role.
Keep each bullet to one line. Focus on credit analysis, risk, operations, data, and finance achievements where relevant.

Return JSON only: {"bullets": ["bullet1", "bullet2", ...]}'),

('cover_letter', 'Default Cover Letter Prompt',
'Write a concise one-page UK-style cover letter for this role. Use a professional but direct tone.
Do not start with "I am writing to apply" - use a strong opening line.
Focus on: 4 years credit underwriting at HDFC Bank, MBA in Finance & Analytics at Hult International Business School London, data analytics skills, operations management.
Mention willingness to relocate/already based in London (Wembley).
Do not mention need for visa sponsorship in the letter itself.

Job description:
[JOB_DESCRIPTION]

Candidate CV summary:
[CV_SUMMARY]

Return the cover letter as plain text, ready to copy-paste.'),

('outreach_email', 'Default Outreach Email Prompt',
'Write a short 4-5 line professional outreach message to a recruiter or hiring manager on LinkedIn.
Tone: confident, direct, not desperate.
Mention: MBA Finance & Analytics at Hult London, 4 years credit underwriting at HDFC Bank, based in London.

Target role: [JOB_TITLE] at [COMPANY]

Return the message as plain text only.');
