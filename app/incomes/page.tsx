"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'


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
    incomeSourceId: number;
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

  function handleSubmit(values: z.infer<typeof addIncome>,) {
    console.log("save button press")

    if(incomeToEdit){
        IncomeService.updateIncome(incomeToEdit.incomeId,values).then(Response => {
            console.log(Response)
            toast({
              description: "Your Input has been saved",
            })
          }).catch(error => {
            console.log(error)
            toast({
                variant: "destructive",
                duration:5000,
              title: "Uh oh! Something went wrong.",
              description: "There was a problem with your request.",
            })
          })
    }else{
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
    }
    
  }

  const deleteIncome = () =>{
    IncomeService.deleteIncome(incomeToEdit.incomeId)
    .then(Response => {
      console.log(Response)
      toast({
        description: "Income has been deleted",
      })
    })          
    .catch(error =>{
      console.log(error)
      toast({
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      })
    })
}
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

                        {/* Added conditional statement for delete to appear only on edit income sheet */}

                         {incomeToEdit?<AlertDialog>
                          <AlertDialogTrigger>
                          <Button className='mt-2' variant="destructive" type="button">Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your account
                                and remove your data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={deleteIncome}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>:null}
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
  incomeSourceToEdit: IncomeSource | null;
}

function IncomeSourceSheet({ isOpen, onClose, incomeSourceToEdit }: IncomeSourceSheetProps) {

  useEffect(() => {
    if (incomeSourceToEdit) {
        form.setValue("name", incomeSourceToEdit.name);
        form.setValue("goal", incomeSourceToEdit.goal);
    } else {
        form.setValue("name", "");
        form.setValue("goal", 0);
        
    }
  }, [incomeSourceToEdit])

  
  const addIncomeSource = z.object({
    name: z.string().min(1).max(255),
    goal: z.coerce.number().positive()
  })

  function handleSubmit(values: z.infer<typeof addIncomeSource>) {
    
    if(incomeSourceToEdit){
        console.log("save button press")
        IncomeSourceService.updateIncomeSource(incomeSourceToEdit.incomeSourceId,values).then(Response => {
        console.log(Response)
        toast({
            description: "Your Input has been updated",
        })
        }).catch(error => {
        console.log(error)
        toast({
            title: "Uh oh! Something went wrong.",
            description: "There was a problem with your request.",
            })
        })
        console.log(values)

        
        }else{
        console.log("save button press")
        IncomeSourceService.saveIncomeSource(values).then(Response => {
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
        console.log(values)
        }

    }

  const form = useForm<z.infer<typeof addIncomeSource>>({
    resolver : zodResolver(addIncomeSource)
  })

  const deleteIncomeSource = () =>{
    IncomeSourceService.deleteIncomeSource(incomeSourceToEdit.incomeSourceId)
    .then(Response => {
      console.log(Response)
      toast({
        description: "Income Source has been deleted",
      })
    })
    .catch(error =>{

        if(error.response.data.message == "Database Error"){
            console.log(error)
            toast({
                variant: "destructive",
                duration:5000,
                title: "Uh oh! Something went wrong.",
                description: "Can't delete the income source because there are incomes connected to income source.",
            })
        }
        else{
            console.log(error)
            toast({
                variant: "destructive",
                duration:5000,
              title: "Uh oh! Something went wrong.",
              description: "There was a problem with your request.",
            })}
      
    })
}

  const { toast } = useToast()
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-gray-900 text-white">
        <SheetHeader>
          <SheetTitle className="text-white">{incomeSourceToEdit ? 'Edit Income Source' : 'Add Income Source'}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
                          <form onSubmit={form.handleSubmit(handleSubmit)}>
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
                              name="goal" 
                              render={({field})=>{
                                return (<FormItem>
                                  <FormLabel>Goal</FormLabel>
                                  <FormControl>
                                    <Input placeholder='goal' type='number' {...field}/>                   
                                  </FormControl>
                                  <FormMessage/>
                                </FormItem>);
                          }}/>

                    <SheetFooter>
                    <SheetClose asChild>
                        {incomeSourceToEdit?<AlertDialog>
                        <AlertDialogTrigger>
                        <Button className='mt-2' variant="destructive" type='button'>Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your account
                              and remove your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={deleteIncomeSource}>Continue</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>:null}

                        </SheetClose>
                    
                            <Button type='submit' className='mt-2'>Submit</Button>
                          </SheetFooter>
                          </form>
                      </Form>
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
    const { toast } = useToast()
  useEffect(() => {
    IncomeService.getIncome()
    .then((Response) => {
      console.log(Response.data)
      setIncomeData(Response.data)
    }).catch(error => {
      console.log(error)
      toast({
        variant: "destructive",
        duration:5000,
      title: "Uh oh! Something went wrong.",
      description: "There was a problem with fetching income data.",
      })
    })

    IncomeSourceService.getIncomeSource()
    .then((Response)=>{
      console.log("source name")
      console.log(Response.data)
      setIncomeSourceData(Response.data)
    }).catch( error =>{
      console.log(error)
      toast({
        variant: "destructive",
        duration:5000,
      title: "Uh oh! Something went wrong.",
      description: "There was a problem with fetching income source data.",
      })
    })

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
                <div key={source.incomeSourceId} className="bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600" onClick={() => openIncomeSourceSheet(source)}>
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
      <IncomeSourceSheet isOpen={isIncomeSourceSheetOpen} onClose={closeIncomeSourceSheet} incomeSourceToEdit={selectedIncomeSource} />
    </div>
  )
}