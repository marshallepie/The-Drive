import { NextResponse } from 'next/server'
import {
  generatePreviewPassword,
  getApiBaseUrl,
  sendPreviewAccessApprovedEmail,
  splitName,
} from '@/lib/preview-access'

export const runtime = 'nodejs'

type ApproveBody = {
  name: string
  email: string
  password?: string
  company?: string
  reason?: string
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status })
}

export async function POST(request: Request) {
  const approvalSecret = process.env.DRIVE_PREVIEW_APPROVAL_SECRET
  if (!approvalSecret) {
    return jsonError('Preview approval secret is not configured.', 503)
  }

  const providedSecret = request.headers.get('x-preview-approval-secret') || ''
  if (providedSecret !== approvalSecret) {
    return jsonError('Unauthorized preview approval request.', 401)
  }

  try {
    const body = (await request.json()) as ApproveBody
    const name = body.name?.trim()
    const email = body.email?.trim().toLowerCase()

    if (!name) {
      return jsonError('Name is required.', 400)
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonError('A valid email address is required.', 400)
    }

    const { firstName, lastName } = splitName(name)
    const password = body.password?.trim() || generatePreviewPassword()

    const registerResponse = await fetch(`${getApiBaseUrl()}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        role: 'PUBLIC',
      }),
    })

    const registerPayload = await registerResponse.json().catch(() => null)

    if (!registerResponse.ok) {
      const message = registerPayload?.message || registerPayload?.error || 'Preview account could not be created.'
      return jsonError(message, registerResponse.status || 500)
    }

    await sendPreviewAccessApprovedEmail({
      applicantName: name,
      applicantEmail: email,
      password,
      origin: request.headers.get('origin') || undefined,
    })

    return NextResponse.json({
      ok: true,
      email,
      password,
      message: 'Preview account created and credentials sent.',
    })
  } catch (error) {
    console.error('[PREVIEW ACCESS] Approval failed:', error)
    return jsonError('Preview approval failed.', 500)
  }
}
