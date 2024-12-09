"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useToast } from '@/components/ui/use-toast'
import ExpenseSheet from './ExpenseSheet'
import ExpenseSourceSheet from './ExpenseSourceSheet'
import NavBar from '@/components/NavBar'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { fetchExpenses, selectExpenses } from '@/lib/features/expense/expenseSlice'
import { fetchExpenseSources, selectExpenseSources } from '@/lib/features/expenseSource/expenseSourceSlice'
import { fetchAccounts, selectAccounts } from '@/lib/features/account/accountSlice'

interface Expense {
    expenseId: number;
    name: string;
    amount: number;
    date: Date;
    accountName: string;
    expenseSourceName: string;
  }
interface ExpenseSource {
    expenseSourceId: number;
    name: string;
    budget: number;
}
  
interface Account {
    accountId: number;
    name: string;
    startingBalance: number;
    type: number;
}
  
export default function Component() {

    const expenses = useAppSelector(selectExpenses)
    const expenseSources = useAppSelector(selectExpenseSources)
    const accounts = useAppSelector(selectAccounts)
    const dispatch = useAppDispatch()

    const date = new Date();
    const [selectedMonth, setSelectedMonth] = useState<Number>((new Date()).getMonth())
    const [selectedYear, setSelectedYear] = useState<Number>((new Date()).getFullYear())
    const [isExpenseSheetOpen, setIsExpenseSheetOpen] = useState(false)
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
    const [isExpenseSourceSheetOpen, setIsExpenseSourceSheetOpen] = useState(false)
    const [selectedExpenseSource, setSelectedExpenseSource] = useState<ExpenseSource | null>(null)
    
  useEffect(() => {
    if(expenses.status === 'idle'){
      dispatch(fetchExpenses()).then(
        (Response)=>{
          console.log("fetchExpenses")
          console.log(Response.payload)
      })
    }
  }, [dispatch,expenses.status]);

  useEffect(() => {
    if(expenseSources.status === 'idle'){
      dispatch(fetchExpenseSources()).then(
        (Response)=>{
          console.log("fetchExpenseSources")
          console.log(Response.payload)
      })
    }
  }, [dispatch,expenseSources.status]);

  useEffect(() => {
    if(accounts.status === 'idle'){
      dispatch(fetchAccounts()).then(
        (Response)=>{
          console.log("fetchAccounts")
          console.log(Response.payload)
      })
    }
  }, [dispatch,accounts.status]);

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

  const filteredExpense = expenses.expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() + 1 === selectedMonth && expenseDate.getFullYear() === selectedYear
  })

  const filteredExpenseSource = expenseSources.expenseSources.map(source => {
    const totalExpense = filteredExpense
      .filter(expense => expense.expenseSourceName === source.name)
      .reduce((sum, expense) => sum + expense.amount, 0)
    return {
      ...source,
      current: totalExpense,
      percentage: Math.round((totalExpense / source.budget) * 100)
    }
  })
  console.log("--------------------")
  console.log(filteredExpenseSource)
  console.log("--------------------")

  const years: number[] = Array.from(
    new Set(
        expenses.expenses.map(expense => {
            const date = new Date(expense.date); // Convert to Date object
            return date.getFullYear(); // Extract the year
        })
    )
);
 console.log(new Date())

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ]

  return (
    <>
    <NavBar/>
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EXPENSE</CardTitle>
            <svg
              className="h-4 w-4 text-gray-400"
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
            <div className="flex space-x-2 mb-4">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="secondary" size="sm" onClick={() => openExpenseSheet()}>
                New
              </Button>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{months.find(m => m.value === selectedMonth)?.label} {selectedYear}</h3>
              {filteredExpense.map((expense) => (
                <div key={expense.expenseId} className="flex justify-between items-center cursor-pointer hover:bg-gray-700 p-2 rounded" onClick={() => openExpenseSheet(expense)}>
                  <div className="flex items-center space-x-2">
                    <span>{expense.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>₹ {expense.amount}</span>
                    <span className="text-red-500">{expense.accountName}</span>
                  </div>
                </div>
              ))
              }
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EXPENSE SOURCE</CardTitle>
            <svg
              className="h-4 w-4 text-gray-400"
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
            <div className="flex space-x-2 mb-4">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="secondary" size="sm" onClick={() => openExpenseSourceSheet()}>
                New
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {filteredExpenseSource.map((source) => (
                <Card key={source.expenseSourceId} className=" bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600" onClick={() => openExpenseSourceSheet(source)}>
                    <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <span>{source.name}</span>
                    </div>
                    <span>₹ {Math.round(source.current)} / ₹ {source.budget}</span>
                  </div>
                  <Progress value={source.percentage} className="h-2" />
                  <div className="text-right text-sm text-gray-400 mt-1">{source.percentage}%</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      <ExpenseSheet expenseSourceData={expenseSources.expenseSources} accountData={accounts.accounts} isOpen={isExpenseSheetOpen} onClose={closeExpenseSheet} expenseToEdit={selectedExpense} />
      <ExpenseSourceSheet isOpen={isExpenseSourceSheetOpen} onClose={closeExpenseSourceSheet} expenseSourceToEdit={selectedExpenseSource} />
    </div>
    </>
  )
}