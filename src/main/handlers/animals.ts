import { ipcMain } from 'electron'
import { databaseService } from '../database'
import type { Animal } from '../database'

// Register IPC handlers for animals
export function registerAnimalHandlers(): void {
  ipcMain.handle('get-animals', async (): Promise<Animal[]> => {
    return databaseService.getAnimals()
  })

  ipcMain.handle('get-animal', async (_: unknown, id: number): Promise<Animal | null> => {
    return databaseService.getAnimalById(id) || null
  })

  ipcMain.handle(
    'create-animal',
    async (_: unknown, data: Omit<Animal, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
      await databaseService.createAnimal(data)
    }
  )

  ipcMain.handle(
    'update-animal',
    async (
      _: unknown,
      id: number,
      data: Partial<Omit<Animal, 'id' | 'created_at' | 'updated_at'>>
    ): Promise<Animal | undefined> => {
      return databaseService.updateAnimal(id, data)
    }
  )

  ipcMain.handle('delete-animal', async (_: unknown, id: number): Promise<number> => {
    databaseService.deleteAnimal(id)
    return id
  })

  ipcMain.handle(
    'get-animal-stats',
    async (): Promise<{
      totalTypes: number
      totalAnimals: number
      mostCommonType: string
      mostCommonTypeCount: number
    }> => {
      return databaseService.getAnimalStats()
    }
  )

  ipcMain.handle(
    'get-animal-type-counts',
    async (): Promise<Array<{ name: string; count: number }>> => {
      return databaseService.getAnimalTypeCounts()
    }
  )
}
