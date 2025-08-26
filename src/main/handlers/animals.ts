import { ipcMain, dialog, app } from 'electron'
import * as animalsRepo from '../db/repositories/animalsRepo'
import type { Animal } from '../db/models'
import * as XLSX from 'xlsx'
import path from 'path'

// Register IPC handlers for animals
export function registerAnimalHandlers(): void {
  ipcMain.handle('get-animals', async (): Promise<Animal[]> => {
    return animalsRepo.getAll()
  })

  ipcMain.handle('get-animal', async (_: unknown, id: number): Promise<Animal | null> => {
    return (await animalsRepo.getById(id)) || null
  })

  ipcMain.handle(
    'create-animal',
    async (_: unknown, data: Omit<Animal, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
      return animalsRepo.create(data)
    }
  )

  ipcMain.handle(
    'update-animal',
    async (
      _: unknown,
      id: number,
      data: Partial<Omit<Animal, 'id' | 'created_at' | 'updated_at'>>
    ): Promise<Animal | undefined> => {
      return animalsRepo.update(id, data)
    }
  )

  ipcMain.handle('delete-animal', async (_: unknown, id: number): Promise<number> => {
    try {
      await animalsRepo.remove(id)
      console.log(`Successfully deleted animal with ID: ${id} and associated files`)
      return id
    } catch (error) {
      console.error(`Error deleting animal with ID: ${id}`, error)
      throw error
    }
  })

  ipcMain.handle(
    'get-animal-stats',
    async (): Promise<{
      totalTypes: number
      totalAnimals: number
      mostCommonType: string
      mostCommonTypeCount: number
    }> => {
      return animalsRepo.getStats()
    }
  )

  ipcMain.handle(
    'get-animal-type-counts',
    async (): Promise<Array<{ name: string; count: number }>> => {
      return animalsRepo.getTypeCounts()
    }
  )

  // Export animals to Excel
  ipcMain.handle('export-animals-excel', async () => {
    try {
      const animals = await animalsRepo.getAll()

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
        ExitReason: a.exitReason ?? '',
        Documents: a.documents?.join(', ') ?? ''
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
