// src/app/(dashboard)/expenses/page.tsx
"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Plus, Search, Filter } from 'lucide-react'
import ExpenseSheet from './ExpenseSheet'
import ExpenseSourceSheet from './ExpenseSourceSheet'
import NavBar from '@/components/NavBar'

import { 
  selectExpenses, 
  selectExpensesStatus,
  selectExpensesError,
  fetchExpenses 
} from '@/lib/features/expense/expenseSlice'
import { 
  fetchExpenseSources, 
  selectExpenseSources,
  selectExpenseSourcesStatus
} from '@/lib/features/expenseSource/expenseSourceSlice'
import { 
  fetchAccounts, 
  selectAccounts,
  selectAccountsStatus
} from '@/lib/features/account/accountSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { Expense, ExpenseSource, FinanceAccount } from '@/lib/types'

export default function ExpensesPage() {
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  // Redux selectors
  const expenses = useAppSelector(selectExpenses)
  const expensesStatus = useAppSelector(selectExpensesStatus)
  const expensesError = useAppSelector(selectExpensesError)
  
  const expenseSources = useAppSelector(selectExpenseSources)
  const expenseSourcesStatus = useAppSelector(selectExpenseSourcesStatus)
  
  const accounts = useAppSelector(selectAccounts)
  const accountsStatus = useAppSelector(selectAccountsStatus)

  // Local state
  const [selectedMonth, setSelectedMonth] = useState<number>((new Date()).getMonth())
  const [selectedYear, setSelectedYear] = useState<number>((new Date()).getFullYear())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [isExpenseSheetOpen, setIsExpenseSheetOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [isExpenseSourceSheetOpen, setIsExpenseSourceSheetOpen] = useState(false)
  const [selectedExpenseSource, setSelectedExpenseSource] = useState<ExpenseSource | null>(null)

  // Fetch data on component mount
  useEffect(() => {
    if (expensesStatus === 'idle') {
      dispatch(fetchExpenses())
    }
  }, [dispatch, expensesStatus])

  useEffect(() => {
    if (accountsStatus === 'idle') {
      dispatch(fetchAccounts())
    }
  }, [dispatch, accountsStatus])

  useEffect(() => {
    if (expenseSourcesStatus === 'idle') {
      dispatch(fetchExpenseSources())
    }
  }, [dispatch, expenseSourcesStatus])

  // Error handling
  useEffect(() => {
    if (expensesError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load expenses. Please try again.",
      })
    }
  }, [expensesError, toast])

  // Sheet handlers
  const openExpenseSheet = (expense: Expense | null = null) => {
    setSelectedExpense(expense)
    setIsExpenseSheetOpen(true)
  }

  const closeExpenseSheet = () => {
    setIsExpenseSheetOpen(false)
    setSelectedExpense(null)
  }

  const openExpenseSourceSheet = (source: ExpenseSource | null = null) => {
    setSelectedExpenseSource(source)
    setIsExpenseSourceSheetOpen(true)
  }

  const closeExpenseSourceSheet = () => {
    setIsExpenseSourceSheetOpen(false)
    setSelectedExpenseSource(null)
  }

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    const matchesMonth = expenseDate.getMonth() === selectedMonth
    const matchesYear = expenseDate.getFullYear() === selectedYear
    const matchesSearch = expense.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAccount = selectedAccount === 'all' || expense.accountId === selectedAccount
    const matchesSource = selectedSource === 'all' || expense.expenseSourceId === selectedSource
    
    return matchesMonth && matchesYear && matchesSearch && matchesAccount && matchesSource
  })

  // Calculate expense source progress
  const filteredExpenseSource = expenseSources.map(source => {
    const totalExpenses = filteredExpenses
      .filter(expense => expense.expenseSourceId === source.expenseSourceId)
      .reduce((sum, expense) => sum + expense.amount, 0)
    return {
      ...source,
      current: totalExpenses,
      percentage: Math.min(Math.round((totalExpenses / source.budget) * 100), 100),
      remaining: Math.max(source.budget - totalExpenses, 0)
    }
  })

  // Get available years
  const years: number[] = Array.from(
    new Set(
      expenses.map(expense => {
        const date = new Date(expense.date)
        return date.getFullYear()
      })
    )
  ).sort((a, b) => b - a)

  const months = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' },
  ]

  const isLoading = expensesStatus === 'loading' || accountsStatus === 'loading' || expenseSourcesStatus === 'loading'

  if (isLoading && expenses.length === 0) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading expenses...</span>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-900 text-white">
        <main className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-medium text-white">EXPENSES</CardTitle>
              <Button 
                size="sm"
                onClick={() => openExpenseSheet()}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Select 
                  value={selectedMonth.toString()} 
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger className="w-[140px] bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={selectedYear.toString()} 
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-[100px] bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search and Additional Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="w-[140px] bg-gray-700 border-gray-600">
                    <SelectValue placeholder="All Accounts" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="all">All Accounts</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.accountId} value={account.accountId}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Expenses List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">
                    {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                  </h3>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Total Spent</p>
                    <p className="text-xl font-bold text-red-400">
                      ₹{filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {filteredExpenses.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>No expenses found for the selected filters</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openExpenseSheet()}
                      className="mt-2"
                    >
                      Add your first expense
                    </Button>
                  </div>
                ) : (
                  filteredExpenses.map((expense) => (
                    <div 
                      key={expense.expenseId} 
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-700 p-3 rounded-lg transition-colors" 
                      onClick={() => openExpenseSheet(expense)}
                    >
                      <div className="flex flex-col space-y-1">
                        <span className="text-white font-medium">{expense.name}</span>
                        <span className="text-sm text-gray-400">
                          {expense.expenseSourceName || 'No category'}
                        </span>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className="text-white font-bold">₹{expense.amount.toLocaleString()}</span>
                        <span className="text-xs text-red-400">{expense.accountName}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Expense Sources Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-medium text-white">EXPENSE CATEGORIES</CardTitle>
              <Button 
                size="sm"
                onClick={() => openExpenseSourceSheet()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {filteredExpenseSource.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>No expense categories created</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openExpenseSourceSheet()}
                      className="mt-2"
                    >
                      Create your first category
                    </Button>
                  </div>
                ) : (
                  filteredExpenseSource.map((source) => (
                    <Card 
                      key={source.expenseSourceId} 
                      className="bg-gray-700 hover:bg-gray-600 cursor-pointer transition-colors"
                      onClick={() => openExpenseSourceSheet(source)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium text-white">{source.name}</span>
                          <span className="text-sm text-gray-300">
                            ₹{source.current.toLocaleString()} / ₹{source.budget.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              source.percentage >= 90 ? 'bg-red-500' : 
                              source.percentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${source.percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">
                            {source.percentage}% of budget used
                          </span>
                          <span className="text-xs text-gray-400">
                            ₹{source.remaining.toLocaleString()} remaining
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Expense Sheet */}
        <ExpenseSheet 
          expenseSourceData={expenseSources} 
          accountData={accounts} 
          isOpen={isExpenseSheetOpen} 
          onClose={closeExpenseSheet} 
          expenseToEdit={selectedExpense} 
        />

        {/* Expense Source Sheet */}
        <ExpenseSourceSheet 
          isOpen={isExpenseSourceSheetOpen} 
          onClose={closeExpenseSourceSheet} 
          expenseSourceToEdit={selectedExpenseSource} 
        />
      </div>
    </>
  )
}
