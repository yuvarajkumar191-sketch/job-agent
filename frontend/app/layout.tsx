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
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-50">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-900 text-white flex flex-col">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Bot className="h-8 w-8 text-blue-400" />
                <div>
                  <h1 className="font-bold text-lg leading-tight">Job Agent</h1>
                  <p className="text-xs text-gray-400">AI-powered job hunter</p>
                </div>
              </div>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              <NavLink href="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
              <NavLink href="/jobs" icon={<Briefcase size={18} />} label="Jobs" />
              <NavLink href="/applications" icon={<FileText size={18} />} label="Applications" />
              <NavLink href="/profile" icon={<User size={18} />} label="My Profile" />
            </nav>
            <div className="p-4 border-t border-gray-700">
              <p className="text-xs text-gray-500">Yuvaraj Kumar</p>
              <p className="text-xs text-gray-600">MBA Finance & Analytics</p>
              <p className="text-xs text-gray-600">Hult Business School, London</p>
            </div>
          </aside>
          {/* Main content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}
