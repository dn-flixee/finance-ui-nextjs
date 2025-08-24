"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import IncomeSheet from './IncomeSheet'
import IncomeSourceSheet from './IncomeSourceSheet'
import NavBar from '@/components/NavBar'

// Updated imports for new Redux structure
import { 
  selectIncomes, 
  selectIncomesStatus,
  selectIncomesError,
  fetchIncomes 
} from '@/lib/features/income/incomeSlice'
import { 
  fetchIncomeSources, 
  selectIncomeSources,
  selectIncomeSourcesStatus
} from '@/lib/features/incomeSource/incomeSourceSlice'
import { 
  fetchAccounts, 
  selectAccounts,
  selectAccountsStatus
} from '@/lib/features/account/accountSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { Income, IncomeSource, FinanceAccount } from '@/lib/types'

export default function IncomePage() {
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  // Redux selectors
  const incomes = useAppSelector(selectIncomes)
  const incomesStatus = useAppSelector(selectIncomesStatus)
  const incomesError = useAppSelector(selectIncomesError)
  
  const incomeSources = useAppSelector(selectIncomeSources)
  const incomeSourcesStatus = useAppSelector(selectIncomeSourcesStatus)
  
  const accounts = useAppSelector(selectAccounts)
  const accountsStatus = useAppSelector(selectAccountsStatus)

  // Local state
  const [selectedMonth, setSelectedMonth] = useState<number>((new Date()).getMonth())
  const [selectedYear, setSelectedYear] = useState<number>((new Date()).getFullYear())
  const [isIncomeSheetOpen, setIsIncomeSheetOpen] = useState(false)
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null)
  const [isIncomeSourceSheetOpen, setIsIncomeSourceSheetOpen] = useState(false)
  const [selectedIncomeSource, setSelectedIncomeSource] = useState<IncomeSource | null>(null)

  // Fetch data on component mount
  useEffect(() => {
    if (incomesStatus === 'idle') {
      dispatch(fetchIncomes())
    }
  }, [dispatch, incomesStatus])

  useEffect(() => {
    if (accountsStatus === 'idle') {
      dispatch(fetchAccounts())
    }
  }, [dispatch, accountsStatus])

  useEffect(() => {
    if (incomeSourcesStatus === 'idle') {
      dispatch(fetchIncomeSources())
    }
  }, [dispatch, incomeSourcesStatus])

  // Error handling
  useEffect(() => {
    if (incomesError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load incomes. Please try again.",
      })
    }
  }, [incomesError, toast])

  // Sheet handlers
  const openIncomeSheet = (income: Income | null = null) => {
    setSelectedIncome(income)
    setIsIncomeSheetOpen(true)
  }

  const closeIncomeSheet = () => {
    setIsIncomeSheetOpen(false)
    setSelectedIncome(null)
  }

  const openIncomeSourceSheet = (source: IncomeSource | null = null) => {
    setSelectedIncomeSource(source)
    setIsIncomeSourceSheetOpen(true)
  }

  const closeIncomeSourceSheet = () => {
    setIsIncomeSourceSheetOpen(false)
    setSelectedIncomeSource(null)
  }

  // Filter incomes by selected month and year
  const filteredIncome = incomes.filter(income => {
    const incomeDate = new Date(income.date)
    return incomeDate.getMonth() === selectedMonth && incomeDate.getFullYear() === selectedYear
  })

  // Calculate income source progress
  const filteredIncomeSource = incomeSources.map(source => {
    const totalIncome = filteredIncome
      .filter(income => income.incomeSourceId === source.incomeSourceId)
      .reduce((sum, income) => sum + income.amount, 0)
    return {
      ...source,
      current: totalIncome,
      percentage: Math.min(Math.round((totalIncome / source.goal) * 100), 100)
    }
  })

  // Get available years from income data
  const years: number[] = Array.from(
    new Set(
      incomes.map(income => {
        const date = new Date(income.date)
        return date.getFullYear()
      })
    )
  ).sort((a, b) => b - a) // Sort years in descending order

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

  const isLoading = incomesStatus === 'loading' || accountsStatus === 'loading' || incomeSourcesStatus === 'loading'

  if (isLoading && incomes.length === 0) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading income data...</span>
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
          {/* Income Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium text-white">INCOME</CardTitle>
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                <path d="M12 3v6" />
              </svg>
            </CardHeader>
            <CardContent>
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
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => openIncomeSheet()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Add Income
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">
                    {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                  </h3>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Total</p>
                    <p className="text-xl font-bold text-green-400">
                      ₹{filteredIncome.reduce((sum, income) => sum + income.amount, 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {filteredIncome.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>No income entries for this period</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openIncomeSheet()}
                      className="mt-2"
                    >
                      Add your first income
                    </Button>
                  </div>
                ) : (
                  filteredIncome.map((income) => (
                    <div 
                      key={income.incomeId} 
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-700 p-3 rounded-lg transition-colors" 
                      onClick={() => openIncomeSheet(income)}
                    >
                      <div className="flex flex-col space-y-1">
                        <span className="text-white font-medium">{income.name}</span>
                        <span className="text-sm text-gray-400">
                          {income.incomeSourceName || 'No source'}
                        </span>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className="text-white font-bold">₹{income.amount.toLocaleString()}</span>
                        <span className="text-xs text-green-400">{income.accountName}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Income Sources Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium text-white">INCOME SOURCES</CardTitle>
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                <path d="M12 3v6" />
              </svg>
            </CardHeader>
            <CardContent>
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
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => openIncomeSourceSheet()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add Source
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredIncomeSource.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-gray-400">
                    <p>No income sources created</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openIncomeSourceSheet()}
                      className="mt-2"
                    >
                      Create your first source
                    </Button>
                  </div>
                ) : (
                  filteredIncomeSource.map((source) => (
                    <Card 
                      key={source.incomeSourceId} 
                      className="bg-gray-700 hover:bg-gray-600 cursor-pointer transition-colors"
                      onClick={() => openIncomeSourceSheet(source)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium text-white truncate">{source.name}</span>
                          <span className="text-sm text-gray-300">
                            ₹{source.current.toLocaleString()} / ₹{source.goal.toLocaleString()}
                          </span>
                        </div>
                        <Progress 
                          value={source.percentage} 
                          className="h-2 mb-2" 
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">
                            {source.percentage}% complete
                          </span>
                          <span className="text-xs text-gray-400">
                            ₹{(source.goal - source.current).toLocaleString()} remaining
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

        {/* Income Sheet */}
        <IncomeSheet 
          incomeSourceData={incomeSources} 
          accountData={accounts} 
          isOpen={isIncomeSheetOpen} 
          onClose={closeIncomeSheet} 
          incomeToEdit={selectedIncome} 
        />

        {/* Income Source Sheet */}
        <IncomeSourceSheet 
          isOpen={isIncomeSourceSheetOpen} 
          onClose={closeIncomeSourceSheet} 
          incomeSourceToEdit={selectedIncomeSource} 
        />
      </div>
    </>
  )
}
