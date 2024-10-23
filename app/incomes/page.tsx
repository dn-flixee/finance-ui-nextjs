"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import IncomeService from '@/components/IncomeService'
import IncomeSourceService from '@/components/IncomeSourceService'
import AccountService from '@/components/AccountService'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { format } from "date-fns"
import { zodResolver } from '@hookform/resolvers/zod'
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { CalendarIcon, ChevronDown } from 'lucide-react'


interface Income {
    incomeId: number;
    name: string;
    amount: number;
    date: Date;
    accountName: string;
    incomeSourceName: string;
  }
  
  interface Account {
    accountId: number;
    name: string;
    startingBalance: number;
    type: number;
  }
  
  interface IncomeSource {
    incomeSource: number;
    name: string;
    goal: number;
  }

interface IncomeSheetProps {
  incomeSourceData: IncomeSource[];
  accountData: Account[];
  isOpen: boolean;
  onClose: () => void;
  incomeToEdit: Income | null;
}

function IncomeSheet({ incomeSourceData, accountData, isOpen, onClose, incomeToEdit }: IncomeSheetProps) {
    
  useEffect(() => {

    if (incomeToEdit) {
        form.setValue("amount", incomeToEdit.amount);
        form.setValue("name", incomeToEdit.name);
        form.setValue("accountName", incomeToEdit.accountName);
        form.setValue("incomeSourceName", incomeToEdit.incomeSourceName);
        form.setValue("date", incomeToEdit.date);
    } else {
        form.setValue("amount", 0);
        form.setValue("name", "");
        form.setValue("accountName", "");
        form.setValue("incomeSourceName","");
        form.setValue("date", new Date());
    }
  }, [incomeToEdit])

  const myDateSchema = z.date({
    required_error: "Please select a date and time",
    invalid_type_error: "That's not a date!",
  });

  const addIncome = z.object({
    amount: z.coerce.number().positive(),
    name: z.string().min(1).max(255),
    accountName: z.string().min(1).max(255),
    incomeSourceName: z.string().min(1).max(255),
    date: myDateSchema
  })

  const form = useForm<z.infer<typeof addIncome>>({
    resolver : zodResolver(addIncome),
  })

  function handleSubmit(values: z.infer<typeof addIncome>) {
    console.log("save button press")
    IncomeService.saveIncome(values).then(Response => {
      console.log(Response)
      toast({
        description: "Your Input has been saved",
      })
    }).catch(error => {
      console.log(error)
      toast({
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      })
    })
  };

  const { toast } = useToast()

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-gray-900 text-white">
        <SheetHeader>
          <SheetTitle className="text-white">{incomeToEdit ? 'Edit Income' : 'Add Income'}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
                        <form id="income-form" onSubmit={form.handleSubmit(handleSubmit)}>
                          <FormField 
                              control={form.control}  
                              name="name" 
                              render={({field})=>{
                                return (<FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder='name' type='text' {...field}/>                   
                                  </FormControl>
                                  <FormMessage/>
                                </FormItem>);
                          }}/>

                            <FormField 
                              control={form.control}  
                              name="amount" 
                              render={({ field})=>{
                                return (<FormItem>
                                  <FormLabel>Amount</FormLabel>
                                  <FormControl>
                                    <Input placeholder='amount' type='number' {...field}/>                   
                                  </FormControl>
                                  <FormMessage/>
                                </FormItem>);
                          }}/>
                          
                          
                          <FormField
                            control={form.control}
                            name="accountName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account</FormLabel>
                                <Select onValueChange={field.onChange} >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={incomeToEdit? incomeToEdit.accountName : "Account"} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {accountData && accountData.map((option,index) => (
                                      <SelectItem key={index} value={option.name}>{option.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                                    control={form.control}
                                    name="incomeSourceName"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Income Source</FormLabel>
                                        <Select onValueChange={field.onChange} >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder={incomeToEdit? incomeToEdit.incomeSourceName:"Income Source"} />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                          {incomeSourceData && incomeSourceData.map((option,index) =>(
                                        <SelectItem key={index} value={option.name}>{option.name}</SelectItem>
                                      ))}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                          
                          
                          <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className=' mt-2'>Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-[240px] pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange} 
                                      disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                         <SheetFooter>
                          <Button type='submit' className='mt-2'
                            form='income-form'
                            >Submit</Button>
                            </SheetFooter>
                        </form>
                    </Form>
      </SheetContent>
    </Sheet>
  )
}

interface IncomeSourceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  sourceToEdit: IncomeSource | null;
}

function IncomeSourceSheet({ isOpen, onClose, sourceToEdit }: IncomeSourceSheetProps) {
  const [name, setName] = useState(sourceToEdit ? sourceToEdit.name : '')
  const [goal, setGoal] = useState(sourceToEdit ? sourceToEdit.goal.toString() : '')

  useEffect(() => {
    if (sourceToEdit) {
        setName(sourceToEdit.name)
        setGoal(sourceToEdit.goal.toString())
    } else {
      setName('')
      setGoal('')
    }
  }, [sourceToEdit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log({ name, goal })
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-gray-900 text-white">
        <SheetHeader>
          <SheetTitle className="text-white">{sourceToEdit ? 'Edit Income Source' : 'Add Income Source'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="source">Income Source</Label>
            <Input id="source" value={name} onChange={(e) => setName(e.target.value)} className="bg-gray-800 text-white" />
          </div>
          <div>
            <Label htmlFor="target">Target Amount</Label>
            <Input id="target" type="number" value={goal} onChange={(e) => setGoal(e.target.value)} className="bg-gray-800 text-white" />
          </div>
          <Button type="submit" className="w-full">Submit</Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default function Component() {

    const [incomeData,setIncomeData] = useState<Income[]>([])
    const [accountData,setAccountData] = useState<Account[]>([])
    const [incomeSourceData,setIncomeSourceData] = useState<IncomeSource[]>([])
    const [selectedMonth, setSelectedMonth] = useState('11')
    const [selectedYear, setSelectedYear] = useState('2024')
    const [isIncomeSheetOpen, setIsIncomeSheetOpen] = useState(false)
    const [selectedIncome, setSelectedIncome] = useState<Income | null>(null)
    const [isIncomeSourceSheetOpen, setIsIncomeSourceSheetOpen] = useState(false)
    const [selectedIncomeSource, setSelectedIncomeSource] = useState<IncomeSource | null>(null)

  useEffect(() => {
    IncomeService.getIncome()
    .then((Response) => {
      console.log(Response.data)
      setIncomeData(Response.data)
    }).catch(error => {
      console.log(error)
    })

    IncomeSourceService.getIncomeSource()
    .then((Response)=>{
      console.log("source name")
      console.log(Response.data)
      setIncomeSourceData(Response.data)
    }).catch( error =>{
      console.log(error);
    })

    AccountService.getAccount()
    .then((Response)=>{
      console.log("account name")
      console.log(Response.data)
      setAccountData(Response.data)
    }).catch( error =>{
      console.log(error);
    })
  }, []);

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

  const filteredIncome = incomeData.filter(income => {
    const incomeDate = new Date(income.date)
    return incomeDate.getMonth() + 1 === parseInt(selectedMonth) && incomeDate.getFullYear() === parseInt(selectedYear)
  })

  const filteredIncomeSource = incomeSourceData.map(source => {
    const totalIncome = filteredIncome
      .filter(income => income.incomeSourceName === source.name)
      .reduce((sum, income) => sum + income.amount, 0)
    return {
      ...source,
      current: totalIncome,
      percentage: Math.round((totalIncome / source.goal) * 100)
    }
  })

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ]

  const years = ['2023', '2024', '2025']

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-green-700 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg
            className="h-6 w-6 text-white"
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
          <h1 className="text-xl font-bold">HOME</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@username" />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          <span>UserName</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </header>
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
            <div className="space-y-4">
              {filteredIncomeSource.map((source) => (
                <div key={source.incomeSource} className="bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600" onClick={() => openIncomeSourceSheet(source)}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <span>{source.name}</span>
                    </div>
                    <span>₹ {source.current} / ₹ {source.goal}</span>
                  </div>
                  <Progress value={source.percentage} className="h-2" />
                  <div className="text-right text-sm text-gray-400 mt-1">{source.percentage}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      <IncomeSheet incomeSourceData={incomeSourceData} accountData={accountData} isOpen={isIncomeSheetOpen} onClose={closeIncomeSheet} incomeToEdit={selectedIncome} />
      <IncomeSourceSheet isOpen={isIncomeSourceSheetOpen} onClose={closeIncomeSourceSheet} sourceToEdit={selectedIncomeSource} />
    </div>
  )
}