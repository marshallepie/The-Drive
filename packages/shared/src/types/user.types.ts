export enum UserRole {
  PUBLIC = 'PUBLIC',
  DEALER = 'DEALER',
  BANKER = 'BANKER',
  ADMIN = 'ADMIN',
}

export enum KYCStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
  phone?: string
  walletAddress?: string
  kycStatus: KYCStatus
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile extends User {
  dealershipName?: string
  dealershipLicense?: string
  bankInstitution?: string
  bio?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData extends LoginCredentials {
  firstName: string
  lastName: string
  role: UserRole
  phone?: string
}

export interface WalletAuthPayload {
  walletAddress: string
  signature: string
  message: string
}
