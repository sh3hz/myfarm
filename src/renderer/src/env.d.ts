/// <reference types="vite/client" />

declare module '*.svg' {
  const content: string
  export default content
}

interface Transaction {
  id: number
  type: 'income' | 'expense'
  name: string
  amount: number
  date: string
  created_at: string
  updated_at: string
}

interface CashflowSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  transactionCount: number
}

interface MonthlyStats {
  month: number
  income: number
  expense: number
  balance: number
}

interface Window {
  electron: {
    process: {
      versions: {
        electron: string;
        chrome: string;
        node: string;
      };
    };
  };
  api: {
    getAppInfo: () => Promise<any>
    updateAppInfo: (appInfo: any) => Promise<any>
    getAnimalTypes: () => Promise<any[]>
    getAnimalType: (id: number) => Promise<any>
    createAnimalType: (name: string, description: string) => Promise<any>
    updateAnimalType: (id: number, name: string, description: string) => Promise<any>
    deleteAnimalType: (id: number) => Promise<void>
    getAnimals: () => Promise<any[]>
    getAnimal: (id: number) => Promise<any>
    createAnimal: (data: any) => Promise<any>
    updateAnimal: (id: number, data: any) => Promise<any | undefined>
    deleteAnimal: (id: number) => Promise<void>
    saveImage: (imageData: string) => Promise<string>
    getImagePath: (relativePath: string) => Promise<string>
    getImagePaths: (relativePaths: string[]) => Promise<Record<string, string>>
    getAnimalStats: () => Promise<any>
    exportAnimalsToExcel: () => Promise<{ success: boolean; filePath?: string; message?: string }>
    getAnimalTypeCounts: () => Promise<Array<{ name: string; count: number }>>
    getAnimalDocuments: (animalId: number) => Promise<string[]>
    addAnimalDocument: (animalId: number, filename: string, originalName: string) => Promise<void>
    removeAnimalDocument: (animalId: number, filename: string) => Promise<void>
    saveDocument: (fileData: string, originalName: string) => Promise<string>
    getDocumentPath: (filename: string) => Promise<string>
    openDocument: (filename: string) => Promise<void>
    
    // Cashflow API
    getTransactions: () => Promise<Transaction[]>
    getTransaction: (id: number) => Promise<Transaction | null>
    createTransaction: (data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Promise<number>
    updateTransaction: (id: number, data: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>) => Promise<Transaction | undefined>
    deleteTransaction: (id: number) => Promise<number>
    getCashflowSummary: () => Promise<CashflowSummary>
    getTransactionsByDateRange: (startDate: string, endDate: string) => Promise<Transaction[]>
    getTransactionsByType: (type: 'income' | 'expense') => Promise<Transaction[]>
    getMonthlyStats: (year: number) => Promise<MonthlyStats[]>
    exportTransactionsToExcel: () => Promise<{ success: boolean; filePath?: string; message?: string }>
    
    // Health Records API
    getHealthRecords: (animalId: number) => Promise<any[]>
    getHealthRecordsByType: (animalId: number, recordType: string) => Promise<any[]>
    createHealthRecord: (data: any) => Promise<number>
    updateHealthRecord: (id: number, data: any) => Promise<any | undefined>
    deleteHealthRecord: (id: number) => Promise<void>
    getUpcomingEvents: () => Promise<(any & { animal_name: string; tagNumber?: string })[]>
    
    // Milk Production API
    getMilkProduction: () => Promise<any[]>
    getMilkProductionByAnimal: (animalId: number) => Promise<any[]>
    getMilkProductionByDateRange: (startDate: string, endDate: string) => Promise<any[]>
    getMilkProductionById: (id: number) => Promise<any | null>
    createMilkProduction: (data: any) => Promise<number>
    updateMilkProduction: (id: number, data: any) => Promise<any | null>
    deleteMilkProduction: (id: number) => Promise<void>
    getMilkProductionStats: (animalId?: number) => Promise<{
      totalRecords: number
      totalProduction: number
      averageDaily: number
      lastWeekProduction: number
    }>
    getMilkProductionChartData: (animalId?: number, days?: number) => Promise<Array<{
      date: string
      total: number
      morning: number
      evening: number
    }>>
  }
}
