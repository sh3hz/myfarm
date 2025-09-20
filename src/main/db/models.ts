import type Database from 'better-sqlite3'

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

export interface AnimalDocument {
  id: number
  animal_id: number
  filename: string
  original_name: string
  file_path?: string
  file_size?: number
  mime_type?: string
  created_at: string
}

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
  documents?: string[]
  created_at: string
  updated_at: string
  type?: AnimalType
}

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: number
  type: TransactionType
  name: string
  amount: number
  date: string
  created_at: string
  updated_at: string
}

export interface CashflowSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  transactionCount: number
}

export type HealthRecordType = 'insemination' | 'deworming'

export interface AnimalHealthRecord {
  id: number
  animal_id: number
  record_type: HealthRecordType
  date: string
  expected_delivery_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface MilkProduction {
  id: number
  animal_id: number
  date: string
  morning_amount: number
  evening_amount: number
  total_amount: number
  notes?: string
  created_at: string
  updated_at: string
}

export type SqliteDatabase = Database.Database
