'use client'
import { useEffect, useState } from 'react'
import { Briefcase, CheckCircle, Clock, TrendingUp, Star, Shield, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  total_jobs: number
  new_jobs_today: number
  shortlisted: number
  applied: number
  interviews: number
  offers: number
  visa_sponsored_jobs: number
  high_fit_jobs: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    total_jobs: 0, new_jobs_today: 0, shortlisted: 0, applied: 0,
    interviews: 0, offers: 0, visa_sponsored_jobs: 0, high_fit_jobs: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          fetch('/api/jobs?limit=1000&min_score=0'),
          fetch('/api/applications'),
        ])
        const jobsData = await jobsRes.json()
        const appsData = await appsRes.json()
        const jobs = jobsData.jobs || []
        const apps = appsData.applications || []
        const today = new Date().toDateString()
        setStats({
          total_jobs: jobsData.total || 0,
          new_jobs_today: jobs.filter((j: any) => new Date(j.created_at).toDateString() === today).length,
          shortlisted: apps.filter((a: any) => a.status === 'shortlisted').length,
          applied: apps.filter((a: any) => a.status === 'applied').length,
          interviews: apps.filter((a: any) => a.status === 'interview').length,
          offers: apps.filter((a: any) => a.status === 'offer').length,
          visa_sponsored_jobs: jobs.filter((j: any) => j.visa_sponsorship_detected).length,
          high_fit_jobs: jobs.filter((j: any) => j.fit_score >= 70).length,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, Yuvaraj</h1>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s your job search overview</p>
      </div>

      {/* Job stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Link href="/jobs?min_score=0" className="block">
          <StatCard label="Total Jobs Found" value={loading ? '...' : stats.total_jobs} icon={<Briefcase className="w-5 h-5" />} color="blue" />
        </Link>
        <Link href="/jobs?min_score=0" className="block">
          <StatCard label="New Today" value={loading ? '...' : stats.new_jobs_today} icon={<Calendar className="w-5 h-5" />} color="green" />
        </Link>
        <Link href="/jobs?visa_only=true&min_score=0" className="block">
          <StatCard label="Visa Sponsored" value={loading ? '...' : stats.visa_sponsored_jobs} icon={<Shield className="w-5 h-5" />} color="purple" />
        </Link>
        <Link href="/jobs?min_score=70" className="block">
          <StatCard label="High Fit (70+)" value={loading ? '...' : stats.high_fit_jobs} icon={<Star className="w-5 h-5" />} color="yellow" />
        </Link>
      </div>

      {/* Application Pipeline */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Application Pipeline</h2>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Link href="/applications?status=shortlisted" className="block">
          <StatCard label="Shortlisted" value={loading ? '...' : stats.shortlisted} icon={<Star className="w-5 h-5" />} color="orange" />
        </Link>
        <Link href="/applications?status=applied" className="block">
          <StatCard label="Applied" value={loading ? '...' : stats.applied} icon={<Clock className="w-5 h-5" />} color="blue" />
        </Link>
        <Link href="/applications?status=interview" className="block">
          <StatCard label="Interviews" value={loading ? '...' : stats.interviews} icon={<TrendingUp className="w-5 h-5" />} color="green" />
        </Link>
        <Link href="/applications?status=offer" className="block">
          <StatCard label="Offers" value={loading ? '...' : stats.offers} icon={<CheckCircle className="w-5 h-5" />} color="emerald" />
        </Link>
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-3 gap-4">
        <Link href="/jobs?visa_only=true&min_score=70" className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Top Visa Jobs</p>
              <p className="text-xs text-gray-500">Sponsored + 70+ score</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </Link>
        <Link href="/jobs?min_score=0" className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">All Jobs</p>
              <p className="text-xs text-gray-500">Browse &amp; filter</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </Link>
        <Link href="/applications" className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Track Applications</p>
              <p className="text-xs text-gray-500">Update statuses</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </Link>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    blue:    'bg-blue-50 text-blue-600',
    green:   'bg-green-50 text-green-600',
    purple:  'bg-purple-50 text-purple-600',
    yellow:  'bg-yellow-50 text-yellow-600',
    orange:  'bg-orange-50 text-orange-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  }
  return (
    <div className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{label}</span>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color] || colors.blue}`}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
