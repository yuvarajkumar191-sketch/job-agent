'use client'
import { useState } from 'react'
import { User, Briefcase, MapPin, Phone, Mail, Linkedin, Star, Save, CheckCircle } from 'lucide-react'

export default function ProfilePage() {
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState({
    full_name: 'Yuvaraj Kumar',
    email: 'yuvaraj.kumar191@gmail.com',
    phone: '',
    location: 'London, UK',
    linkedin_url: '',
    headline: 'MBA Finance & Analytics | Credit & Risk | Hult Business School',
    summary: '',
    skills: 'Financial Analysis, Credit Underwriting, Excel, SQL, Tableau, Risk Management, Business Analysis',
    experience_years: '4',
    target_roles: 'Financial Analyst, Business Analyst, Credit Analyst, Risk Analyst',
    resume_text: '',
    visa_required: true,
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Your profile is used to match and tailor job applications</p>
      </div>

      <div className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" /> Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={profile.full_name}
                onChange={e => setProfile({...profile, full_name: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={profile.email}
                onChange={e => setProfile({...profile, email: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={profile.phone} placeholder="+44 7xxx xxxxxx"
                onChange={e => setProfile({...profile, phone: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={profile.location}
                onChange={e => setProfile({...profile, location: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
              <input type="url" value={profile.linkedin_url} placeholder="https://linkedin.com/in/yourprofile"
                onChange={e => setProfile({...profile, linkedin_url: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Professional Headline</label>
              <input type="text" value={profile.headline}
                onChange={e => setProfile({...profile, headline: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Job Preferences */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-purple-500" /> Job Preferences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <input type="number" value={profile.experience_years}
                onChange={e => setProfile({...profile, experience_years: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="visa" checked={profile.visa_required}
                onChange={e => setProfile({...profile, visa_required: e.target.checked})}
                className="h-4 w-4 text-blue-600 rounded" />
              <label htmlFor="visa" className="text-sm font-medium text-gray-700">Require Visa Sponsorship</label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Job Titles (comma separated)</label>
              <input type="text" value={profile.target_roles}
                onChange={e => setProfile({...profile, target_roles: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
              <input type="text" value={profile.skills}
                onChange={e => setProfile({...profile, skills: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Resume */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" /> Resume / CV
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
              <textarea rows={3} value={profile.summary} placeholder="Write a 2-3 sentence summary of your background..."
                onChange={e => setProfile({...profile, summary: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Resume Text</label>
              <p className="text-xs text-gray-400 mb-2">Paste your full CV text here — the AI uses this to tailor your applications</p>
              <textarea rows={12} value={profile.resume_text} placeholder="Paste your full resume/CV text here..."
                onChange={e => setProfile({...profile, resume_text: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            {saved ? <><CheckCircle className="h-5 w-5" /> Saved!</> : <><Save className="h-5 w-5" /> Save Profile</>}
          </button>
        </div>
      </div>
    </div>
  )
}
