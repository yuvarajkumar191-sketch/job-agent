import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Briefcase, LayoutDashboard, FileText, User, Bot } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Job Agent - Your Personal AI Job Hunter',
  description: 'AI-powered job search agent for visa-sponsored UK roles',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-50">
          <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Bot className="text-white" size={22} />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900 text-lg">Job Agent</h1>
                  <p className="text-xs text-gray-500">AI-powered job hunter</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-b border-gray-100">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="font-semibold text-gray-800 text-sm">Yuvaraj Kumar</p>
                <p className="text-xs text-gray-500">MBA Finance &amp; Analytics</p>
                <p className="text-xs text-blue-600">Hult Business School, London</p>
              </div>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-sm font-medium">
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <Link href="/jobs" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-sm font-medium">
                <Briefcase size={18} />
                Jobs
              </Link>
              <Link href="/applications" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-sm font-medium">
                <FileText size={18} />
                Applications
              </Link>
              <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-sm font-medium">
                <User size={18} />
                My Profile
              </Link>
            </nav>
          </aside>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
