import crypto from 'crypto'
import nodemailer from 'nodemailer'

export type PreviewAccessRequest = {
  name: string
  email: string
  company?: string
  reason?: string
}

const MAIL_FROM = process.env.SMTP_FROM || 'The Drive <noreply@thedrive.co>'
const NOTIFY_TO = process.env.DRIVE_PREVIEW_ACCESS_NOTIFY_TO || 'me@marshallepie.com'

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return null
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

async function sendMail(to: string, subject: string, html: string) {
  const transporter = getTransporter()

  if (!transporter) {
    console.log(`[PREVIEW EMAIL] To: ${to} | Subject: ${subject}`)
    console.log(html)
    return
  }

  await transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject,
    html,
  })
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function appUrlFromOrigin(origin?: string) {
  return origin || process.env.NEXT_PUBLIC_APP_URL || 'https://the-drive-web3.netlify.app'
}

export function generatePreviewPassword() {
  return crypto.randomBytes(9).toString('base64url')
}

export async function notifyMarshallOfPreviewRequest(request: PreviewAccessRequest) {
  const subject = `The Drive preview access request — ${request.name}`
  const companyLine = request.company ? `<p><strong>Company:</strong> ${escapeHtml(request.company)}</p>` : ''
  const reasonLine = request.reason ? `<p><strong>Reason:</strong><br>${escapeHtml(request.reason)}</p>` : ''

  await sendMail(
    NOTIFY_TO,
    subject,
    `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
        <h2>The Drive preview access request</h2>
        <p>A new preview access request was submitted.</p>
        <p><strong>Name:</strong> ${escapeHtml(request.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(request.email)}</p>
        ${companyLine}
        ${reasonLine}
        <p style="margin-top:20px;color:#555;">If MEPA automation is wired, this request can now be reviewed and approved.</p>
      </div>
    `,
  )
}

export async function sendPreviewAccessApprovedEmail(params: {
  applicantName: string
  applicantEmail: string
  password: string
  origin?: string
}) {
  const loginUrl = appUrlFromOrigin(params.origin)

  await sendMail(
    params.applicantEmail,
    'Your The Drive preview access has been approved',
    `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
        <h2>Your The Drive preview access is ready</h2>
        <p>Hi ${escapeHtml(params.applicantName)},</p>
        <p>Your preview access request has been approved. You can now sign in to the current preview environment using the credentials below.</p>
        <div style="margin:20px 0;padding:16px;border:1px solid #ddd;border-radius:10px;background:#fafafa;">
          <p style="margin:0 0 8px;"><strong>Email:</strong> ${escapeHtml(params.applicantEmail)}</p>
          <p style="margin:0;"><strong>Password:</strong> ${escapeHtml(params.password)}</p>
        </div>
        <p>Please keep these details private.</p>
        <p><a href="${loginUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;">Open The Drive preview</a></p>
      </div>
    `,
  )
}

export async function firePreviewAccessWebhook(payload: Record<string, unknown>) {
  const webhookUrl = process.env.DRIVE_PREVIEW_REQUEST_WEBHOOK_URL

  if (!webhookUrl) {
    return { delivered: false, reason: 'not-configured' }
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Preview request webhook failed with status ${response.status}`)
  }

  return { delivered: true }
}

export function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return { firstName: 'Preview', lastName: 'User' }
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: 'User' }
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

export function getApiBaseUrl() {
  return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
}
