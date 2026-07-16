import { NextResponse } from 'next/server'
import {
  firePreviewAccessWebhook,
  notifyMarshallOfPreviewRequest,
  type PreviewAccessRequest,
} from '@/lib/preview-access'

export const runtime = 'nodejs'

function badRequest(error: string, status = 400) {
  return NextResponse.json({ error }, { status })
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PreviewAccessRequest
    const name = body.name?.trim()
    const email = body.email?.trim().toLowerCase()
    const company = body.company?.trim() || ''
    const reason = body.reason?.trim() || ''

    if (!name) {
      return badRequest('Name is required.')
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest('A valid email address is required.')
    }

    const payload = { name, email, company, reason }

    await notifyMarshallOfPreviewRequest(payload)

    try {
      await firePreviewAccessWebhook({
        type: 'drive.preview_access.requested',
        requestedAt: new Date().toISOString(),
        request: payload,
      })
    } catch (error) {
      console.error('[PREVIEW ACCESS] Webhook notification failed:', error)
    }

    return NextResponse.json({
      ok: true,
      message: 'Your preview access request has been sent. Marshall Epie will be in touch.',
    })
  } catch (error) {
    console.error('[PREVIEW ACCESS] Request submission failed:', error)
    return badRequest('Preview access could not be requested right now.', 500)
  }
}
