'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/api/client'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) { setUnreadCount(0); return }

    const fetchUnread = () => {
      apiClient.get('/api/v1/messages/unread-count')
        .then((res) => {
          if (res.data.status === 'success') setUnreadCount(res.data.data.count)
        })
        .catch(() => {})
    }

    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 sm:space-x-8">
            <Link href="/" className="text-xl font-bold text-white">
              The Drive
            </Link>
            {isAuthenticated && (
              <Link
                href="/vehicles/new"
                className="hidden sm:block text-gray-300 hover:text-white transition-colors"
              >
                List Vehicle
              </Link>
            )}
            {isAuthenticated && user?.role === 'DEALER' && (
              <Link
                href="/dashboard"
                className="hidden sm:block text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            )}
            {isAuthenticated && (
              <Link
                href="/messages"
                className="hidden sm:flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
              >
                Messages
                {unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
            {!isAuthenticated && (
              <div className="hidden lg:flex items-center gap-4 text-sm text-gray-300">
                <Link href="/drive-token" className="hover:text-white transition-colors">Drive Token</Link>
                <Link href="/tokenomics" className="hover:text-white transition-colors">Tokenomics</Link>
                <Link href="/roadmap" className="hover:text-white transition-colors">Roadmap</Link>
                <Link href="/compliance" className="hover:text-white transition-colors">Compliance</Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:inline text-gray-300 text-sm">
                  Welcome, {user?.firstName}
                </span>
                <button
                  onClick={logout}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded transition-colors text-sm sm:text-base"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <span className="hidden rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200 md:inline-flex">
                  Preview only
                </span>
                <Link
                  href="/pitch"
                  className="hidden sm:inline bg-gray-800 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded transition-colors text-sm sm:text-base"
                >
                  Investor Pitch
                </Link>
                <Link
                  href="mailto:me@marshallepie.com?subject=The%20Drive%20preview%20access"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-4 py-2 rounded transition-colors text-sm sm:text-base"
                >
                  Request Access
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
