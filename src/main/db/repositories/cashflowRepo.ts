import type { Transaction, CashflowSummary, TransactionType } from '../models'
import { getDb } from '../connection'

export async function getAll(): Promise<Transaction[]> {
  const db = getDb()
  const rows = db
    .prepare(
      `
      SELECT * FROM transactions
      ORDER BY date DESC, created_at DESC
    `
    )
    .all()
  
  return rows as Transaction[]
}

export async function getById(id: number): Promise<Transaction | undefined> {
  const db = getDb()
  const row = db
    .prepare('SELECT * FROM transactions WHERE id = ?')
    .get(id)
  
  return row as Transaction | undefined
}

export async function create(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  const db = getDb()
  const now = new Date().toISOString()
  
  const stmt = db.prepare(
    `
    INSERT INTO transactions (type, name, amount, date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `
  )

  const result = stmt.run(
    data.type,
    data.name,
    data.amount,
    data.date,
    now,
    now
  )

  return result.lastInsertRowid as number
}

export async function update(
  id: number,
  data: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>
): Promise<Transaction | undefined> {
  const db = getDb()
  const now = new Date().toISOString()
  const current = await getById(id)
  if (!current) return undefined

  const result = db
    .prepare(
      `
      UPDATE transactions
      SET type = ?, name = ?, amount = ?, date = ?, updated_at = ?
      WHERE id = ?
      RETURNING *
    `
    )
    .get(
      data.type ?? current.type,
      data.name ?? current.name,
      data.amount ?? current.amount,
      data.date ?? current.date,
      now,
      id
    ) as Transaction | undefined

  return result
}

export async function remove(id: number): Promise<void> {
  const db = getDb()
  db.prepare('DELETE FROM transactions WHERE id = ?').run(id)
}

export async function getSummary(): Promise<CashflowSummary> {
  const db = getDb()
  const row = db
    .prepare(
      `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as totalIncome,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as totalExpense,
        COUNT(*) as transactionCount
      FROM transactions
    `
    )
    .get() as {
      totalIncome: number
      totalExpense: number
      transactionCount: number
    } | undefined

  const totalIncome = row?.totalIncome ?? 0
  const totalExpense = row?.totalExpense ?? 0
  const balance = totalIncome - totalExpense
  const transactionCount = row?.transactionCount ?? 0

  return {
    totalIncome,
    totalExpense,
    balance,
    transactionCount
  }
}

export async function getByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
  const db = getDb()
  const rows = db
    .prepare(
      `
      SELECT * FROM transactions
      WHERE date BETWEEN ? AND ?
      ORDER BY date DESC, created_at DESC
    `
    )
    .all(startDate, endDate)
  
  return rows as Transaction[]
}

export async function getByType(type: TransactionType): Promise<Transaction[]> {
  const db = getDb()
  const rows = db
    .prepare(
      `
      SELECT * FROM transactions
      WHERE type = ?
      ORDER BY date DESC, created_at DESC
    `
    )
    .all(type)
  
  return rows as Transaction[]
}

export async function getMonthlyStats(year: number): Promise<Array<{ month: number; income: number; expense: number; balance: number }>> {
  const db = getDb()
  const rows = db
    .prepare(
      `
      SELECT 
        CAST(strftime('%m', date) AS INTEGER) as month,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
      FROM transactions
      WHERE strftime('%Y', date) = ?
      GROUP BY strftime('%m', date)
      ORDER BY month
    `
    )
    .all(year.toString()) as Array<{ month: number; income: number; expense: number }>

  return rows.map(row => ({
    ...row,
    balance: row.income - row.expense
  }))
}