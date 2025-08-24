import { ipcMain, dialog, app } from 'electron'
import * as cashflowRepo from '../db/repositories/cashflowRepo'
import type { Transaction, CashflowSummary, TransactionType } from '../db/models'
import * as XLSX from 'xlsx'
import path from 'path'

// Register IPC handlers for cashflow
export function registerCashflowHandlers(): void {
  // Get all transactions
  ipcMain.handle('get-transactions', async (): Promise<Transaction[]> => {
    return cashflowRepo.getAll()
  })

  // Get transaction by ID
  ipcMain.handle('get-transaction', async (_: unknown, id: number): Promise<Transaction | null> => {
    return (await cashflowRepo.getById(id)) || null
  })

  // Create new transaction
  ipcMain.handle(
    'create-transaction',
    async (_: unknown, data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
      return cashflowRepo.create(data)
    }
  )

  // Update transaction
  ipcMain.handle(
    'update-transaction',
    async (
      _: unknown,
      id: number,
      data: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>
    ): Promise<Transaction | undefined> => {
      return cashflowRepo.update(id, data)
    }
  )

  // Delete transaction
  ipcMain.handle('delete-transaction', async (_: unknown, id: number): Promise<number> => {
    await cashflowRepo.remove(id)
    return id
  })

  // Get cashflow summary
  ipcMain.handle('get-cashflow-summary', async (): Promise<CashflowSummary> => {
    return cashflowRepo.getSummary()
  })

  // Get transactions by date range
  ipcMain.handle(
    'get-transactions-by-date-range',
    async (_: unknown, startDate: string, endDate: string): Promise<Transaction[]> => {
      return cashflowRepo.getByDateRange(startDate, endDate)
    }
  )

  // Get transactions by type
  ipcMain.handle(
    'get-transactions-by-type',
    async (_: unknown, type: TransactionType): Promise<Transaction[]> => {
      return cashflowRepo.getByType(type)
    }
  )

  // Get monthly statistics
  ipcMain.handle(
    'get-monthly-stats',
    async (_: unknown, year: number): Promise<Array<{ month: number; income: number; expense: number; balance: number }>> => {
      return cashflowRepo.getMonthlyStats(year)
    }
  )

  // Export transactions to Excel
  ipcMain.handle('export-transactions-excel', async () => {
    try {
      const transactions = await cashflowRepo.getAll()

      // Prepare data for worksheet
      const rows = transactions.map((t) => ({
        ID: t.id,
        Type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
        Description: t.name,
        Amount: t.amount,
        Date: t.date,
        CreatedAt: t.created_at,
        UpdatedAt: t.updated_at
      }))

      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions')

      // Add summary sheet
      const summary = await cashflowRepo.getSummary()
      const summaryData = [
        { Metric: 'Total Income', Value: summary.totalIncome },
        { Metric: 'Total Expense', Value: summary.totalExpense },
        { Metric: 'Balance', Value: summary.balance },
        { Metric: 'Transaction Count', Value: summary.transactionCount }
      ]
      const summaryWs = XLSX.utils.json_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')

      // Default path in user's Documents
      const defaultPath = path.join(app.getPath('documents'), 'cashflow-transactions.xlsx')
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Export Transactions to Excel',
        defaultPath,
        filters: [{ name: 'Excel Workbook', extensions: ['xlsx'] }]
      })

      if (canceled || !filePath) return { success: false, message: 'Export canceled' }

      XLSX.writeFile(wb, filePath)
      return { success: true, filePath }
    } catch (error) {
      console.error('Error exporting transactions to Excel:', error)
      return { success: false, message: 'Failed to export' }
    }
  })
}