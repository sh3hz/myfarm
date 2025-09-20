import type { MilkProduction } from '../models'
import { getDb } from '../connection'

export async function getAll(): Promise<MilkProduction[]> {
  const db = getDb()
  const rows = db
    .prepare(
      `
      SELECT * FROM milk_production
      ORDER BY date DESC, animal_id
    `
    )
    .all() as MilkProduction[]
  
  return rows
}

export async function getByAnimalId(animalId: number): Promise<MilkProduction[]> {
  const db = getDb()
  const rows = db
    .prepare(
      `
      SELECT * FROM milk_production
      WHERE animal_id = ?
      ORDER BY date DESC
    `
    )
    .all(animalId) as MilkProduction[]
  
  return rows
}

export async function getByDateRange(startDate: string, endDate: string): Promise<MilkProduction[]> {
  const db = getDb()
  const rows = db
    .prepare(
      `
      SELECT mp.*, a.name as animal_name
      FROM milk_production mp
      LEFT JOIN animals a ON mp.animal_id = a.id
      WHERE mp.date BETWEEN ? AND ?
      ORDER BY mp.date DESC, a.name
    `
    )
    .all(startDate, endDate) as (MilkProduction & { animal_name: string })[]
  
  return rows
}

export async function getById(id: number): Promise<MilkProduction | undefined> {
  const db = getDb()
  const row = db
    .prepare('SELECT * FROM milk_production WHERE id = ?')
    .get(id) as MilkProduction | undefined
  
  return row
}

export async function create(data: Omit<MilkProduction, 'id' | 'total_amount' | 'created_at' | 'updated_at'>): Promise<number> {
  const db = getDb()
  const now = new Date().toISOString()
  
  const stmt = db.prepare(
    `
    INSERT INTO milk_production (
      animal_id, date, morning_amount, evening_amount, notes, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `
  )

  const result = stmt.run(
    data.animal_id,
    data.date,
    data.morning_amount,
    data.evening_amount,
    data.notes,
    now,
    now
  )

  return result.lastInsertRowid as number
}

export async function update(
  id: number,
  data: Partial<Omit<MilkProduction, 'id' | 'total_amount' | 'created_at' | 'updated_at'>>
): Promise<MilkProduction | undefined> {
  const db = getDb()
  const now = new Date().toISOString()
  const current = await getById(id)
  if (!current) return undefined

  const stmt = db.prepare(
    `
    UPDATE milk_production
    SET animal_id = ?, date = ?, morning_amount = ?, evening_amount = ?, notes = ?, updated_at = ?
    WHERE id = ?
  `
  )

  stmt.run(
    data.animal_id ?? current.animal_id,
    data.date ?? current.date,
    data.morning_amount ?? current.morning_amount,
    data.evening_amount ?? current.evening_amount,
    data.notes ?? current.notes,
    now,
    id
  )

  return getById(id)
}

export async function remove(id: number): Promise<void> {
  const db = getDb()
  db.prepare('DELETE FROM milk_production WHERE id = ?').run(id)
}

export async function getProductionStats(animalId?: number): Promise<{
  totalRecords: number
  totalProduction: number
  averageDaily: number
  lastWeekProduction: number
}> {
  const db = getDb()
  
  const whereClause = animalId ? 'WHERE animal_id = ?' : ''
  const params = animalId ? [animalId] : []
  
  const row = db
    .prepare(
      `
      SELECT 
        COUNT(*) as totalRecords,
        COALESCE(SUM(total_amount), 0) as totalProduction,
        COALESCE(AVG(total_amount), 0) as averageDaily,
        COALESCE(
          (SELECT SUM(total_amount) 
           FROM milk_production 
           WHERE date >= date('now', '-7 days') ${animalId ? 'AND animal_id = ?' : ''}), 
          0
        ) as lastWeekProduction
      FROM milk_production
      ${whereClause}
    `
    )
    .get(animalId ? [...params, animalId] : params) as {
    totalRecords: number
    totalProduction: number
    averageDaily: number
    lastWeekProduction: number
  } | undefined

  return {
    totalRecords: row?.totalRecords ?? 0,
    totalProduction: row?.totalProduction ?? 0,
    averageDaily: row?.averageDaily ?? 0,
    lastWeekProduction: row?.lastWeekProduction ?? 0
  }
}

export async function getChartData(animalId?: number, days: number = 30): Promise<Array<{
  date: string
  total: number
  morning: number
  evening: number
}>> {
  const db = getDb()
  
  const whereClause = animalId ? 'WHERE animal_id = ?' : ''
  const params = animalId ? [animalId, days] : [days]
  
  const rows = db
    .prepare(
      `
      SELECT 
        date,
        SUM(total_amount) as total,
        SUM(morning_amount) as morning,
        SUM(evening_amount) as evening
      FROM milk_production
      ${whereClause}
      ${animalId ? 'AND' : 'WHERE'} date >= date('now', '-' || ? || ' days')
      GROUP BY date
      ORDER BY date ASC
    `
    )
    .all(...params) as Array<{
    date: string
    total: number
    morning: number
    evening: number
  }>

  return rows
}