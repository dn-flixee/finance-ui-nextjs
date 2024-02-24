
import React, { useState } from 'react'
import IncomeService from '../../components/IncomeService'
import Image from 'next/image'
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
  Sheet,
  SheetClose,
  SheetFooter,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


import { format, set } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
 
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';

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
interface IncomeCardProps {
  income: Income;
  account: Account[];
  incomeSource: IncomeSource[];
}

const myDateSchema = z.date({
  required_error: "Please select a date and time",
  invalid_type_error: "That's not a date!",
});

const updateIncome = z.object({
  amount: z.number().positive(),
  name: z.string().min(1).max(255),
  accountName: z.string().min(1).max(255),
  incomeSourceName: z.string().min(1).max(255),
  date: myDateSchema
})

const IncomeCard: React.FC<IncomeCardProps> = ({
  income,
  account,
  incomeSource
}) => {

  const { toast } = useToast()

  const form = useForm<z.infer<typeof updateIncome>>({
    resolver : zodResolver(updateIncome),
    defaultValues: {
        amount: income.amount,
        name: income.name,
        accountName: income.accountName,
        incomeSourceName: income.incomeSourceName,
        date: income.date
    }
  })

  const handleSubmit = (value: z.infer<typeof updateIncome>) => {
    console.log("Update button press")
    IncomeService.updateIncome(income.incomeId,value).then(Response => {
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

  const deleteIncome = () =>{
    IncomeService.deleteIncome(income.incomeId)
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
  
  return (
    <>
    
    <Sheet>
  <SheetTrigger className='w-full'>
    
  <div className='flex flex-row justify-between rounded-md h-10 p-2 mb-2'>
        <div className='flex basis-3/5'>
            <Image src="/income_icon.png" width={25} height={25} alt="income icon"/>
            <p className='font-semibold p-1'>{income.name}</p>
        </div>
        <div className='p-1 flex basis-1/5 justify-start'>
          <p className='font-semibold'>₹{income.amount}</p>
        </div>
        <div className='flex  basis-1/5 justify-end'>
            
            <div className='pr-1'><img src="/bank_icon.png" width={25} height={25}></img></div>
            <div className='p-1'><p className='font-semibold'>{income.accountName}</p></div>
        </div>
    </div>

  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Edit Income</SheetTitle>
      <SheetDescription>
      </SheetDescription>
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
                                      <SelectValue placeholder={income.accountName} />
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
                                              <SelectValue placeholder={income.incomeSourceName} />
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
                         <SheetClose asChild>

                         <AlertDialog>
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
                        </AlertDialog>

                         </SheetClose>
                          <Button type='submit' className='mt-2'>Update</Button>
                          
                            </SheetFooter>
                        </form>
                    </Form>


  </SheetContent>
</Sheet>
</>
    
  )
}

export default IncomeCard