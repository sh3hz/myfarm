import type Database from 'better-sqlite3';
import { getDb } from './db/connection';
import { initDatabase } from './db/schema';
import type { AppInfo, AnimalType, Animal, Gender } from './db/models';

// Models are imported from ./db/models

class DatabaseService {
  private db: Database.Database;

  constructor() {
    this.db = getDb();
    this.init();
  }

  private init() {
    initDatabase(this.db)
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
  async getAnimals(): Promise<Animal[]> {
    try {
      const animals = this.db.prepare(`
        SELECT 
          a.*, 
          at.name as type_name, 
          at.description as type_description
        FROM animals a
        LEFT JOIN animal_types at ON a.type_id = at.id
      `).all();

      return animals.map((animal: any) => ({
        ...animal,
        tagNumber: animal.tag_number,
        dateOfBirth: animal.date_of_birth,
        acquisitionDate: animal.acquisition_date,
        acquisitionLocation: animal.acquisition_location,
        exitDate: animal.exit_date,
        exitReason: animal.exit_reason,
        type: animal.type_name ? {
          id: animal.type_id,
          name: animal.type_name,
          description: animal.type_description
        } : undefined
      }));
    } catch (error) {
      console.error('Database - Error getting animals:', error);
      throw error;
    }
  }

  getAnimalById(id: number): Animal | undefined {
    const animal = this.db.prepare(`
      SELECT 
        a.*, 
        at.name as type_name, 
        at.description as type_description
      FROM animals a
      LEFT JOIN animal_types at ON a.type_id = at.id
      WHERE a.id = ?
    `).get(id) as any;

    if (!animal) return undefined;

    return {
      id: animal.id,
      name: animal.name,
      breed: animal.breed,
      age: animal.age,
      type_id: animal.type_id,
      description: animal.description,
      image: animal.image,
      gender: animal.gender as Gender,
      tagNumber: animal.tag_number,
      dateOfBirth: animal.date_of_birth,
      weight: animal.weight,
      height: animal.height,
      acquisitionDate: animal.acquisition_date,
      acquisitionLocation: animal.acquisition_location,
      exitDate: animal.exit_date,
      exitReason: animal.exit_reason,
      created_at: animal.created_at,
      updated_at: animal.updated_at,
      type: animal.type_name ? {
        id: animal.type_id,
        name: animal.type_name,
        description: animal.type_description,
        created_at: animal.created_at,
        updated_at: animal.updated_at
      } : undefined
    };
  }

  async createAnimal(animal: Omit<Animal, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    try {
      const now = new Date().toISOString();
      const stmt = this.db.prepare(`
        INSERT INTO animals (
          name, breed, age, type_id, description, image, 
          created_at, updated_at, tag_number, gender, 
          date_of_birth, weight, height, acquisition_date, 
          acquisition_location, exit_date, exit_reason
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        animal.name,
        animal.breed,
        animal.age ?? null,
        animal.type_id,
        animal.description,
        animal.image,
        now,
        now,
        animal.tagNumber,
        animal.gender,
        animal.dateOfBirth,
        animal.weight,
        animal.height,
        animal.acquisitionDate,
        animal.acquisitionLocation,
        animal.exitDate,
        animal.exitReason
      );
    } catch (error) {
      console.error('Database - Error creating animal:', error);
      throw error;
    }
  }

  async updateAnimal(id: number, data: Partial<Omit<Animal, 'id' | 'created_at' | 'updated_at'>>): Promise<Animal | undefined> {
    try {
      const now = new Date().toISOString();
      const current = this.getAnimalById(id);
      if (!current) return undefined;

      const result = this.db.prepare(`
        UPDATE animals
        SET name = ?, breed = ?, age = ?, type_id = ?, description = ?, image = ?, 
        tag_number = ?, gender = ?, date_of_birth = ?, weight = ?, height = ?, 
        acquisition_date = ?, acquisition_location = ?, exit_date = ?, exit_reason = ?, 
        updated_at = ?
        WHERE id = ?
        RETURNING *
      `).get(
        data.name ?? current.name,
        data.breed ?? current.breed,
        (data.age !== undefined ? data.age : current.age) ?? null,
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
      ) as Animal | undefined;

      return result ? this.getAnimalById(result.id) : undefined;
    } catch (error) {
      console.error('Database - Error updating animal:', error);
      throw error;
    }
  }

  deleteAnimal(id: number): void {
    this.db.prepare('DELETE FROM animals WHERE id = ?').run(id);
  }

  debugDumpTable(): void {
    this.db.prepare('SELECT * FROM app_info').all();
  }

  debugDump() {
    console.log('=== Animal Types ===');
    console.log(this.db.prepare('SELECT * FROM animal_types').all());
    console.log('=== Animals ===');
    console.log(this.db.prepare('SELECT * FROM animals').all());
  }

  // Get animal statistics
  async getAnimalStats(): Promise<{
    totalTypes: number;
    totalAnimals: number;
    mostCommonType: string;
    mostCommonTypeCount: number;
  }> {
    const row = this.db.prepare(`
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
    `).get([]) as {
      totalTypes: number;
      totalAnimals: number;
      mostCommonType: string | null;
      mostCommonTypeCount: number;
    } | undefined;

    return {
      totalTypes: row?.totalTypes ?? 0,
      totalAnimals: row?.totalAnimals ?? 0,
      mostCommonType: row?.mostCommonType ?? 'None',
      mostCommonTypeCount: row?.mostCommonTypeCount ?? 0
    };
  }

  // Get counts of animals by type
  getAnimalTypeCounts(): Array<{ name: string; count: number }> {
    try {
      const rows = this.db
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
    } catch (error) {
      console.error('Database - Error getting animal type counts:', error)
      return []
    }
  }
}


// Create database service instance
export const databaseService = new DatabaseService();
