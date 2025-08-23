export interface AppInfo {
  id: number
  name: string
  version: string
  description: string
}

export interface AnimalType {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

export type Gender = 'MALE' | 'FEMALE' | 'CASTRATED' | 'UNKNOWN'

export interface Animal {
  id: number
  tagNumber?: string
  name: string
  breed?: string
  gender: Gender
  dateOfBirth?: string
  weight?: number
  height?: number
  acquisitionDate?: string
  acquisitionLocation?: string
  exitDate?: string
  exitReason?: string
  age?: number | null
  type_id: number
  description: string
  image?: string
  created_at: string
  updated_at: string
  type?: AnimalType
}
