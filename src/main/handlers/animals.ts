import { ipcMain, dialog, app } from 'electron'
import { databaseService } from '../database'
import type { Animal } from '../database'
import * as XLSX from 'xlsx'
import path from 'path'

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

  // Export animals to Excel
  ipcMain.handle('export-animals-excel', async () => {
    try {
      const animals = await databaseService.getAnimals()

      // Prepare data for worksheet (flatten and map keys)
      const rows = animals.map((a) => ({
        ID: a.id,
        Tag: a.tagNumber ?? '',
        Name: a.name,
        Breed: a.breed ?? '',
        Gender: a.gender,
        Age: a.age ?? '',
        Type: a.type?.name ?? '',
        Description: a.description,
        DateOfBirth: a.dateOfBirth ?? '',
        WeightKg: a.weight ?? '',
        HeightCm: a.height ?? '',
        AcquisitionDate: a.acquisitionDate ?? '',
        AcquisitionLocation: a.acquisitionLocation ?? '',
        ExitDate: a.exitDate ?? '',
        ExitReason: a.exitReason ?? ''
      }))

      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Animals')

      // Default path in user's Documents
      const defaultPath = path.join(app.getPath('documents'), 'animals.xlsx')
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Export Animals to Excel',
        defaultPath,
        filters: [{ name: 'Excel Workbook', extensions: ['xlsx'] }]
      })

      if (canceled || !filePath) return { success: false, message: 'Export canceled' }

      XLSX.writeFile(wb, filePath)
      return { success: true, filePath }
    } catch (error) {
      console.error('Error exporting animals to Excel:', error)
      return { success: false, message: 'Failed to export' }
    }
  })
}
