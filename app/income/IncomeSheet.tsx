"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import IncomeService from '@/components/IncomeService'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { format } from "date-fns"
import { zodResolver } from '@hookform/resolvers/zod'
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { CalendarIcon } from 'lucide-react'
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

  const addIncome = z.object({
    amount: z.coerce.number().positive(),
    name: z.string().min(1).max(255),
    accountName: z.string().min(1).max(255),
    incomeSourceName: z.string().min(1).max(255),
    date: z.date({
        required_error: "Please select a date and time",
        invalid_type_error: "That's not a date!",
      })
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
    if(incomeToEdit)
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
export default IncomeSheet;