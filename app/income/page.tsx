"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import AccountService from '@/components/AccountService'
import { useToast } from '@/components/ui/use-toast'
import IncomeSheet from './IncomeSheet'
import IncomeSourceSheet from './IncomeSourceSheet'
import NavBar from '@/components/NavBar'

import { selectIncomes, fetchIncomes,  } from '@/lib/features/income/incomeSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { fetchIncomeSources, selectIncomeSources } from '@/lib/features/incomeSource/incomeSourceSlice'

interface Income {
    incomeId: number;
    name: string;
    amount: number;
    date: Date;
    accountName: string;
    incomeSourceName: string;
  }
interface IncomeSource {
    incomeSourceId: number;
    name: string;
    goal: number;
}
  
interface Account {
    accountId: number;
    name: string;
    startingBalance: number;
    type: number;
}
  
export default function Component() {

  const incomes = useAppSelector(selectIncomes)
  const incomeSources = useAppSelector(selectIncomeSources)
  const dispatch = useAppDispatch()

    const date = new Date();
    const [accountData,setAccountData] = useState<Account[]>([])
    const [selectedMonth, setSelectedMonth] = useState<Number>((new Date()).getMonth())
    const [selectedYear, setSelectedYear] = useState<Number>((new Date()).getFullYear())
    const [isIncomeSheetOpen, setIsIncomeSheetOpen] = useState(false)
    const [selectedIncome, setSelectedIncome] = useState<Income | null>(null)
    const [isIncomeSourceSheetOpen, setIsIncomeSourceSheetOpen] = useState(false)
    const [selectedIncomeSource, setSelectedIncomeSource] = useState<IncomeSource | null>(null)
    const { toast } = useToast()
  useEffect(() => {

    if(incomes.status === 'idle'){
      dispatch(fetchIncomes()).then(
        (Response)=>{
          console.log("fetchIncomes")
          console.log(Response.payload)
      })
    }

    AccountService.getAccount()
    .then((Response)=>{
      console.log("account name")
      console.log(Response.data)
      setAccountData(Response.data)
    }).catch( error =>{
      console.log(error);
      toast({
        variant: "destructive",
        duration:5000,
      title: "Uh oh! Something went wrong.",
      description: "There was a problem with fetching account data.",
      })
    })
  }, [dispatch,incomes.status]);

  useEffect(()=>{
    console.log('Use Effert')
    if(incomeSources.status === 'idle'){
      dispatch(fetchIncomeSources())
    }
  },[[dispatch,incomeSources.status]])

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

  const filteredIncome = incomes.incomes.filter(income => {
    const incomeDate = new Date(income.date)
    return incomeDate.getMonth() === parseInt(selectedMonth) && incomeDate.getFullYear() === parseInt(selectedYear)
  })

  const filteredIncomeSource = incomeSources.incomeSources.map(source => {
    const totalIncome = filteredIncome
      .filter(income => income.incomeSourceName === source.name)
      .reduce((sum, income) => sum + income.amount, 0)
    return {
      ...source,
      current: totalIncome,
      percentage: Math.round((totalIncome / source.goal) * 100)
    }
  })

  const years: number[] = Array.from(
    new Set(
        incomes.incomes.map(income => {
            const date = new Date(income.date); // Convert to Date object
            return date.getFullYear(); // Extract the year
        })
    )
);
 console.log(new Date())

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

  return (
    <>
    <NavBar/>
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">INCOME</CardTitle>
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
                    <SelectItem key={month.value} value={month.value}>{month.label}
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
              <Button variant="secondary" size="sm" onClick={() => openIncomeSheet()}>
                New
              </Button>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{months.find(m => m.value === selectedMonth)?.label} {selectedYear}</h3>
              {filteredIncome.map((income) => (
                <div key={income.incomeId} className="flex justify-between items-center cursor-pointer hover:bg-gray-700 p-2 rounded" onClick={() => openIncomeSheet(income)}>
                  <div className="flex items-center space-x-2">
                    <span>{income.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>₹ {income.amount}</span>
                    <span className="text-red-500">{income.accountName}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">INCOME SOURCE</CardTitle>
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
              <Button variant="secondary" size="sm" onClick={() => openIncomeSourceSheet()}>
                New
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {filteredIncomeSource.map((source) => (
                <Card key={source.incomeSourceId} className=" bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600" onClick={() => openIncomeSourceSheet(source)}>
                    <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <span>{source.name}</span>
                    </div>
                    <span>₹ {Math.round(source.current)} / ₹ {source.goal}</span>
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
      <IncomeSheet incomeSourceData={incomeSources.incomeSources} accountData={accountData} isOpen={isIncomeSheetOpen} onClose={closeIncomeSheet} incomeToEdit={selectedIncome} />
      <IncomeSourceSheet isOpen={isIncomeSourceSheetOpen} onClose={closeIncomeSourceSheet} incomeSourceToEdit={selectedIncomeSource} />
    </div>
    </>
  )
}

