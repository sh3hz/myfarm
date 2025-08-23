import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'

let instance: Database.Database | null = null

export function getDb(): Database.Database {
  if (instance) return instance
  const dbPath = path.join(app.getPath('userData'), 'app.db')
  instance = new Database(dbPath)
  // Ensure foreign key constraints are enforced
  instance.pragma('foreign_keys = ON')
  return instance
}
