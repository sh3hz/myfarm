import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  // Animal Types API
  getAnimalTypes: () => ipcRenderer.invoke('get-animal-types'),
  getAnimalType: (id: number) => ipcRenderer.invoke('get-animal-type', id),
  createAnimalType: (name: string, description: string) =>
    ipcRenderer.invoke('create-animal-type', name, description),
  updateAnimalType: (id: number, name: string, description: string) =>
    ipcRenderer.invoke('update-animal-type', id, name, description),
  deleteAnimalType: (id: number) => ipcRenderer.invoke('delete-animal-type', id),

  // Animals API
  getAnimals: () => ipcRenderer.invoke('get-animals'),
  getAnimal: (id: number) => ipcRenderer.invoke('get-animal', id),
  createAnimal: (data: any) => ipcRenderer.invoke('create-animal', data),
  updateAnimal: (id: number, data: any) => ipcRenderer.invoke('update-animal', id, data),
  deleteAnimal: (id: number) => ipcRenderer.invoke('delete-animal', id),
  exportAnimalsToExcel: () => ipcRenderer.invoke('export-animals-excel'),

  // File handling API
  saveImage: (imageData: string) => ipcRenderer.invoke('save-image', imageData),
  getImagePath: (relativePath: string) => ipcRenderer.invoke('get-image-path', relativePath),
  getImagePaths: (relativePaths: string[]) => ipcRenderer.invoke('get-image-paths', relativePaths),

  // Document handling API
  getAnimalDocuments: (animalId: number) => ipcRenderer.invoke('get-animal-documents', animalId),
  addAnimalDocument: (animalId: number, filename: string, originalName: string) => 
    ipcRenderer.invoke('add-animal-document', animalId, filename, originalName),
  removeAnimalDocument: (animalId: number, filename: string) => 
    ipcRenderer.invoke('remove-animal-document', animalId, filename),
  saveDocument: (fileData: string, originalName: string) => 
    ipcRenderer.invoke('save-document', fileData, originalName),
  getDocumentPath: (filename: string) => ipcRenderer.invoke('get-document-path', filename),
  openDocument: (filename: string) => ipcRenderer.invoke('open-document', filename),
  
  // Statistics API
  getAnimalStats: () => ipcRenderer.invoke('get-animal-stats'),
  getAnimalTypeCounts: () => ipcRenderer.invoke('get-animal-type-counts'),

  // Cashflow API
  getTransactions: () => ipcRenderer.invoke('get-transactions'),
  getTransaction: (id: number) => ipcRenderer.invoke('get-transaction', id),
  createTransaction: (data: any) => ipcRenderer.invoke('create-transaction', data),
  updateTransaction: (id: number, data: any) => ipcRenderer.invoke('update-transaction', id, data),
  deleteTransaction: (id: number) => ipcRenderer.invoke('delete-transaction', id),
  getCashflowSummary: () => ipcRenderer.invoke('get-cashflow-summary'),
  getTransactionsByDateRange: (startDate: string, endDate: string) => 
    ipcRenderer.invoke('get-transactions-by-date-range', startDate, endDate),
  getTransactionsByType: (type: string) => ipcRenderer.invoke('get-transactions-by-type', type),
  getMonthlyStats: (year: number) => ipcRenderer.invoke('get-monthly-stats', year),
  exportTransactionsToExcel: () => ipcRenderer.invoke('export-transactions-excel'),

  // Health Records API
  getHealthRecords: (animalId: number) => ipcRenderer.invoke('get-health-records', animalId),
  getHealthRecordsByType: (animalId: number, recordType: string) => 
    ipcRenderer.invoke('get-health-records-by-type', animalId, recordType),
  createHealthRecord: (data: any) => ipcRenderer.invoke('create-health-record', data),
  updateHealthRecord: (id: number, data: any) => ipcRenderer.invoke('update-health-record', id, data),
  deleteHealthRecord: (id: number) => ipcRenderer.invoke('delete-health-record', id),
  getUpcomingEvents: () => ipcRenderer.invoke('get-upcoming-events'),

  // Milk Production API
  getMilkProduction: () => ipcRenderer.invoke('get-milk-production'),
  getMilkProductionByAnimal: (animalId: number) => ipcRenderer.invoke('get-milk-production-by-animal', animalId),
  getMilkProductionByDateRange: (startDate: string, endDate: string) => 
    ipcRenderer.invoke('get-milk-production-by-date-range', startDate, endDate),
  getMilkProductionById: (id: number) => ipcRenderer.invoke('get-milk-production-by-id', id),
  createMilkProduction: (data: any) => ipcRenderer.invoke('create-milk-production', data),
  updateMilkProduction: (id: number, data: any) => ipcRenderer.invoke('update-milk-production', id, data),
  deleteMilkProduction: (id: number) => ipcRenderer.invoke('delete-milk-production', id),
  getMilkProductionStats: (animalId?: number) => ipcRenderer.invoke('get-milk-production-stats', animalId),
  getMilkProductionChartData: (animalId?: number, days?: number) => 
    ipcRenderer.invoke('get-milk-production-chart-data', animalId, days)
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', api)
