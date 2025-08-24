
import { IncomeExpenseTracker } from '../components/IncomeExpenseTracker'

export function CashflowPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Cash Flow Tracker</h1>
          <p className="text-muted-foreground mt-2">
            Track your income and expenses to manage your finances effectively.
          </p>
        </div>
        <IncomeExpenseTracker />
      </div>
    </div>
  )
}