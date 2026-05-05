'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api/client'
import { useAuth } from '@/contexts/AuthContext'

interface Conversation {
  id: string
  vehicle_id: string | null
  last_message: string | null
  last_message_at: string | null
  unread_count: number
  make: string | null
  model: string | null
  year: number | null
  other_user_id: string
  other_first_name: string
  other_last_name: string
  other_role: string
  other_dealership_name: string | null
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function MessagesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/login')
      return
    }
    if (isAuthenticated) fetchConversations()
  }, [isAuthenticated, authLoading])

  const fetchConversations = async () => {
    try {
      const res = await apiClient.get('/api/v1/messages/conversations')
      if (res.data.status === 'success') {
        setConversations(res.data.data.conversations)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading messages...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>

        {conversations.length === 0 ? (
          <div className="bg-gray-900 border border-dashed border-gray-700 rounded-2xl p-12 text-center">
            <p className="text-gray-400 mb-4">No conversations yet.</p>
            <Link
              href="/vehicles"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors text-sm"
            >
              Browse Vehicles
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {conversations.map((c) => {
              const name = c.other_dealership_name || `${c.other_first_name} ${c.other_last_name}`
              return (
                <Link
                  key={c.id}
                  href={`/messages/${c.id}`}
                  className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl px-5 py-4 flex items-center gap-4 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-semibold text-sm">
                      {(c.other_dealership_name || c.other_first_name)[0].toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold truncate">{name}</span>
                      {c.last_message_at && (
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {timeAgo(c.last_message_at)}
                        </span>
                      )}
                    </div>

                    {c.vehicle_id && c.make && (
                      <p className="text-xs text-blue-400 mb-0.5">
                        {c.year} {c.make} {c.model}
                      </p>
                    )}

                    <p className="text-sm text-gray-400 truncate">
                      {c.last_message || 'No messages yet'}
                    </p>
                  </div>

                  {c.unread_count > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-0.5 flex-shrink-0">
                      {c.unread_count}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
