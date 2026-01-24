export enum VehicleStatus {
  DRAFT = 'DRAFT',
  LIVE = 'LIVE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
  ARCHIVED = 'ARCHIVED',
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
  SEMI_AUTOMATIC = 'SEMI_AUTOMATIC',
}

export interface Vehicle {
  id: string
  sellerId: string
  status: VehicleStatus
  make: string
  model: string
  year: number
  vin: string
  condition: VehicleCondition
  mileage: number
  price: number
  currency: string
  fuelType: FuelType
  transmission: TransmissionType
  engineSize?: string
  color: string
  description: string
  features: string[]
  images: string[]
  location: {
    city: string
    state: string
    country: string
    zipCode: string
  }
  createdAt: Date
  updatedAt: Date
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
  maxMileage?: number
  location?: string
  page?: number
  limit?: number
  sortBy?: 'price' | 'year' | 'mileage' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface VehicleListResponse {
  vehicles: Vehicle[]
  total: number
  page: number
  limit: number
  totalPages: number
}
