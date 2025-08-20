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

declare global {
  interface Window {
    api: {
      getAppInfo: () => Promise<AppInfo>
      getAnimalTypes: () => Promise<AnimalType[]>
      getAnimalType: (id: number) => Promise<AnimalType | undefined>
      createAnimalType: (name: string, description: string) => Promise<AnimalType>
      updateAnimalType: (id: number, name: string, description: string) => Promise<AnimalType | undefined>
      deleteAnimalType: (id: number) => Promise<void>
    }
  }
}
