import { ipcMain } from 'electron'
import { databaseService } from '../database'

// Register IPC handlers for animal types
export function registerAnimalTypeHandlers() {
  ipcMain.handle('get-animal-types', async () => {
    return databaseService.getAllAnimalTypes()
  })

  ipcMain.handle('get-animal-type', async (_, id: number) => {
    return databaseService.getAnimalTypeById(id)
  })

  ipcMain.handle('create-animal-type', async (_, name: string, description: string) => {
    return databaseService.createAnimalType(name, description)
  })

  ipcMain.handle('update-animal-type', async (_, id: number, name: string, description: string) => {
    return databaseService.updateAnimalType(id, name, description)
  })

  ipcMain.handle('delete-animal-type', async (_, id: number) => {
    return databaseService.deleteAnimalType(id)
  })
}
