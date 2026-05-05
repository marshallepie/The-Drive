import { Router, Response } from 'express'
import Joi from 'joi'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { MessageService } from '../services/message.service'

const router = Router()

const createConversationSchema = Joi.object({
  otherUserId: Joi.string().uuid().required(),
  vehicleId: Joi.string().uuid().optional(),
})

const sendMessageSchema = Joi.object({
  content: Joi.string().trim().min(1).max(5000).required(),
})

// GET /api/v1/messages/conversations
router.get('/conversations', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await MessageService.getConversations(req.user!.id)
    res.json({ status: 'success', data: { conversations } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'error', message: 'Failed to load conversations' })
  }
})

// POST /api/v1/messages/conversations  — find or create
router.post(
  '/conversations',
  authenticate,
  validate(createConversationSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { otherUserId, vehicleId } = req.body
      if (otherUserId === req.user!.id) {
        return res.status(400).json({ status: 'error', message: 'Cannot message yourself' })
      }
      const conversationId = await MessageService.getOrCreateConversation(
        req.user!.id,
        otherUserId,
        vehicleId
      )
      res.json({ status: 'success', data: { conversationId } })
    } catch (err) {
      console.error(err)
      res.status(500).json({ status: 'error', message: 'Failed to create conversation' })
    }
  }
)

// GET /api/v1/messages/conversations/:id
router.get('/conversations/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await MessageService.getMessages(
      req.params.id,
      req.user!.id,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 50
    )
    if (!result) {
      return res.status(403).json({ status: 'error', message: 'Conversation not found or access denied' })
    }
    res.json({ status: 'success', data: result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'error', message: 'Failed to load messages' })
  }
})

// POST /api/v1/messages/conversations/:id/messages
router.post(
  '/conversations/:id/messages',
  authenticate,
  validate(sendMessageSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const message = await MessageService.sendMessage(
        req.params.id,
        req.user!.id,
        req.body.content
      )
      if (!message) {
        return res.status(403).json({ status: 'error', message: 'Conversation not found or access denied' })
      }
      res.status(201).json({ status: 'success', data: { message } })
    } catch (err) {
      console.error(err)
      res.status(500).json({ status: 'error', message: 'Failed to send message' })
    }
  }
)

// PATCH /api/v1/messages/conversations/:id/read
router.patch('/conversations/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await MessageService.markAsRead(req.params.id, req.user!.id)
    res.json({ status: 'success' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'error', message: 'Failed to mark as read' })
  }
})

// GET /api/v1/messages/unread-count
router.get('/unread-count', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const count = await MessageService.getUnreadCount(req.user!.id)
    res.json({ status: 'success', data: { count } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'error', message: 'Failed to get unread count' })
  }
})

export default router
