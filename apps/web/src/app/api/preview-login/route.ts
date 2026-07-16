import { NextResponse } from 'next/server'
import { getApiBaseUrl } from '@/lib/preview-access'

const ACCESS_COOKIE = 'drive_preview_access'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { email = '', password = '', next = '/vehicles' } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 },
      )
    }

    const loginResponse = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const payload = await loginResponse.json().catch(() => null)

    if (!loginResponse.ok) {
      return NextResponse.json(
        { error: payload?.message || 'Invalid preview credentials. Access must be issued by Marshall.' },
        { status: loginResponse.status || 401 },
      )
    }

    const response = NextResponse.json({
      ok: true,
      redirectTo: next || '/vehicles',
      user: payload?.data?.user || null,
      tokens: payload?.data?.tokens || null,
    })

    response.cookies.set({
      name: ACCESS_COOKIE,
      value: 'granted',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    })

    return response
  } catch (error) {
    console.error('[PREVIEW LOGIN] Failed to authenticate preview user:', error)
    return NextResponse.json(
      { error: 'Preview login is temporarily unavailable. Please try again shortly.' },
      { status: 503 },
    )
  }
}
