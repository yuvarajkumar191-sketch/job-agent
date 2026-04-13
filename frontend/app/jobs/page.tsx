'use client'
import { useEffect, useState, useCallback } from 'react'
import { Search, Shield, Eye, EyeOff, ExternalLink, Plus, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Job {
  id: string
  title: string
  company: string
  location: string
  url: string
  fit_score: number
  visa_sponsorship_detected: boolean
  uk_experience_required: boolean
  created_at: string
  salary_range: string
  apply_url: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState([] as Job[])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [minScore, setMinScore] = useState(90)
  const [visaOnly, setVisaOnly] = useState(false)
  const [hideUK, setHideUK] = useState(false)
  const [applying, setApplying] = useState('')
  const [applied, setApplied] = useState([] as string[])

  const loadJobs = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      search,
      min_score: minScore.toString(),
      visa_only: visaOnly.toString(),
      hide_uk_required: hideUK.toString(),
      limit: '100'
    })
    const res = await fetch(`/api/jobs?${params}`)
    const data = await res.json()
    setJobs(data.jobs || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [search, minScore, visaOnly, hideUK])

  useEffect(() => { loadJobs() }, [loadJobs])

  async function startApplication(job: Job) {
    setApplying(job.id)
    try {
      await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: job.id, user_id: 'default' })
      })
      setApplied(prev => [...prev, job.id])
      const applyUrl = job.apply_url || job.url
      if (applyUrl) window.open(applyUrl, '_blank', 'noopener,noreferrer')
    } catch (e) {
      console.error('Failed to track application', e)
    } finally {
      setApplying('')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">{total} jobs found &bull; Min score: {minScore}</p>
        </div>
        <Link href="/applications" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          <CheckCircle className="w-4 h-4" /> My Applications
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 outline-none text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Min score:</span>
          <input type="range" min="0" max="100" value={minScore} onChange={e => setMinScore(parseInt(e.target.value))} className="w-24" />
          <span className="text-xs font-bold text-gray-700 w-8">{minScore}</span>
        </div>
        <button onClick={() => setVisaOnly(!visaOnly)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${visaOnly ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
          <Shield className="w-3 h-3" /> Visa sponsored only
        </button>
        <button onClick={() => setHideUK(!hideUK)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${hideUK ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
          {hideUK ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} Hide UK-exp required
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading jobs...
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Job</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Company</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Score</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Flags</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.map(job => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <p className="font-medium text-gray-900 text-sm">{job.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{job.location}{job.salary_range ? ` · ${job.salary_range}` : ''}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-700">{job.company}</td>
                  <td className="p-4"><ScoreBadge score={job.fit_score} /></td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {job.visa_sponsorship_detected && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">Visa</span>}
                      {job.uk_experience_required && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">UK exp</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 items-center">
                      {(job.apply_url || job.url) && (
                        <a href={job.apply_url || job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50">
                          <ExternalLink className="w-3 h-3" /> View
                        </a>
                      )}
                      {applied.includes(job.id) ? (
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          <CheckCircle className="w-3 h-3" /> Applied
                        </span>
                      ) : (
                        <button onClick={() => startApplication(job)} disabled={applying === job.id} className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50">
                          {applying === job.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Apply
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {jobs.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              No jobs found with score &ge; {minScore}. Try lowering the score filter.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-green-100 text-green-700' : score >= 70 ? 'bg-yellow-100 text-yellow-700' : score >= 50 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>{score}</span>
}
