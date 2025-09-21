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
        father_breed TEXT,
        mother_breed TEXT,
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

  // Create animal_documents table if it doesn't exist
  db.exec(`
      CREATE TABLE IF NOT EXISTS animal_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        animal_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_path TEXT,
        file_size INTEGER,
        mime_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
      )
    `)

  // Index for document lookups
  db.exec(`CREATE INDEX IF NOT EXISTS idx_animal_documents_animal_id ON animal_documents(animal_id)`)

  // Create app_info table if it doesn't exist
  db.exec(`
      CREATE TABLE IF NOT EXISTS app_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        version TEXT NOT NULL,
        description TEXT
      )
    `)

  // Create transactions table if it doesn't exist
  db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        name TEXT NOT NULL,
        amount REAL NOT NULL CHECK(amount > 0),
        date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

  // Index for transaction lookups by type and date
  db.exec(`CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_transactions_type_date ON transactions(type, date)`)

  // Create animal_health_records table for insemination and deworming records
  db.exec(`
      CREATE TABLE IF NOT EXISTS animal_health_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        animal_id INTEGER NOT NULL,
        record_type TEXT NOT NULL CHECK(record_type IN ('insemination', 'deworming')),
        date TEXT NOT NULL,
        expected_delivery_date TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
      )
    `)

  // Index for health record lookups
  db.exec(`CREATE INDEX IF NOT EXISTS idx_animal_health_records_animal_id ON animal_health_records(animal_id)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_animal_health_records_type ON animal_health_records(record_type)`)

  // Create milk_production table
  db.exec(`
      CREATE TABLE IF NOT EXISTS milk_production (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        animal_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        morning_amount REAL DEFAULT 0,
        evening_amount REAL DEFAULT 0,
        total_amount REAL GENERATED ALWAYS AS (morning_amount + evening_amount) STORED,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
      )
    `)

  // Index for milk production lookups
  db.exec(`CREATE INDEX IF NOT EXISTS idx_milk_production_animal_id ON milk_production(animal_id)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_milk_production_date ON milk_production(date)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_milk_production_animal_date ON milk_production(animal_id, date)`)

  // Add father_breed and mother_breed columns if they don't exist (migration)
  try {
    db.exec(`ALTER TABLE animals ADD COLUMN father_breed TEXT`)
  } catch (error) {
    // Column already exists, ignore error
  }
  
  try {
    db.exec(`ALTER TABLE animals ADD COLUMN mother_breed TEXT`)
  } catch (error) {
    // Column already exists, ignore error
  }

  // Insert default app info atomically if table is empty
  db.prepare(
    `
      INSERT INTO app_info (name, version, description)
      SELECT ?, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM app_info)
    `
  ).run('Vite Electron App', app.getVersion(), 'A Vite + Electron application')
}
