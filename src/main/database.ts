import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';

export interface AppInfo {
  id: number;
  name: string;
  version: string;
  description: string;
}

export interface AnimalType {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Animal {
  id: number;
  name: string;
  breed: string;
  age: number;
  type_id: number;
  description: string;
  image?: string;
  created_at: string;
  updated_at: string;
  type?: AnimalType;
}

class DatabaseService {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(app.getPath('userData'), 'app.db');
    this.db = new Database(dbPath);
    this.init();
  }

  private init() {
    // Create animal_types table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS animal_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Create animals table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS animals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        breed TEXT,
        age INTEGER,
        type_id INTEGER NOT NULL,
        description TEXT,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (type_id) REFERENCES animal_types(id)
      )
    `);

    // Add image column to animals table if it doesn't exist
    try {
      const tableInfo = this.db.prepare("PRAGMA table_info(animals)").all();
      const hasImageColumn = tableInfo.some((column: any) => column.name === 'image');

      if (!hasImageColumn) {
        this.db.exec('ALTER TABLE animals ADD COLUMN image TEXT');
      }
    } catch (error) {
      console.error('Error checking/adding image column:', error);
    }

    // Create app_info table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS app_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        version TEXT NOT NULL,
        description TEXT
      )
    `);

    // Insert default app info if not exists
    const count = this.db.prepare('SELECT COUNT(*) as count FROM app_info').get() as { count: number };
    if (count.count === 0) {
      this.db.prepare(`
        INSERT INTO app_info (name, version, description)
        VALUES (?, ?, ?)
      `).run('Vite Electron App', app.getVersion(), 'A Vite + Electron application');
    }
  }

  getAppInfo(): AppInfo {
    try {
      const result = this.db.prepare('SELECT * FROM app_info ORDER BY id DESC LIMIT 1').get();
      return result as AppInfo;
    } catch (error) {
      console.error('Database - Error getting app info:', error);
      throw error;
    }
  }

  updateAppInfo(appInfo: Partial<AppInfo>): void {
    const { name, version, description } = appInfo;
    this.db.prepare(`
      UPDATE app_info
      SET name = COALESCE(?, name),
          version = COALESCE(?, version),
          description = COALESCE(?, description)
      WHERE id = (SELECT id FROM app_info ORDER BY id DESC LIMIT 1)
    `).run(name, version, description);
  }

  // Animal Types CRUD operations
  getAllAnimalTypes(): AnimalType[] {
    return this.db.prepare('SELECT * FROM animal_types ORDER BY name').all() as AnimalType[];
  }

  getAnimalTypeById(id: number): AnimalType | undefined {
    return this.db.prepare('SELECT * FROM animal_types WHERE id = ?').get(id) as AnimalType | undefined;
  }

  createAnimalType(name: string, description: string): AnimalType {
    const result = this.db.prepare(
      'INSERT INTO animal_types (name, description) VALUES (?, ?) RETURNING *'
    ).get(name, description) as AnimalType;
    return result;
  }

  updateAnimalType(id: number, name: string, description: string): AnimalType | undefined {
    const now = new Date().toISOString();
    const result = this.db.prepare(
      'UPDATE animal_types SET name = ?, description = ?, updated_at = ? WHERE id = ? RETURNING *'
    ).get(name, description, now, id) as AnimalType | undefined;
    return result;
  }

  deleteAnimalType(id: number): void {
    this.db.prepare('DELETE FROM animal_types WHERE id = ?').run(id);
  }

  // Animals CRUD operations
  getAllAnimals(): Animal[] {
    return this.db.prepare(`
      SELECT animals.*, animal_types.name as type_name, animal_types.description as type_description
      FROM animals
      LEFT JOIN animal_types ON animals.type_id = animal_types.id
      ORDER BY animals.name
    `).all().map((row: any) => ({
      ...row,
      type: row.type_name ? {
        id: row.type_id,
        name: row.type_name,
        description: row.type_description
      } : undefined
    })) as Animal[];
  }

  getAnimalById(id: number): Animal | undefined {
    const animal = this.db.prepare(`
      SELECT animals.*, animal_types.name as type_name, animal_types.description as type_description
      FROM animals
      LEFT JOIN animal_types ON animals.type_id = animal_types.id
      WHERE animals.id = ?
    `).get(id);

    if (!animal) return undefined;

    // Type assertion for the database result
    const dbAnimal = animal as {
      id: number;
      name: string;
      breed: string;
      age: number;
      type_id: number;
      description: string;
      image: string;
      type_name: string | null;
      type_description: string | null;
    };

    const result: Animal = {
      id: dbAnimal.id,
      name: dbAnimal.name,
      breed: dbAnimal.breed,
      age: dbAnimal.age,
      type_id: dbAnimal.type_id,
      description: dbAnimal.description,
      image: dbAnimal.image,
      created_at: (animal as any).created_at,
      updated_at: (animal as any).updated_at,
      type: dbAnimal.type_name ? {
        id: dbAnimal.type_id,
        name: dbAnimal.type_name,
        description: dbAnimal.type_description || '',
        created_at: (animal as any).created_at,
        updated_at: (animal as any).updated_at
      } : undefined
    };
    return result;
  }

  createAnimal(data: Omit<Animal, 'id' | 'created_at' | 'updated_at'>): Animal {
    const result = this.db.prepare(
      'INSERT INTO animals (name, breed, age, type_id, description, image) VALUES (?, ?, ?, ?, ?, ?) RETURNING *'
    ).get(data.name, data.breed, data.age, data.type_id, data.description, data.image) as Animal;
    return this.getAnimalById(result.id)!;
  }

  updateAnimal(id: number, data: Partial<Omit<Animal, 'id' | 'created_at' | 'updated_at'>>): Animal | undefined {
    const now = new Date().toISOString();
    const current = this.getAnimalById(id);
    if (!current) return undefined;

    const result = this.db.prepare(`
      UPDATE animals
      SET name = ?, breed = ?, age = ?, type_id = ?, description = ?, image = ?, updated_at = ?
      WHERE id = ?
      RETURNING *
    `).get(
      data.name ?? current.name,
      data.breed ?? current.breed,
      data.age ?? current.age,
      data.type_id ?? current.type_id,
      data.description ?? current.description,
      data.image ?? current.image,
      now,
      id
    ) as Animal | undefined;

    return result ? this.getAnimalById(result.id) : undefined;
  }

  deleteAnimal(id: number): void {
    this.db.prepare('DELETE FROM animals WHERE id = ?').run(id);
  }

  debugDumpTable(): void {
    this.db.prepare('SELECT * FROM app_info').all();
  }
}

// Create database service instance
export const databaseService = new DatabaseService();

// Debug: Dump initial database content
databaseService.debugDumpTable();
