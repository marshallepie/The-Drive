import { pool } from '../db/config'

export class MessageService {

  static async getConversations(userId: string) {
    const result = await pool.query(
      `SELECT
         c.id,
         c.vehicle_id,
         c.participant_ids,
         c.created_at,
         c.updated_at,
         -- latest message
         lm.content    AS last_message,
         lm.created_at AS last_message_at,
         lm.sender_id  AS last_sender_id,
         -- vehicle info
         v.make, v.model, v.year,
         -- unread count for this user
         (
           SELECT COUNT(*) FROM messages m2
           WHERE m2.conversation_id = c.id
             AND m2.sender_id != $1
             AND m2.status != 'READ'
         ) AS unread_count,
         -- other participant info
         u.id          AS other_user_id,
         u.first_name  AS other_first_name,
         u.last_name   AS other_last_name,
         u.role        AS other_role,
         u.dealership_name AS other_dealership_name
       FROM conversations c
       LEFT JOIN LATERAL (
         SELECT content, created_at, sender_id FROM messages
         WHERE conversation_id = c.id
         ORDER BY created_at DESC
         LIMIT 1
       ) lm ON true
       LEFT JOIN vehicles v ON v.id = c.vehicle_id
       -- join the other participant (not $1)
       LEFT JOIN users u ON u.id = (
         SELECT pid FROM unnest(c.participant_ids) AS pid
         WHERE pid != $1
         LIMIT 1
       )
       WHERE $1 = ANY(c.participant_ids)
       ORDER BY COALESCE(lm.created_at, c.created_at) DESC`,
      [userId]
    )
    return result.rows
  }

  static async getOrCreateConversation(
    userId: string,
    otherUserId: string,
    vehicleId?: string
  ) {
    // Find existing conversation between the two participants (optionally for the same vehicle)
    const findQuery = vehicleId
      ? `SELECT id FROM conversations
         WHERE participant_ids @> ARRAY[$1::uuid, $2::uuid]
           AND vehicle_id = $3
         LIMIT 1`
      : `SELECT id FROM conversations
         WHERE participant_ids @> ARRAY[$1::uuid, $2::uuid]
         LIMIT 1`

    const findParams = vehicleId ? [userId, otherUserId, vehicleId] : [userId, otherUserId]
    const existing = await pool.query(findQuery, findParams)

    if (existing.rows.length > 0) return existing.rows[0].id

    const created = await pool.query(
      `INSERT INTO conversations (participant_ids, vehicle_id)
       VALUES (ARRAY[$1::uuid, $2::uuid], $3)
       RETURNING id`,
      [userId, otherUserId, vehicleId ?? null]
    )
    return created.rows[0].id
  }

  static async getMessages(
    conversationId: string,
    userId: string,
    page = 1,
    limit = 50
  ) {
    // Verify user is a participant
    const check = await pool.query(
      `SELECT id FROM conversations WHERE id = $1 AND $2 = ANY(participant_ids)`,
      [conversationId, userId]
    )
    if (check.rows.length === 0) return null

    const offset = (page - 1) * limit
    const result = await pool.query(
      `SELECT
         m.id, m.conversation_id, m.sender_id, m.content, m.status, m.created_at,
         u.first_name, u.last_name, u.role
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC
       LIMIT $2 OFFSET $3`,
      [conversationId, limit, offset]
    )

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM messages WHERE conversation_id = $1`,
      [conversationId]
    )

    return {
      messages: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
    }
  }

  static async sendMessage(
    conversationId: string,
    senderId: string,
    content: string
  ) {
    const check = await pool.query(
      `SELECT id FROM conversations WHERE id = $1 AND $2 = ANY(participant_ids)`,
      [conversationId, senderId]
    )
    if (check.rows.length === 0) return null

    const result = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, content, status)
       VALUES ($1, $2, $3, 'SENT')
       RETURNING id, conversation_id, sender_id, content, status, created_at`,
      [conversationId, senderId, content]
    )

    // Bump conversation updated_at
    await pool.query(
      `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
      [conversationId]
    )

    return result.rows[0]
  }

  static async markAsRead(conversationId: string, userId: string) {
    await pool.query(
      `UPDATE messages
       SET status = 'READ'
       WHERE conversation_id = $1
         AND sender_id != $2
         AND status != 'READ'`,
      [conversationId, userId]
    )
  }

  static async getUnreadCount(userId: string) {
    const result = await pool.query(
      `SELECT COUNT(*) FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       WHERE $1 = ANY(c.participant_ids)
         AND m.sender_id != $1
         AND m.status != 'READ'`,
      [userId]
    )
    return parseInt(result.rows[0].count)
  }
}
