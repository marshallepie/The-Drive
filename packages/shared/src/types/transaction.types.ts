export enum PaymentMode {
  FIAT = 'FIAT',
  WEB3 = 'WEB3',
}

export enum TransactionStatus {
  INITIATED = 'INITIATED',
  PENDING = 'PENDING',
  ESCROWED = 'ESCROWED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export enum EscrowCondition {
  INSPECTION_PASSED = 'INSPECTION_PASSED',
  DOCUMENTS_VERIFIED = 'DOCUMENTS_VERIFIED',
  BUYER_CONFIRMED = 'BUYER_CONFIRMED',
  SELLER_CONFIRMED = 'SELLER_CONFIRMED',
}

export interface Transaction {
  id: string
  vehicleId: string
  buyerId: string
  sellerId: string
  amount: number
  currency: string
  paymentMode: PaymentMode
  status: TransactionStatus
  escrowConditions: EscrowCondition[]
  completedConditions: EscrowCondition[]
  stripePaymentIntentId?: string
  web3TransactionHash?: string
  web3ContractAddress?: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface InitiateTransactionRequest {
  vehicleId: string
  paymentMode: PaymentMode
  walletAddress?: string
}

export interface ConfirmTransactionRequest {
  transactionId: string
  condition: EscrowCondition
  proof?: string
}
