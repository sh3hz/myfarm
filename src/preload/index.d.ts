interface AppInfo {
  id: number
  name: string
  version: string
  description: string
}

interface AnimalType {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

interface Animal {
  id: number
  name: string
  breed?: string
  age: number
  type_id: number
  description: string
  created_at: string
  updated_at: string
  type?: AnimalType
}

declare global {
  interface Window {
    api: {
      getAppInfo: () => Promise<AppInfo>
      getAnimalTypes: () => Promise<AnimalType[]>
      getAnimalType: (id: number) => Promise<AnimalType | undefined>
      createAnimalType: (name: string, description: string) => Promise<AnimalType>
      updateAnimalType: (id: number, name: string, description: string) => Promise<AnimalType | undefined>
      deleteAnimalType: (id: number) => Promise<void>
      // Animal handlers
      getAnimals: () => Promise<Animal[]>
      getAnimal: (id: number) => Promise<Animal | undefined>
      createAnimal: (data: Omit<Animal, 'id' | 'created_at' | 'updated_at' | 'type'>) => Promise<Animal>
      updateAnimal: (id: number, data: Partial<Omit<Animal, 'id' | 'created_at' | 'updated_at' | 'type'>>) => Promise<Animal | undefined>
      deleteAnimal: (id: number) => Promise<void>
    }
  }
}
