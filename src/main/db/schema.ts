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
        FOREIGN KEY (type_id) REFERENCES animal_types(id) ON DELETE CASCADE
      )
    `)

  // Add image column to animals table if it doesn't exist
  try {
    const tableInfo = db.prepare('PRAGMA table_info(animals)').all() as Array<{ name: string }>
    const hasImageColumn = tableInfo.some((column) => column.name === 'image')

    if (!hasImageColumn) {
      db.exec('ALTER TABLE animals ADD COLUMN image TEXT')
    }
  } catch (error) {
    console.error('Error checking/adding image column:', error)
  }

  // Migration: ensure animals.age is nullable (drop NOT NULL if present)
  try {
    const tableInfo = db.prepare('PRAGMA table_info(animals)').all() as Array<{
      name: string
      notnull: number
    }>
    const ageCol = tableInfo.find((c) => c.name === 'age')
    if (ageCol && ageCol.notnull === 1) {
      db.exec('BEGIN TRANSACTION')
      db.exec(`
          CREATE TABLE IF NOT EXISTS animals_new (
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
            FOREIGN KEY (type_id) REFERENCES animal_types(id) ON DELETE CASCADE
          );
        `)
      db.exec(`
          INSERT INTO animals_new (
            id, tag_number, name, breed, gender, date_of_birth, weight, height,
            acquisition_date, acquisition_location, exit_date, exit_reason, age,
            type_id, description, image, created_at, updated_at
          )
          SELECT 
            id, tag_number, name, breed, gender, date_of_birth, weight, height,
            acquisition_date, acquisition_location, exit_date, exit_reason, age,
            type_id, description, image, created_at, updated_at
          FROM animals;
        `)
      db.exec('DROP TABLE animals')
      db.exec('ALTER TABLE animals_new RENAME TO animals')
      db.exec('COMMIT')
    }
  } catch (error) {
    console.error('Error migrating animals.age to nullable:', error)
    try {
      db.exec('ROLLBACK')
    } catch (rollbackErr) {
      console.warn('Rollback failed after migration error:', rollbackErr)
    }
  }

  // Create app_info table if it doesn't exist
  db.exec(`
      CREATE TABLE IF NOT EXISTS app_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        version TEXT NOT NULL,
        description TEXT
      )
    `)

  // Insert default app info if not exists
  const count = db.prepare('SELECT COUNT(*) as count FROM app_info').get() as { count: number }
  if (count.count === 0) {
    db.prepare(
      `
        INSERT INTO app_info (name, version, description)
        VALUES (?, ?, ?)
      `
    ).run('Vite Electron App', app.getVersion(), 'A Vite + Electron application')
  }
}
