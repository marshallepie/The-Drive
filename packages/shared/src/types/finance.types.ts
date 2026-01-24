export enum FinanceApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  PAID_OFF = 'PAID_OFF',
  DEFAULTED = 'DEFAULTED',
  CANCELLED = 'CANCELLED',
}

export interface FinanceApplication {
  id: string
  userId: string
  vehicleId: string
  status: FinanceApplicationStatus
  requestedAmount: number
  downPayment: number
  loanTerm: number
  employmentStatus: string
  annualIncome: number
  creditScore?: number
  reviewedBy?: string
  reviewNotes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Loan {
  id: string
  applicationId: string
  userId: string
  vehicleId: string
  principal: number
  interestRate: number
  termMonths: number
  monthlyPayment: number
  remainingBalance: number
  status: LoanStatus
  startDate: Date
  endDate: Date
  nextPaymentDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface LoanPayment {
  id: string
  loanId: string
  amount: number
  principal: number
  interest: number
  paymentDate: Date
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
}

export interface FinanceApplicationRequest {
  vehicleId: string
  requestedAmount: number
  downPayment: number
  loanTerm: number
  employmentStatus: string
  annualIncome: number
}

export interface ReviewFinanceApplicationRequest {
  applicationId: string
  approved: boolean
  notes?: string
  interestRate?: number
}
