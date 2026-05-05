import nodemailer from 'nodemailer'

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://thedrive.co'
const FROM = process.env.SMTP_FROM || 'The Drive <noreply@thedrive.co>'

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) return null
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  })
}

// Base HTML layout — dark branded wrapper
function layout(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;max-width:580px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#111;border-bottom:1px solid #222;padding:24px 32px;">
            <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">The Drive</span>
          </td>
        </tr>

        <!-- Body -->
        <tr><td style="padding:32px;">${content}</td></tr>

        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid #1f1f1f;padding:20px 32px;background:#0d0d0d;">
            <p style="margin:0;color:#555;font-size:12px;line-height:1.5;">
              You're receiving this because you have an account on The Drive.<br>
              <a href="${FRONTEND_URL}" style="color:#3b82f6;text-decoration:none;">thedrive.co</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function btn(label: string, url: string) {
  return `<a href="${url}" style="display:inline-block;background:#2563eb;color:#fff;font-weight:600;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:8px;margin-top:20px;">${label}</a>`
}

function h1(text: string) {
  return `<h1 style="margin:0 0 12px;color:#fff;font-size:22px;font-weight:700;line-height:1.3;">${text}</h1>`
}

function p(text: string) {
  return `<p style="margin:0 0 12px;color:#9ca3af;font-size:14px;line-height:1.6;">${text}</p>`
}

function vehicleCard(year: number, make: string, model: string, amount: string) {
  return `
  <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:16px;margin:20px 0;">
    <p style="margin:0 0 4px;color:#fff;font-weight:600;font-size:15px;">${year} ${make} ${model}</p>
    <p style="margin:0;color:#3b82f6;font-weight:700;font-size:18px;">${amount}</p>
  </div>`
}

async function send(to: string, subject: string, html: string) {
  const transporter = getTransporter()
  if (!transporter) {
    // Dev / test mode — log to console instead
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`)
    return
  }
  try {
    await transporter.sendMail({ from: FROM, to, subject, html })
  } catch (err) {
    // Never let email errors break the main flow
    console.error('[EMAIL] Failed to send:', err)
  }
}

export const EmailService = {

  async sendWelcome(to: string, firstName: string) {
    await send(to, 'Welcome to The Drive', layout(`
      ${h1(`Welcome, ${firstName}.`)}
      ${p('Your account is ready. Browse thousands of vehicles, contact sellers directly, and transact securely through our escrow platform.')}
      ${btn('Browse Vehicles', `${FRONTEND_URL}/vehicles`)}
    `))
  },

  async sendSubscriptionActivated(to: string, firstName: string, dealershipName?: string) {
    const name = dealershipName || firstName
    await send(to, 'Your dealer account is active — The Drive', layout(`
      ${h1(`You're in, ${name}.`)}
      ${p('Your annual dealer subscription is now active. Each vehicle you sell through The Drive earns you a £100 rebate, credited back against your subscription.')}
      <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;">Subscription summary</p>
        <p style="margin:0 0 4px;color:#fff;font-size:14px;">£600 / year</p>
        <p style="margin:0;color:#22c55e;font-size:14px;">£100 rebate per sale · free after 6 sales</p>
      </div>
      ${btn('Go to Dashboard', `${FRONTEND_URL}/dashboard`)}
    `))
  },

  async sendNewMessage(
    to: string,
    recipientName: string,
    senderName: string,
    vehicleTitle: string | null,
    conversationId: string
  ) {
    const subject = vehicleTitle
      ? `New message about ${vehicleTitle} — The Drive`
      : `New message from ${senderName} — The Drive`

    await send(to, subject, layout(`
      ${h1(`New message from ${senderName}`)}
      ${vehicleTitle ? p(`Re: <strong style="color:#fff;">${vehicleTitle}</strong>`) : ''}
      ${p(`Hi ${recipientName}, you have a new message waiting for you on The Drive.`)}
      ${btn('View Message', `${FRONTEND_URL}/messages/${conversationId}`)}
    `))
  },

  async sendTransactionInitiated(
    sellerEmail: string,
    sellerName: string,
    buyerName: string,
    year: number,
    make: string,
    model: string,
    amount: string,
    transactionId: string
  ) {
    await send(sellerEmail, `${buyerName} wants to buy your ${year} ${make} ${model}`, layout(`
      ${h1('You have a buyer!')}
      ${p(`<strong style="color:#fff;">${buyerName}</strong> has initiated a purchase for your listing.`)}
      ${vehicleCard(year, make, model, amount)}
      ${p('Their payment is being processed. You\'ll receive another notification once funds are held in escrow.')}
      ${btn('View Transaction', `${FRONTEND_URL}/transactions/${transactionId}`)}
    `))
  },

  async sendTransactionEscrowed(
    buyerEmail: string,
    buyerName: string,
    sellerEmail: string,
    sellerName: string,
    year: number,
    make: string,
    model: string,
    amount: string,
    transactionId: string
  ) {
    // Notify buyer
    await send(buyerEmail, `Payment confirmed — your ${year} ${make} ${model} is secured`, layout(`
      ${h1('Funds held in escrow')}
      ${p(`Hi ${buyerName}, your payment has been received and is held securely in escrow.`)}
      ${vehicleCard(year, make, model, amount)}
      ${p('Once you\'ve inspected the vehicle and are satisfied, confirm receipt to release the funds to the seller.')}
      ${btn('Confirm Receipt', `${FRONTEND_URL}/transactions/${transactionId}`)}
    `))

    // Notify seller
    await send(sellerEmail, `Payment secured for your ${year} ${make} ${model}`, layout(`
      ${h1('Payment in escrow')}
      ${p(`Hi ${sellerName}, the buyer's payment for your listing has been received and is held in escrow.`)}
      ${vehicleCard(year, make, model, amount)}
      ${p('Funds will be released to you once the buyer confirms receipt of the vehicle.')}
      ${btn('View Transaction', `${FRONTEND_URL}/transactions/${transactionId}`)}
    `))
  },

  async sendTransactionCompleted(
    buyerEmail: string,
    buyerName: string,
    sellerEmail: string,
    sellerName: string,
    year: number,
    make: string,
    model: string,
    amount: string,
    transactionId: string
  ) {
    await send(buyerEmail, `Sale complete — ${year} ${make} ${model}`, layout(`
      ${h1('Congratulations!')}
      ${p(`Hi ${buyerName}, the sale is complete. You are now the owner of the ${year} ${make} ${model}.`)}
      ${vehicleCard(year, make, model, amount)}
      ${btn('View Transaction', `${FRONTEND_URL}/transactions/${transactionId}`)}
    `))

    await send(sellerEmail, `Sale complete — funds released`, layout(`
      ${h1('Sale complete')}
      ${p(`Hi ${sellerName}, the sale of your ${year} ${make} ${model} is complete and funds have been released.`)}
      ${vehicleCard(year, make, model, amount)}
      ${p('Your dealer subscription rebate has been credited. Check your dashboard for the updated balance.')}
      ${btn('View Dashboard', `${FRONTEND_URL}/dashboard`)}
    `))
  },

  async sendTransactionCancelled(
    to: string,
    recipientName: string,
    year: number,
    make: string,
    model: string,
    isRefunded: boolean,
    transactionId: string
  ) {
    const subject = isRefunded
      ? `Transaction refunded — ${year} ${make} ${model}`
      : `Transaction cancelled — ${year} ${make} ${model}`

    await send(to, subject, layout(`
      ${h1(isRefunded ? 'Your payment has been refunded' : 'Transaction cancelled')}
      ${p(`Hi ${recipientName}, the transaction for the ${year} ${make} ${model} has been ${isRefunded ? 'cancelled and your payment refunded' : 'cancelled'}.`)}
      ${isRefunded ? p('Refunds typically take 5–10 business days to appear on your statement.') : ''}
      ${btn('Browse Vehicles', `${FRONTEND_URL}/vehicles`)}
    `))
  },
}
