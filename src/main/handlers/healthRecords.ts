import { ipcMain } from 'electron'
import * as healthRecordsRepo from '../db/repositories/healthRecordsRepo'
import type { AnimalHealthRecord, HealthRecordType } from '../db/models'

export function registerHealthRecordHandlers(): void {
  ipcMain.handle('get-health-records', async (_: unknown, animalId: number): Promise<AnimalHealthRecord[]> => {
    return healthRecordsRepo.getHealthRecordsByAnimalId(animalId)
  })

  ipcMain.handle('get-health-records-by-type', async (_: unknown, animalId: number, recordType: HealthRecordType): Promise<AnimalHealthRecord[]> => {
    return healthRecordsRepo.getHealthRecordsByType(animalId, recordType)
  })

  ipcMain.handle(
    'create-health-record',
    async (_: unknown, data: Omit<AnimalHealthRecord, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
      return healthRecordsRepo.createHealthRecord(data)
    }
  )

  ipcMain.handle(
    'update-health-record',
    async (
      _: unknown,
      id: number,
      data: Partial<Omit<AnimalHealthRecord, 'id' | 'animal_id' | 'created_at' | 'updated_at'>>
    ): Promise<AnimalHealthRecord | undefined> => {
      return healthRecordsRepo.updateHealthRecord(id, data)
    }
  )

  ipcMain.handle('delete-health-record', async (_: unknown, id: number): Promise<void> => {
    return healthRecordsRepo.deleteHealthRecord(id)
  })

  ipcMain.handle('get-upcoming-events', async (): Promise<(AnimalHealthRecord & { animal_name: string; tagNumber?: string })[]> => {
    return healthRecordsRepo.getUpcomingEvents()
  })
}