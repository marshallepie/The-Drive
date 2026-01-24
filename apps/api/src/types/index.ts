// Shared types for API
// Duplicated from @drive/shared to avoid monorepo build complexity in deployment

export enum UserRole {
  PUBLIC = 'PUBLIC',
  DEALER = 'DEALER',
  BANKER = 'BANKER',
  ADMIN = 'ADMIN',
}

export enum VehicleCondition {
  NEW = 'NEW',
  USED = 'USED',
  CERTIFIED_PRE_OWNED = 'CERTIFIED_PRE_OWNED',
}

export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
  PLUG_IN_HYBRID = 'PLUG_IN_HYBRID',
}

export enum TransmissionType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
  CVT = 'CVT',
  SEMI_AUTOMATIC = 'SEMI_AUTOMATIC',
}

export enum VehicleStatus {
  DRAFT = 'DRAFT',
  LIVE = 'LIVE',
  SOLD = 'SOLD',
  ARCHIVED = 'ARCHIVED',
}

export interface VehicleSearchFilters {
  make?: string
  model?: string
  minYear?: number
  maxYear?: number
  minPrice?: number
  maxPrice?: number
  condition?: VehicleCondition
  fuelType?: FuelType
  transmission?: TransmissionType
  minMileage?: number
  maxMileage?: number
  location?: string
  sellerId?: string
  status?: VehicleStatus
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}
