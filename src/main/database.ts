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

  debugDumpTable(): void {
    const all = this.db.prepare('SELECT * FROM app_info').all();
  }
}

// Create database service instance
export const databaseService = new DatabaseService();

// Debug: Dump initial database content
databaseService.debugDumpTable();
