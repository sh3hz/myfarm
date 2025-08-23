import { ipcMain } from 'electron'
import * as animalTypesRepo from '../db/repositories/animalTypesRepo'

// Register IPC handlers for animal types
export function registerAnimalTypeHandlers(): void {
  ipcMain.handle('get-animal-types', async () => {
    return animalTypesRepo.getAll()
  })

  ipcMain.handle('get-animal-type', async (_, id: number) => {
    return animalTypesRepo.getById(id)
  })

  ipcMain.handle('create-animal-type', async (_, name: string, description: string) => {
    return animalTypesRepo.create(name, description)
  })

  ipcMain.handle('update-animal-type', async (_, id: number, name: string, description: string) => {
    return animalTypesRepo.update(id, name, description)
  })

  ipcMain.handle('delete-animal-type', async (_, id: number) => {
    return animalTypesRepo.remove(id)
  })
}
