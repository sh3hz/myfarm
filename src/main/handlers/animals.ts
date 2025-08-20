import { ipcMain } from 'electron'
import { databaseService } from '../database'
import type { Animal } from '../database'

// Register IPC handlers for animals
export function registerAnimalHandlers() {
  ipcMain.handle('get-animals', async () => {
    return databaseService.getAllAnimals()
  })

  ipcMain.handle('get-animal', async (_, id: number) => {
    return databaseService.getAnimalById(id)
  })

  ipcMain.handle('create-animal', async (_, data: Omit<Animal, 'id' | 'created_at' | 'updated_at'>) => {
    return databaseService.createAnimal(data)
  })

  ipcMain.handle('update-animal', async (_, id: number, data: Partial<Omit<Animal, 'id' | 'created_at' | 'updated_at'>>) => {
    return databaseService.updateAnimal(id, data)
  })

  ipcMain.handle('delete-animal', async (_, id: number) => {
    return databaseService.deleteAnimal(id)
  })
}
