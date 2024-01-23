'use client';
import IncomeCard from './IncomeCard';
import { useForm, Controller } from 'react-hook-form'
import Image from 'next/image';
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Sheet,
  SheetClose,
  SheetFooter,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { z } from 'zod';
import AddIncomeBar from './income'
import IncomeSourceService from '@/components/IncomeSourceService';
import IncomeService from '@/components/IncomeService';
import AccountService from '@/components/AccountService';
import { useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"



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

const myDateSchema = z.date({
  required_error: "Please select a date and time",
  invalid_type_error: "That's not a date!",
});



const YourPage = () => {
  // Use the fetched data in your component

  const [incomeCard,setIncomeCard] = useState<Income[]>([])
  const [account,setAccount] = useState<Account[]>([])
  const [incomeSource,setIncomeSource] = useState<IncomeSource[]>([])

  useEffect(() => {
    IncomeService.getIncome()
    .then((Response) => {
      console.log(Response.data)
      setIncomeCard(Response.data)
    }).catch(error => {
      console.log(error)
    })

    IncomeSourceService.getIncomeSource()
    .then((Response)=>{
      console.log("source name")
      console.log(Response.data)
      setIncomeSource(Response.data)
    }).catch( error =>{
      console.log(error);
    })

    AccountService.getAccount()
    .then((Response)=>{
      console.log("account name")
      console.log(Response.data)
      setAccount(Response.data)
    }).catch( error =>{
      console.log(error);
    })
  }, [])

  function formSubmit(values: z.infer<typeof addIncome>) {
    console.log("save button press")

  }

  const addIncome = z.object({
    amount: z.string().min(1).max(255),
    name: z.string().min(1).max(255),
    accountName: z.string().min(1).max(255),
    incomeSourceName: z.string().min(1).max(255),
  })
  
  const form = useForm<z.infer<typeof addIncome>>({
    resolver : zodResolver(addIncome),
    defaultValues: {
        amount: "",
        name: "",
        accountName: "",
        incomeSourceName: "",

    }
  })
 
  return (
    
    <div>
                    <Form {...form}>
                        <form id="income-form" onSubmit={form.handleSubmit(formSubmit)}>
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
                            name="accountName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account</FormLabel>
                                <Select onValueChange={field.onChange} >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Account" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {account && account.map((option,index) => (
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
                                              <SelectValue placeholder="Income Source" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                          {incomeSource && incomeSource.map((option,index) =>(
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
                                <FormLabel>Date </FormLabel>
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

                          <Button type='submit' className='mt-2'
                            form='income-form'
                            >Submit</Button>
                        </form>
                    </Form>

{/* <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form> */}
      
    </div>
  );
 }


export default YourPage;
