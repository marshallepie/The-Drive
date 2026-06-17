import { NextResponse } from 'next/server'

const ACCESS_COOKIE = 'drive_preview_access'

export async function POST(request: Request) {
  const { username = '', password = '', next = '/vehicles' } = await request.json()

  const expectedUsername = process.env.DRIVE_PREVIEW_USERNAME
  const expectedPassword = process.env.DRIVE_PREVIEW_PASSWORD

  if (!expectedUsername || !expectedPassword) {
    return NextResponse.json(
      { error: 'Preview access is not configured yet.' },
      { status: 503 },
    )
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    return NextResponse.json(
      { error: 'Invalid preview credentials. Access must be issued by Marshall.' },
      { status: 401 },
    )
  }

  const response = NextResponse.json({ ok: true, redirectTo: next || '/vehicles' })
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
}
