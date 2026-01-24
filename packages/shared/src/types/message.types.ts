export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  status: MessageStatus
  createdAt: Date
  updatedAt: Date
}

export interface Conversation {
  id: string
  participantIds: string[]
  vehicleId?: string
  lastMessage?: Message
  unreadCount: number
  createdAt: Date
  updatedAt: Date
}

export interface SendMessageRequest {
  conversationId: string
  content: string
}

export interface CreateConversationRequest {
  participantId: string
  vehicleId?: string
  initialMessage: string
}
