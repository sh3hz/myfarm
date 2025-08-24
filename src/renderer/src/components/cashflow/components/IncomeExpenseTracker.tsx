"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Plus, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@renderer/components/ui/select'
import { Calendar } from '@renderer/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@renderer/components/ui/popover'
import { Badge } from '@renderer/components/ui/badge'
import { cn } from '@renderer/lib/utils'

export function IncomeExpenseTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<CashflowSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0
  })
  const [formData, setFormData] = useState({
    type: '' as 'income' | 'expense' | '',
    name: '',
    amount: '',
    date: new Date(),
  })
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load transactions and summary
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [transactionsData, summaryData] = await Promise.all([
        window.api.getTransactions(),
        window.api.getCashflowSummary()
      ])
      setTransactions(transactionsData)
      setSummary(summaryData)
    } catch (error) {
      console.error('Error loading cashflow data:', error)
      toast.error('Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.type || !formData.name || !formData.amount) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setIsLoading(true)
      await window.api.createTransaction({
        type: formData.type,
        name: formData.name,
        amount: parseFloat(formData.amount),
        date: format(formData.date, 'yyyy-MM-dd'),
      })

      // Reset form
      setFormData({
        type: '',
        name: '',
        amount: '',
        date: new Date(),
      })

      // Reload data
      await loadData()
      toast.success('Transaction added successfully')
    } catch (error) {
      console.error('Error creating transaction:', error)
      toast.error('Failed to add transaction')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const result = await window.api.exportTransactionsToExcel()
      if (result.success) {
        toast.success('Exported successfully', { description: result.filePath })
      } else {
        toast.error(result.message || 'Export failed')
      }
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error('Export failed')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${summary.totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${summary.totalExpense.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              summary.balance >= 0 ? "text-green-600" : "text-red-600"
            )}>
              ${summary.balance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Entry
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Type Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'income' | 'expense') => 
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name">Description</Label>
                <Input
                  id="name"
                  placeholder="Enter description"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              {/* Date Picker */}
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => {
                        if (date) {
                          setFormData({ ...formData, date })
                          setIsCalendarOpen(false)
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Entry'}
            </Button>
          </form>
        </CardContent>
      </Card>   
   {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet. Add your first entry above!
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={transaction.type === 'income' ? 'default' : 'destructive'}
                      className={cn(
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                          : 'bg-red-100 text-red-800 hover:bg-red-100'
                      )}
                    >
                      {transaction.type === 'income' ? 'Income' : 'Expense'}
                    </Badge>
                    <div>
                      <div className="font-medium">{transaction.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "font-semibold text-lg",
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}