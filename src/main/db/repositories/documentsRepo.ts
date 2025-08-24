import type { AnimalDocument } from '../models'
import { getDb } from '../connection'

export async function getDocumentsByAnimalId(animalId: number): Promise<string[]> {
  const db = getDb()
  const rows = db
    .prepare('SELECT filename FROM animal_documents WHERE animal_id = ? ORDER BY created_at ASC')
    .all(animalId) as Array<{ filename: string }>
  
  return rows.map(row => row.filename)
}

export async function addDocument(animalId: number, filename: string, originalName: string, filePath?: string, fileSize?: number, mimeType?: string): Promise<void> {
  const db = getDb()
  const now = new Date().toISOString()
  
  db.prepare(`
    INSERT INTO animal_documents (animal_id, filename, original_name, file_path, file_size, mime_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(animalId, filename, originalName, filePath, fileSize, mimeType, now)
}

export async function removeDocument(animalId: number, filename: string): Promise<void> {
  const db = getDb()
  db.prepare('DELETE FROM animal_documents WHERE animal_id = ? AND filename = ?').run(animalId, filename)
}

export async function removeAllDocuments(animalId: number): Promise<void> {
  const db = getDb()
  db.prepare('DELETE FROM animal_documents WHERE animal_id = ?').run(animalId)
}

export async function getDocumentDetails(animalId: number, filename: string): Promise<AnimalDocument | undefined> {
  const db = getDb()
  const row = db
    .prepare('SELECT * FROM animal_documents WHERE animal_id = ? AND filename = ?')
    .get(animalId, filename) as AnimalDocument | undefined
  
  return row
}