import { ipcMain } from 'electron'
import * as milkProductionRepo from '../db/repositories/milkProductionRepo'
import type { MilkProduction } from '../db/models'

export function registerMilkProductionHandlers(): void {
  ipcMain.handle('get-milk-production', async (): Promise<MilkProduction[]> => {
    return milkProductionRepo.getAll()
  })

  ipcMain.handle('get-milk-production-by-animal', async (_: unknown, animalId: number): Promise<MilkProduction[]> => {
    return milkProductionRepo.getByAnimalId(animalId)
  })

  ipcMain.handle('get-milk-production-by-date-range', async (_: unknown, startDate: string, endDate: string): Promise<MilkProduction[]> => {
    return milkProductionRepo.getByDateRange(startDate, endDate)
  })

  ipcMain.handle('get-milk-production-by-id', async (_: unknown, id: number): Promise<MilkProduction | null> => {
    return (await milkProductionRepo.getById(id)) || null
  })

  ipcMain.handle(
    'create-milk-production',
    async (_: unknown, data: Omit<MilkProduction, 'id' | 'total_amount' | 'created_at' | 'updated_at'>): Promise<number> => {
      return milkProductionRepo.create(data)
    }
  )

  ipcMain.handle(
    'update-milk-production',
    async (
      _: unknown,
      id: number,
      data: Partial<Omit<MilkProduction, 'id' | 'total_amount' | 'created_at' | 'updated_at'>>
    ): Promise<MilkProduction | null> => {
      return (await milkProductionRepo.update(id, data)) || null
    }
  )

  ipcMain.handle('delete-milk-production', async (_: unknown, id: number): Promise<void> => {
    return milkProductionRepo.remove(id)
  })

  ipcMain.handle('get-milk-production-stats', async (_: unknown, animalId?: number): Promise<{
    totalRecords: number
    totalProduction: number
    averageDaily: number
    lastWeekProduction: number
  }> => {
    return milkProductionRepo.getProductionStats(animalId)
  })

  ipcMain.handle('get-milk-production-chart-data', async (_: unknown, animalId?: number, days: number = 30): Promise<Array<{
    date: string
    total: number
    morning: number
    evening: number
  }>> => {
    return milkProductionRepo.getChartData(animalId, days)
  })
}