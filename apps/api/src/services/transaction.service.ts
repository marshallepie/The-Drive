import Stripe from 'stripe'
import { pool } from '../db/config'
import { SubscriptionService } from './subscription.service'
import { EmailService } from './email.service'

export class TransactionService {

  private static getStripe() {
    if (!process.env.STRIPE_SECRET_KEY) return null
    return new Stripe(process.env.STRIPE_SECRET_KEY)
  }

  static async initiate(buyerId: string, vehicleId: string, frontendUrl: string) {
    // Load vehicle, seller, and buyer
    const vehicleRes = await pool.query(
      `SELECT v.id, v.make, v.model, v.year, v.price, v.currency, v.status, v.seller_id,
              u.email AS seller_email, u.first_name AS seller_first_name, u.last_name AS seller_last_name,
              u.dealership_name AS seller_dealership_name
       FROM vehicles v
       JOIN users u ON u.id = v.seller_id
       WHERE v.id = $1`,
      [vehicleId]
    )
    if (vehicleRes.rows.length === 0) throw new Error('Vehicle not found')

    const vehicle = vehicleRes.rows[0]
    if (vehicle.status !== 'LIVE') throw new Error('Vehicle is not available for purchase')
    if (vehicle.seller_id === buyerId) throw new Error('Cannot purchase your own listing')

    // Check no active transaction already exists
    const existingRes = await pool.query(
      `SELECT id FROM transactions
       WHERE vehicle_id = $1 AND status IN ('INITIATED','PENDING','ESCROWED')
       LIMIT 1`,
      [vehicleId]
    )
    if (existingRes.rows.length > 0) throw new Error('A transaction for this vehicle is already in progress')

    const stripe = this.getStripe()
    const amountPence = Math.round(parseFloat(vehicle.price) * 100)
    const testMode = !stripe

    let paymentIntentId: string | null = null
    let clientSecret: string | null = null

    if (stripe) {
      const intent = await stripe.paymentIntents.create({
        amount: amountPence,
        currency: vehicle.currency.toLowerCase(),
        metadata: { vehicleId, buyerId, sellerId: vehicle.seller_id },
        description: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      })
      paymentIntentId = intent.id
      clientSecret = intent.client_secret
    }

    const txRes = await pool.query(
      `INSERT INTO transactions
         (vehicle_id, buyer_id, seller_id, amount, currency, payment_mode, status,
          stripe_payment_intent_id, escrow_conditions, completed_conditions)
       VALUES ($1, $2, $3, $4, $5, 'FIAT', 'INITIATED', $6,
               ARRAY['BUYER_CONFIRMED']::escrow_condition[],
               ARRAY[]::escrow_condition[])
       RETURNING id`,
      [vehicleId, buyerId, vehicle.seller_id, vehicle.price, vehicle.currency, paymentIntentId]
    )

    const transactionId = txRes.rows[0].id

    await this.auditLog(buyerId, 'transactions', transactionId, 'INITIATED', {
      vehicleId, amount: vehicle.price, currency: vehicle.currency,
    })

    // Notify seller
    const buyerRes = await pool.query(
      `SELECT first_name, last_name FROM users WHERE id = $1`, [buyerId]
    )
    const buyer = buyerRes.rows[0]
    if (buyer) {
      const sellerName = vehicle.seller_dealership_name ||
        `${vehicle.seller_first_name} ${vehicle.seller_last_name}`
      const buyerName = `${buyer.first_name} ${buyer.last_name}`
      const formattedAmount = new Intl.NumberFormat('en-GB', {
        style: 'currency', currency: vehicle.currency,
      }).format(parseFloat(vehicle.price))
      EmailService.sendTransactionInitiated(
        vehicle.seller_email, sellerName, buyerName,
        vehicle.year, vehicle.make, vehicle.model, formattedAmount, transactionId
      ).catch(() => {})
    }

    return { transactionId, clientSecret, testMode, frontendUrl }
  }

  static async getTransaction(transactionId: string, userId: string) {
    const res = await pool.query(
      `SELECT t.*,
              v.make, v.model, v.year, v.images,
              b.first_name AS buyer_first_name, b.last_name AS buyer_last_name, b.email AS buyer_email,
              s.first_name AS seller_first_name, s.last_name AS seller_last_name, s.email AS seller_email,
              s.dealership_name AS seller_dealership_name
       FROM transactions t
       JOIN vehicles v ON v.id = t.vehicle_id
       JOIN users b ON b.id = t.buyer_id
       JOIN users s ON s.id = t.seller_id
       WHERE t.id = $1 AND (t.buyer_id = $2 OR t.seller_id = $2)`,
      [transactionId, userId]
    )
    return res.rows[0] || null
  }

  static async getUserTransactions(userId: string) {
    const res = await pool.query(
      `SELECT t.id, t.status, t.amount, t.currency, t.payment_mode, t.created_at, t.completed_at,
              v.make, v.model, v.year, v.images,
              CASE WHEN t.buyer_id = $1 THEN 'buyer' ELSE 'seller' END AS role
       FROM transactions t
       JOIN vehicles v ON v.id = t.vehicle_id
       WHERE t.buyer_id = $1 OR t.seller_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    )
    return res.rows
  }

  static async activateFromWebhook(paymentIntentId: string) {
    const res = await pool.query(
      `UPDATE transactions SET status = 'ESCROWED', updated_at = NOW()
       WHERE stripe_payment_intent_id = $1 AND status = 'INITIATED'
       RETURNING id, buyer_id, seller_id, vehicle_id, amount, currency`,
      [paymentIntentId]
    )
    if (res.rows.length === 0) return
    const tx = res.rows[0]
    await this.auditLog(tx.buyer_id, 'transactions', tx.id, 'ESCROWED', { paymentIntentId })

    // Send escrow notifications
    const peopleRes = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.dealership_name,
              v.make, v.model, v.year
       FROM users u, vehicles v
       WHERE u.id IN ($1, $2) AND v.id = $3`,
      [tx.buyer_id, tx.seller_id, tx.vehicle_id]
    )
    const buyer = peopleRes.rows.find((r: any) => r.id === tx.buyer_id)
    const seller = peopleRes.rows.find((r: any) => r.id === tx.seller_id)
    const vehicle = peopleRes.rows[0]
    if (buyer && seller && vehicle) {
      const amount = new Intl.NumberFormat('en-GB', {
        style: 'currency', currency: tx.currency,
      }).format(parseFloat(tx.amount))
      EmailService.sendTransactionEscrowed(
        buyer.email, `${buyer.first_name} ${buyer.last_name}`,
        seller.email, seller.dealership_name || `${seller.first_name} ${seller.last_name}`,
        vehicle.year, vehicle.make, vehicle.model, amount, tx.id
      ).catch(() => {})
    }
  }

  static async confirmReceipt(transactionId: string, buyerId: string) {
    const tx = await this.getTransaction(transactionId, buyerId)
    if (!tx) throw new Error('Transaction not found')
    if (tx.buyer_id !== buyerId) throw new Error('Only the buyer can confirm receipt')
    if (tx.status !== 'ESCROWED' && tx.status !== 'INITIATED') {
      throw new Error(`Cannot confirm from status ${tx.status}`)
    }

    await pool.query(
      `UPDATE transactions
       SET status = 'COMPLETED',
           completed_conditions = ARRAY['BUYER_CONFIRMED']::escrow_condition[],
           completed_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [transactionId]
    )

    // Mark vehicle as SOLD
    await pool.query(
      `UPDATE vehicles SET status = 'SOLD', updated_at = NOW() WHERE id = $1`,
      [tx.vehicle_id]
    )

    // Credit rebate to seller if they are a dealer with an active subscription
    const sellerRes = await pool.query(
      `SELECT role FROM users WHERE id = $1`,
      [tx.seller_id]
    )
    if (sellerRes.rows[0]?.role === 'DEALER') {
      await SubscriptionService.creditRebate(tx.seller_id).catch(() => {})
    }

    await this.auditLog(buyerId, 'transactions', transactionId, 'COMPLETED', {
      vehicleId: tx.vehicle_id,
    })

    // Send completion emails
    const amount = new Intl.NumberFormat('en-GB', {
      style: 'currency', currency: tx.currency,
    }).format(parseFloat(tx.amount))
    EmailService.sendTransactionCompleted(
      tx.buyer_email, `${tx.buyer_first_name} ${tx.buyer_last_name}`,
      tx.seller_email, tx.seller_dealership_name || `${tx.seller_first_name} ${tx.seller_last_name}`,
      tx.year, tx.make, tx.model, amount, transactionId
    ).catch(() => {})
  }

  static async cancelTransaction(transactionId: string, userId: string) {
    const tx = await this.getTransaction(transactionId, userId)
    if (!tx) throw new Error('Transaction not found')
    if (!['INITIATED', 'ESCROWED'].includes(tx.status)) {
      throw new Error(`Cannot cancel from status ${tx.status}`)
    }

    // Refund if escrowed
    const stripe = this.getStripe()
    if (stripe && tx.status === 'ESCROWED' && tx.stripe_payment_intent_id) {
      await stripe.refunds.create({ payment_intent: tx.stripe_payment_intent_id })
    }

    const newStatus = tx.status === 'ESCROWED' ? 'REFUNDED' : 'CANCELLED'
    await pool.query(
      `UPDATE transactions SET status = $1, updated_at = NOW() WHERE id = $2`,
      [newStatus, transactionId]
    )

    await this.auditLog(userId, 'transactions', transactionId, newStatus, {})

    // Notify both parties
    const amount = new Intl.NumberFormat('en-GB', {
      style: 'currency', currency: tx.currency,
    }).format(parseFloat(tx.amount))
    const isRefunded = newStatus === 'REFUNDED'
    EmailService.sendTransactionCancelled(
      tx.buyer_email, `${tx.buyer_first_name} ${tx.buyer_last_name}`,
      tx.year, tx.make, tx.model, isRefunded, transactionId
    ).catch(() => {})
    EmailService.sendTransactionCancelled(
      tx.seller_email, tx.seller_dealership_name || `${tx.seller_first_name} ${tx.seller_last_name}`,
      tx.year, tx.make, tx.model, false, transactionId
    ).catch(() => {})
  }

  private static async auditLog(
    userId: string,
    entityType: string,
    entityId: string,
    action: string,
    changes: Record<string, unknown>
  ) {
    await pool.query(
      `INSERT INTO audit_logs (user_id, entity_type, entity_id, action, changes)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, entityType, entityId, action, JSON.stringify(changes)]
    ).catch(() => {})
  }
}
