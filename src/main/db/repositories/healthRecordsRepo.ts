import type { AnimalHealthRecord, HealthRecordType } from '../models'
import { getDb } from '../connection'

export async function getHealthRecordsByAnimalId(animalId: number): Promise<AnimalHealthRecord[]> {
  const db = getDb()
  const rows = db
    .prepare(
      `
      SELECT * FROM animal_health_records 
      WHERE animal_id = ? 
      ORDER BY date DESC, created_at DESC
      `
    )
    .all(animalId) as AnimalHealthRecord[]
  
  return rows
}

export async function getHealthRecordsByType(animalId: number, recordType: HealthRecordType): Promise<AnimalHealthRecord[]> {
  const db = getDb()
  const rows = db
    .prepare(
      `
      SELECT * FROM animal_health_records 
      WHERE animal_id = ? AND record_type = ?
      ORDER BY date DESC, created_at DESC
      `
    )
    .all(animalId, recordType) as AnimalHealthRecord[]
  
  return rows
}

export async function createHealthRecord(data: Omit<AnimalHealthRecord, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  const db = getDb()
  const now = new Date().toISOString()
  
  const stmt = db.prepare(
    `
    INSERT INTO animal_health_records (
      animal_id, record_type, date, expected_delivery_date, notes, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `
  )

  const result = stmt.run(
    data.animal_id,
    data.record_type,
    data.date,
    data.expected_delivery_date || null,
    data.notes || null,
    now,
    now
  )

  return result.lastInsertRowid as number
}

export async function updateHealthRecord(
  id: number,
  data: Partial<Omit<AnimalHealthRecord, 'id' | 'animal_id' | 'created_at' | 'updated_at'>>
): Promise<AnimalHealthRecord | undefined> {
  const db = getDb()
  const now = new Date().toISOString()
  
  const current = await getHealthRecordById(id)
  if (!current) return undefined

  const result = db
    .prepare(
      `
      UPDATE animal_health_records
      SET record_type = ?, date = ?, expected_delivery_date = ?, notes = ?, updated_at = ?
      WHERE id = ?
      RETURNING *
      `
    )
    .get(
      data.record_type ?? current.record_type,
      data.date ?? current.date,
      data.expected_delivery_date ?? current.expected_delivery_date,
      data.notes ?? current.notes,
      now,
      id
    ) as AnimalHealthRecord | undefined

  return result
}

export async function deleteHealthRecord(id: number): Promise<void> {
  const db = getDb()
  db.prepare('DELETE FROM animal_health_records WHERE id = ?').run(id)
}

export async function getHealthRecordById(id: number): Promise<AnimalHealthRecord | undefined> {
  const db = getDb()
  const row = db
    .prepare('SELECT * FROM animal_health_records WHERE id = ?')
    .get(id) as AnimalHealthRecord | undefined
  
  return row
}

export async function getUpcomingEvents(): Promise<(AnimalHealthRecord & { animal_name: string })[]> {
  const db = getDb()
  const today = new Date().toISOString().split('T')[0]
  
  const rows = db
    .prepare(
      `
      SELECT 
        ahr.*,
        a.name as animal_name
      FROM animal_health_records ahr
      JOIN animals a ON ahr.animal_id = a.id
      WHERE 
        (ahr.record_type = 'insemination' AND ahr.expected_delivery_date IS NOT NULL AND ahr.expected_delivery_date >= ?)
        OR (ahr.record_type = 'deworming' AND ahr.date >= ?)
      ORDER BY 
        CASE 
          WHEN ahr.record_type = 'insemination' THEN ahr.expected_delivery_date
          ELSE ahr.date
        END ASC
      LIMIT 10
      `
    )
    .all(today, today) as (AnimalHealthRecord & { animal_name: string })[]
  
  return rows
}