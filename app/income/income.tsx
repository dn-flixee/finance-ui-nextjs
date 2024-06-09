'use client';
import IncomeCard from './IncomeCard';
import { useForm } from 'react-hook-form'
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


const addIncome = z.object({
  amount: z.coerce.number().positive(),
  name: z.string().min(1).max(255),
  accountName: z.string().min(1).max(255),
  incomeSourceName: z.string().min(1).max(255),
  date: myDateSchema
})



//Main Function
const IncomePage = () => {

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
  }, []);
  
  const form = useForm<z.infer<typeof addIncome>>({
    resolver : zodResolver(addIncome),
    defaultValues: {
        amount: 0,
        name: "",
        accountName: "",
        incomeSourceName: "",
        date: new Date()
    }
  });


  
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
    <>
    
      <div className='flex-1 border rounded-2xl border-primary m-6'>
        <div className='flex m-4'>
          <Image className='m-2' alt="wallet icon" src="/wallet_icon.png" width={25} height={25} />
          <p className="text-bold m-2 text-2xl text-primary"> I N C O M E</p>
        </div>

        <div className="container p-4">
          <div className="flex flex-row">
            <div className="flex flex-grow ">
              <div className="mr-2">
                <Select>
                  <SelectTrigger className="max-w-28">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="est">Jan</SelectItem>
                    <SelectItem value="cst">Feb</SelectItem>
                    <SelectItem value="mst">Mar</SelectItem>
                    <SelectItem value="pst">Apr</SelectItem>
                    <SelectItem value="akst">May</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mr-2">
                <Select>
                  <SelectTrigger className="max-w-28">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="est">2021</SelectItem>
                    <SelectItem value="cst">2022</SelectItem>
                    <SelectItem value="mst">2023</SelectItem>
                    <SelectItem value="pst">2024</SelectItem>
                    <SelectItem value="akst">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>


            <div className='flex '>

              <Sheet>
                <SheetTrigger asChild><Button className="bg-blue-600">New</Button></SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Add Income</SheetTitle>
                    <SheetDescription>
                    </SheetDescription>
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
                              render={({field})=>{
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



            </div>
          </div>
          <hr className='mt-2 mb-8' />
          <table></table>
          
          {incomeCard.map(income => (
              <IncomeCard 
                income={income}
                account={account} 
                incomeSource={incomeSource} 
                />
          ))}

        </div>
      </div>
    </>
  )
}

export default IncomePage
