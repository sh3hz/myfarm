import type { Animal, AnimalType } from './models'

// Helper to map DB row (snake_case) to Animal (camelCase)
export function mapAnimalRow(row: any, documents?: string[]): Animal {
  return {
    id: row.id,
    name: row.name,
    breed: row.breed,
    fatherBreed: row.father_breed,
    motherBreed: row.mother_breed,
    age: row.age,
    type_id: row.type_id,
    description: row.description,
    image: row.image,
    documents: documents || [],
    gender: row.gender,
    tagNumber: row.tag_number,
    dateOfBirth: row.date_of_birth,
    weight: row.weight,
    height: row.height,
    acquisitionDate: row.acquisition_date,
    acquisitionLocation: row.acquisition_location,
    exitDate: row.exit_date,
    exitReason: row.exit_reason,
    created_at: row.created_at,
    updated_at: row.updated_at,
    type: row.type_name
      ? ({ id: row.type_id, name: row.type_name, description: row.type_description } as AnimalType)
      : undefined
  }
}

// Helper to map partial input back to DB columns for updates/inserts
export function mapAnimalToDbParams(a: Partial<Animal>): Record<string, unknown> {
  return {
    name: a.name,
    breed: a.breed,
    father_breed: a.fatherBreed,
    mother_breed: a.motherBreed,
    age: a.age ?? null,
    type_id: a.type_id,
    description: a.description,
    image: a.image,
    tag_number: a.tagNumber,
    gender: a.gender,
    date_of_birth: a.dateOfBirth,
    weight: a.weight,
    height: a.height,
    acquisition_date: a.acquisitionDate,
    acquisition_location: a.acquisitionLocation,
    exit_date: a.exitDate,
    exit_reason: a.exitReason
  }
}
