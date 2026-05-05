'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import apiClient from '@/lib/api/client'
import { useAuth } from '@/contexts/AuthContext'

interface Message {
  id: string
  sender_id: string
  content: string
  status: string
  created_at: string
  first_name: string
  last_name: string
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/login')
    }
  }, [isAuthenticated, authLoading])

  const fetchMessages = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const res = await apiClient.get(`/api/v1/messages/conversations/${id}`)
      if (res.data.status === 'success') {
        setMessages(res.data.data.messages)
        // mark as read
        apiClient.patch(`/api/v1/messages/conversations/${id}/read`).catch(() => {})
      }
    } catch (err) {
      console.error(err)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!isAuthenticated || !id) return
    fetchMessages()

    // Poll for new messages every 5s
    pollRef.current = setInterval(() => fetchMessages(true), 5000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [isAuthenticated, id, fetchMessages])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const trimmed = content.trim()
    if (!trimmed || sending) return

    setSending(true)
    try {
      const res = await apiClient.post(`/api/v1/messages/conversations/${id}/messages`, {
        content: trimmed,
      })
      if (res.data.status === 'success') {
        setContent('')
        await fetchMessages(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading conversation...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900 px-4 py-3 flex items-center gap-3">
        <Link href="/messages" className="text-gray-400 hover:text-white transition-colors mr-1">
          ←
        </Link>
        <div>
          <p className="font-semibold text-sm">Conversation</p>
          <p className="text-xs text-gray-500">Messages are end-to-end within The Drive platform</p>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-3 max-w-3xl w-full mx-auto">
        {messages.length === 0 && (
          <p className="text-center text-gray-500 text-sm mt-8">
            No messages yet. Send one to start the conversation.
          </p>
        )}

        {messages.map((msg) => {
          const isOwn = msg.sender_id === user?.id
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[72%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {!isOwn && (
                  <span className="text-xs text-gray-500 px-1">
                    {msg.first_name} {msg.last_name}
                  </span>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isOwn
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-800 text-gray-100 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-xs text-gray-600 px-1">{formatTime(msg.created_at)}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-800 bg-gray-900 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Type a message…"
            rows={1}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-500"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !content.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm flex-shrink-0"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-600 text-center mt-2 max-w-3xl mx-auto">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </main>
  )
}
