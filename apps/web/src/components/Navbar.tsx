'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-white">
              The Drive
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-300 text-sm">
                  Welcome, {user?.firstName}
                </span>
                <button
                  onClick={logout}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
