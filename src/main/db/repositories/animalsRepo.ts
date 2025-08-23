import type { Animal } from '../../db/models'
import { getDb } from '../connection'
import { mapAnimalRow } from '../mappers'

export async function getAll(): Promise<Animal[]> {
  const db = getDb()
  const rows = db
    .prepare(
      `
      SELECT 
        a.*, 
        at.name as type_name, 
        at.description as type_description
      FROM animals a
      LEFT JOIN animal_types at ON a.type_id = at.id
    `
    )
    .all()
  return rows.map(mapAnimalRow)
}

export async function getById(id: number): Promise<Animal | undefined> {
  const db = getDb()
  const row = db
    .prepare(
      `
      SELECT 
        a.*, 
        at.name as type_name, 
        at.description as type_description
      FROM animals a
      LEFT JOIN animal_types at ON a.type_id = at.id
      WHERE a.id = ?
    `
    )
    .get(id)
  if (!row) return undefined
  return mapAnimalRow(row)
}

export async function create(data: Omit<Animal, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  const db = getDb()
  const now = new Date().toISOString()
  const stmt = db.prepare(
    `
    INSERT INTO animals (
      name, breed, age, type_id, description, image,
      created_at, updated_at, tag_number, gender,
      date_of_birth, weight, height, acquisition_date,
      acquisition_location, exit_date, exit_reason
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  )

  stmt.run(
    data.name,
    data.breed,
    data.age ?? null,
    data.type_id,
    data.description,
    data.image,
    now,
    now,
    data.tagNumber,
    data.gender,
    data.dateOfBirth,
    data.weight,
    data.height,
    data.acquisitionDate,
    data.acquisitionLocation,
    data.exitDate,
    data.exitReason
  )
}

export async function update(
  id: number,
  data: Partial<Omit<Animal, 'id' | 'created_at' | 'updated_at'>>
): Promise<Animal | undefined> {
  const db = getDb()
  const now = new Date().toISOString()
  const current = await getById(id)
  if (!current) return undefined

  const res = db
    .prepare(
      `
      UPDATE animals
      SET name = ?, breed = ?, age = ?, type_id = ?, description = ?, image = ?,
          tag_number = ?, gender = ?, date_of_birth = ?, weight = ?, height = ?,
          acquisition_date = ?, acquisition_location = ?, exit_date = ?, exit_reason = ?,
          updated_at = ?
      WHERE id = ?
      RETURNING *
    `
    )
    .get(
      data.name ?? current.name,
      data.breed ?? current.breed,
      data.age ?? current.age,
      data.type_id ?? current.type_id,
      data.description ?? current.description,
      data.image ?? current.image,
      data.tagNumber ?? current.tagNumber,
      data.gender ?? current.gender,
      data.dateOfBirth ?? current.dateOfBirth,
      data.weight ?? current.weight,
      data.height ?? current.height,
      data.acquisitionDate ?? current.acquisitionDate,
      data.acquisitionLocation ?? current.acquisitionLocation,
      data.exitDate ?? current.exitDate,
      data.exitReason ?? current.exitReason,
      now,
      id
    ) as { id: number } | undefined

  return res ? getById(res.id) : undefined
}

export async function remove(id: number): Promise<void> {
  const db = getDb()
  db.prepare('DELETE FROM animals WHERE id = ?').run(id)
}

export async function getStats(): Promise<{
  totalTypes: number
  totalAnimals: number
  mostCommonType: string
  mostCommonTypeCount: number
}> {
  const db = getDb()
  const row = db
    .prepare(
      `
      SELECT 
        (SELECT COUNT(DISTINCT type_id) FROM animals) as totalTypes,
        (SELECT COUNT(*) FROM animals) as totalAnimals,
        (SELECT name FROM animal_types WHERE id = (
          SELECT type_id 
          FROM animals 
          GROUP BY type_id 
          ORDER BY COUNT(*) DESC 
          LIMIT 1
        )) as mostCommonType,
        (SELECT COUNT(*) as count 
         FROM animals 
         GROUP BY type_id 
         ORDER BY count DESC 
         LIMIT 1) as mostCommonTypeCount
    `
    )
    .get() as {
    totalTypes: number
    totalAnimals: number
    mostCommonType: string | null
    mostCommonTypeCount: number
  } | undefined

  return {
    totalTypes: row?.totalTypes ?? 0,
    totalAnimals: row?.totalAnimals ?? 0,
    mostCommonType: row?.mostCommonType ?? 'None',
    mostCommonTypeCount: row?.mostCommonTypeCount ?? 0
  }
}

export async function getTypeCounts(): Promise<Array<{ name: string; count: number }>> {
  const db = getDb()
  const rows = db
    .prepare(
      `
      SELECT at.name AS name, COUNT(a.id) AS count
      FROM animal_types at
      LEFT JOIN animals a ON a.type_id = at.id
      GROUP BY at.id, at.name
      ORDER BY count DESC, at.name ASC
    `
    )
    .all() as Array<{ name: string; count: number }>

  return rows.map((r) => ({ name: r.name, count: Number(r.count) }))
}
