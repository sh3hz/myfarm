import type Database from 'better-sqlite3'
import { getDb } from './db/connection'
import { initDatabase } from './db/schema'
import type { AppInfo } from './db/models'

// Models are imported from ./db/models

class DatabaseService {
  private db: Database.Database

  constructor() {
    this.db = getDb()
    this.init()
  }

  private init() {
    initDatabase(this.db)
  }

  getAppInfo(): AppInfo {
    try {
      const result = this.db.prepare('SELECT * FROM app_info ORDER BY id DESC LIMIT 1').get()
      return result as AppInfo
    } catch (error) {
      console.error('Database - Error getting app info:', error)
      throw error
    }
  }

  updateAppInfo(appInfo: Partial<AppInfo>): void {
    const { name, version, description } = appInfo
    this.db
      .prepare(
        `
      UPDATE app_info
      SET name = COALESCE(?, name),
          version = COALESCE(?, version),
          description = COALESCE(?, description)
      WHERE id = (SELECT id FROM app_info ORDER BY id DESC LIMIT 1)
    `
      )
      .run(name, version, description)
  }
  debugDumpTable(): void {
    this.db.prepare('SELECT * FROM app_info').all()
  }

}


// Create database service instance
export const databaseService = new DatabaseService()
