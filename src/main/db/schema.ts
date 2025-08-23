import type Database from 'better-sqlite3'
import { app } from 'electron'

export function initDatabase(db: Database.Database): void {
  // Create animal_types table if it doesn't exist
  db.exec(`
      CREATE TABLE IF NOT EXISTS animal_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

  // Create animals table if it doesn't exist
  db.exec(`
      CREATE TABLE IF NOT EXISTS animals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag_number TEXT,
        name TEXT NOT NULL,
        breed TEXT,
        gender TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK(gender IN ('MALE', 'FEMALE', 'CASTRATED', 'UNKNOWN')),
        date_of_birth TEXT,
        weight REAL,
        height REAL,
        acquisition_date TEXT,
        acquisition_location TEXT,
        exit_date TEXT,
        exit_reason TEXT,
        age INTEGER,
        type_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (type_id) REFERENCES animal_types(id)
      )
    `)

  // Basic index for common lookup
  db.exec(`CREATE INDEX IF NOT EXISTS idx_animals_type_id ON animals(type_id)`)

  // Create app_info table if it doesn't exist
  db.exec(`
      CREATE TABLE IF NOT EXISTS app_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        version TEXT NOT NULL,
        description TEXT
      )
    `)

  // Insert default app info atomically if table is empty
  db.prepare(
    `
      INSERT INTO app_info (name, version, description)
      SELECT ?, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM app_info)
    `
  ).run('Vite Electron App', app.getVersion(), 'A Vite + Electron application')
}
