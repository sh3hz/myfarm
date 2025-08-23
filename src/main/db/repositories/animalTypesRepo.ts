import type { AnimalType } from '../../db/models'
import { getDb } from '../connection'

export async function getAll(): Promise<AnimalType[]> {
  const db = getDb()
  return db.prepare('SELECT * FROM animal_types ORDER BY name').all() as AnimalType[]
}

export async function getById(id: number): Promise<AnimalType | undefined> {
  const db = getDb()
  return db.prepare('SELECT * FROM animal_types WHERE id = ?').get(id) as AnimalType | undefined
}

export async function create(name: string, description: string): Promise<AnimalType> {
  const db = getDb()
  const row = db
    .prepare('INSERT INTO animal_types (name, description) VALUES (?, ?) RETURNING *')
    .get(name, description) as AnimalType
  return row
}

export async function update(
  id: number,
  name: string,
  description: string
): Promise<AnimalType | undefined> {
  const db = getDb()
  const now = new Date().toISOString()
  const row = db
    .prepare(
      'UPDATE animal_types SET name = ?, description = ?, updated_at = ? WHERE id = ? RETURNING *'
    )
    .get(name, description, now, id) as AnimalType | undefined
  return row
}

export async function remove(id: number): Promise<void> {
  const db = getDb()
  db.prepare('DELETE FROM animal_types WHERE id = ?').run(id)
}
