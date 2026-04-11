'use client'
import { useEffect, useState } from 'react'
import { ExternalLink, Sparkles, ChevronDown } from 'lucide-react'

const STATUSES = ['new', 'shortlisted', 'applied', 'interview', 'offer', 'rejected']
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-gray-100 text-gray-700',
  shortlisted: 'bg-blue-100 text-blue-700',
  applied: 'bg-yellow-100 text-yellow-700',
  interview: 'bg-green-100 text-green-700',
  offer: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
}

interface Application {
  id: string; status: string; created_at: string;
  cover_letter_text?: string; cv_variant_text?: string; outreach_email_text?: string;
  job: { id: string; title: string; company: string; url: string; fit_score: number }
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/applications').then(r => r.json()).then(d => {
      setApps(d.applications || [])
      setLoading(false)
    })
  }, [])

  async function updateStatus(appId: string, status: string) {
    await fetch(`/api/applications/${appId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    setApps(prev => prev.map(a => a.id === appId ? { ...a, status } : a))
  }

  async function generateMaterials(appId: string) {
    setGenerating(appId)
    const res = await fetch(`/api/applications/${appId}/materials`, { method: 'POST' })
    const data = await res.json()
    setApps(prev => prev.map(a => a.id === appId ? { ...a, ...data } : a))
    setGenerating(null)
    setExpanded(appId)
  }

  if (loading) return <div className="p-8 text-gray-400">Loading applications...</div>

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-500 mt-1">{apps.length} applications tracked</p>
      </div>

      <div className="space-y-3">
        {apps.map(app => (
          <div key={app.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{app.job?.title}</span>
                  <span className="text-gray-400">at</span>
                  <span className="text-gray-700">{app.job?.company}</span>
                  {app.job?.url && (
                    <a href={app.job.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Applied: {new Date(app.created_at).toLocaleDateString('en-GB')}</p>
              </div>

              {/* Status selector */}
              <select value={app.status} onChange={e => updateStatus(app.id, e.target.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_COLORS[app.status]}`}>
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>

              {/* Generate materials button */}
              <button onClick={() => generateMaterials(app.id)}
                disabled={generating === app.id}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50">
                <Sparkles size={12} />
                {generating === app.id ? 'Generating...' : 'AI Materials'}
              </button>

              {/* Expand */}
              {(app.cover_letter_text || app.cv_variant_text) && (
                <button onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                  className="p-1 text-gray-400 hover:text-gray-600">
                  <ChevronDown size={16} className={expanded === app.id ? 'rotate-180' : ''} />
                </button>
              )}
            </div>

            {/* Expanded materials */}
            {expanded === app.id && (
              <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50">
                {app.cv_variant_text && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Tailored CV Bullets</h3>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-white p-3 rounded-lg border">{app.cv_variant_text}</pre>
                  </div>
                )}
                {app.cover_letter_text && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Cover Letter</h3>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-white p-3 rounded-lg border">{app.cover_letter_text}</pre>
                  </div>
                )}
                {app.outreach_email_text && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">LinkedIn Outreach Message</h3>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-white p-3 rounded-lg border">{app.outreach_email_text}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {apps.length === 0 && (
          <div className="text-center py-12 text-gray-400">No applications yet. Go to Jobs and click Apply to start tracking.</div>
        )}
      </div>
    </div>
  )
}
