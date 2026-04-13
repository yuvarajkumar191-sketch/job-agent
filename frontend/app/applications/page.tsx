'use client'
import { useEffect, useState } from 'react'
import { ExternalLink, CheckCircle, Clock, TrendingUp, XCircle, Briefcase, Loader2 } from 'lucide-react'
import Link from 'next/link'

const STATUSES = ['applied', 'shortlisted', 'interview', 'offer', 'rejected']

const STATUS_STYLES: Record<string, string> = {
  applied:     'bg-blue-100 text-blue-700',
  shortlisted: 'bg-purple-100 text-purple-700',
  interview:   'bg-yellow-100 text-yellow-700',
  offer:       'bg-emerald-100 text-emerald-700',
  rejected:    'bg-red-100 text-red-700',
  new:         'bg-gray-100 text-gray-600',
}

interface AppJob {
  id: string
  title: string
  company: string
  location: string
  apply_url: string
  fit_score: number
  visa_sponsorship_detected: boolean
}

interface Application {
  id: string
  status: string
  created_at: string
  applied_at: string
  notes: string
  cover_letter: string
  job: AppJob
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState([] as Application[])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/applications')
      .then(r => r.json())
      .then(d => {
        setApps(d.applications || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function updateStatus(appId: string, status: string) {
    setUpdating(appId)
    await fetch(`/api/applications/${appId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    setApps(prev => prev.map(a => a.id === appId ? { ...a, status } : a))
    setUpdating('')
  }

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter)

  const counts: Record<string, number> = {}
  for (const a of apps) counts[a.status] = (counts[a.status] || 0) + 1

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-1">{apps.length} applications tracked</p>
        </div>
        <Link href="/jobs" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          <Briefcase className="w-4 h-4" /> Browse Jobs
        </Link>
      </div>

      {/* Pipeline summary */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(filter === s ? 'all' : s)}
            className={`p-3 rounded-xl border text-center transition-all ${
              filter === s ? 'border-blue-500 bg-blue-50' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}>
            <p className="text-xl font-bold text-gray-900">{counts[s] || 0}</p>
            <p className="text-xs text-gray-500 capitalize mt-0.5">{s}</p>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No applications yet</p>
          <p className="text-gray-400 text-sm mt-1">Go to <Link href="/jobs" className="text-blue-600 hover:underline">Jobs</Link> and click Apply to start tracking</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Job</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Company</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Score</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Applied</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(app => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <p className="font-medium text-gray-900 text-sm">{app.job?.title || 'Unknown Job'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{app.job?.location || ''}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-700">{app.job?.company || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      (app.job?.fit_score || 0) >= 90 ? 'bg-green-100 text-green-700' :
                      (app.job?.fit_score || 0) >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                    }`}>{app.job?.fit_score || '-'}</span>
                  </td>
                  <td className="p-4">
                    <select
                      value={app.status}
                      onChange={e => updateStatus(app.id, e.target.value)}
                      disabled={updating === app.id}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 outline-none cursor-pointer ${
                        STATUS_STYLES[app.status] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td className="p-4 text-xs text-gray-400">
                    {app.applied_at ? new Date(app.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {app.job?.apply_url && (
                        <a href={app.job.apply_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50">
                          <ExternalLink className="w-3 h-3" /> Open
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
