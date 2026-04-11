'use client'
import { useEffect, useState, useCallback } from 'react'
import { Search, Shield, Eye, EyeOff, ExternalLink, Plus } from 'lucide-react'
import Link from 'next/link'

interface Job {
  id: string; title: string; company: string; location: string; url: string;
  fit_score: number; visa_sponsorship_detected: boolean; uk_experience_required: boolean;
  created_at: string; salary_range: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [minScore, setMinScore] = useState(0)
  const [visaOnly, setVisaOnly] = useState(false)
  const [hideUK, setHideUK] = useState(false)

  const loadJobs = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      search, min_score: minScore.toString(),
      visa_only: visaOnly.toString(), hide_uk_required: hideUK.toString(), limit: '100'
    })
    const res = await fetch(`/api/jobs?${params}`)
    const data = await res.json()
    setJobs(data.jobs || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [search, minScore, visaOnly, hideUK])

  useEffect(() => { loadJobs() }, [loadJobs])

  async function startApplication(jobId: string) {
    await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, user_id: 'YOUR_USER_ID' })
    })
    alert('Application started! Go to Applications to generate materials.')
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-500 mt-1">{total} jobs found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search size={16} className="text-gray-400" />
          <input type="text" placeholder="Search jobs..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Min score:</span>
          <input type="range" min="0" max="100" value={minScore}
            onChange={e => setMinScore(parseInt(e.target.value))}
            className="w-24" />
          <span className="text-xs font-medium w-8">{minScore}</span>
        </div>
        <button onClick={() => setVisaOnly(!visaOnly)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            visaOnly ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
          }`}>
          <Shield size={12} /> Visa sponsored only
        </button>
        <button onClick={() => setHideUK(!hideUK)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            hideUK ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
          }`}>
          {hideUK ? <Eye size={12} /> : <EyeOff size={12} />} Hide UK-exp required
        </button>
      </div>

      {/* Jobs table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading jobs...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flags</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {jobs.map(job => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/jobs/${job.id}`} className="font-medium text-blue-600 hover:underline">
                      {job.title}
                    </Link>
                    <p className="text-xs text-gray-400">{job.location} {job.salary_range && `· ${job.salary_range}`}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{job.company}</td>
                  <td className="px-4 py-3">
                    <ScoreBadge score={job.fit_score} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {job.visa_sponsorship_detected && (
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">Visa</span>
                      )}
                      {job.uk_experience_required && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">UK exp</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {job.url && (
                        <a href={job.url} target="_blank" rel="noopener noreferrer"
                          className="p-1 text-gray-400 hover:text-gray-600">
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <button onClick={() => startApplication(job.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                        <Plus size={12} /> Apply
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {jobs.length === 0 && (
            <div className="text-center py-12 text-gray-400">No jobs found. Adjust your filters.</div>
          )}
        </div>
      )}
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-100 text-green-700' : score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{score}</span>
}
