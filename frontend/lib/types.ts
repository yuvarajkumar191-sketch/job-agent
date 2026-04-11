// ============================================
// Job Agent - TypeScript Types
// ============================================

export type JobStatus = 'new' | 'shortlisted' | 'applied' | 'interview' | 'offer' | 'rejected'

export interface Job {
  id: string
  external_id: string
  source: string
  title: string
  company: string | null
  location: string | null
  url: string | null
  description: string | null
  visa_sponsorship_detected: boolean
  uk_experience_required: boolean
  fit_score: number
  fit_rationale: string | null
  salary_range: string | null
  job_type: string | null
  scraped_at: string
  created_at: string
}

export interface Application {
  id: string
  job_id: string
  user_id: string
  status: JobStatus
  cover_letter_text: string | null
  cv_variant_text: string | null
  outreach_email_text: string | null
  tailored_bullets: string | null
  notes: string | null
  applied_at: string | null
  created_at: string
  updated_at: string
  job?: Job
}

export interface User {
  id: string
  email: string
  name: string | null
  linkedin_url: string | null
  base_cv_text: string | null
  base_cv_url: string | null
  target_roles: string[]
  target_location: string
  preferred_sectors: string[]
  created_at: string
}

export interface DashboardStats {
  total_jobs: number
  new_jobs_today: number
  shortlisted: number
  applied: number
  interviews: number
  offers: number
  visa_sponsored_jobs: number
  high_fit_jobs: number
}

export interface MaterialsResponse {
  cover_letter_text: string
  cv_variant_text: string
  outreach_email_text: string
  tailored_bullets: string
}

export interface JobFilters {
  min_score?: number
  visa_only?: boolean
  hide_uk_required?: boolean
  search?: string
  source?: string
  page?: number
  limit?: number
}
