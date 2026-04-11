'use client'
import { useEffect, useState } from 'react'
import { Briefcase, CheckCircle, Clock, TrendingUp, Star, Shield, Calendar, Target } from 'lucide-react'

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

  useEffect(() => {
    async function loadStats() {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          fetch('/api/jobs?limit=1000'),
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
      }
    }
    loadStats()
  }, [])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, Yuvaraj</h1>
        <p className="text-gray-500 mt-1">Here's your job search overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Jobs Found" value={stats.total_jobs} icon={<Briefcase className="text-blue-500" />} color="blue" />
        <StatCard label="New Today" value={stats.new_jobs_today} icon={<Calendar className="text-green-500" />} color="green" />
        <StatCard label="Visa Sponsored" value={stats.visa_sponsored_jobs} icon={<Shield className="text-purple-500" />} color="purple" />
        <StatCard label="High Fit (70+)" value={stats.high_fit_jobs} icon={<Star className="text-yellow-500" />} color="yellow" />
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-4">Application Pipeline</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Shortlisted" value={stats.shortlisted} icon={<Target className="text-orange-500" />} color="orange" />
        <StatCard label="Applied" value={stats.applied} icon={<Clock className="text-blue-400" />} color="blue" />
        <StatCard label="Interviews" value={stats.interviews} icon={<TrendingUp className="text-green-500" />} color="green" />
        <StatCard label="Offers" value={stats.offers} icon={<CheckCircle className="text-emerald-500" />} color="emerald" />
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <a href="/jobs?visa_only=true&min_score=70" className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Shield className="text-blue-600" size={20} />
            <div>
              <p className="font-medium text-blue-900 text-sm">Top Visa Jobs</p>
              <p className="text-xs text-blue-600">Sponsored + 70+ score</p>
            </div>
          </a>
          <a href="/jobs" className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Briefcase className="text-green-600" size={20} />
            <div>
              <p className="font-medium text-green-900 text-sm">All Jobs</p>
              <p className="text-xs text-green-600">Browse & filter</p>
            </div>
          </a>
          <a href="/applications" className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <CheckCircle className="text-purple-600" size={20} />
            <div>
              <p className="font-medium text-purple-900 text-sm">Track Applications</p>
              <p className="text-xs text-purple-600">Update statuses</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{label}</span>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
