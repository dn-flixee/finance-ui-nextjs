"use client"
import React, { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { format } from "date-fns"
import { zodResolver } from '@hookform/resolvers/zod'
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useAppDispatch } from '@/lib/hooks'
import { deleteExpense, saveExpense, updateExpense } from '@/lib/features/expense/expenseSlice'

interface Expense {
    expenseId: number;
    name: string;
    amount: number;
    date: Date;
    accountName: string;
    expenseSourceName: string;
  }
  
  interface Account {
    accountId: number;
    name: string;
    startingBalance: number;
    type: number;
  }
  
  interface ExpenseSource {
    expenseSourceId: number;
    name: string;
    budget: number;
  }

interface ExpenseSheetProps {
  expenseSourceData: ExpenseSource[];
  accountData: Account[];
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit: Expense | null;
}

function ExpenseSheet({ expenseSourceData, accountData, isOpen, onClose, expenseToEdit }: ExpenseSheetProps) {

  const dispatch = useAppDispatch();
  
  useEffect(() => {

    if (expenseToEdit) {
        form.setValue("amount", expenseToEdit.amount);
        form.setValue("name", expenseToEdit.name);
        form.setValue("accountName", expenseToEdit.accountName);
        form.setValue("expenseSourceName", expenseToEdit.expenseSourceName);
        form.setValue("date", expenseToEdit.date);
    } else {
        form.setValue("amount", 0);
        form.setValue("name", "");
        form.setValue("accountName", "");
        form.setValue("expenseSourceName","");
        form.setValue("date", new Date());
    }
  }, [expenseToEdit])

  const addExpense = z.object({
    amount: z.coerce.number().positive(),
    name: z.string().min(1).max(255),
    accountName: z.string().min(1).max(255),
    expenseSourceName: z.string().min(1).max(255),
    date: z.date({
        required_error: "Please select a date and time",
        invalid_type_error: "That's not a date!",
      })
  })

  const form = useForm<z.infer<typeof addExpense>>({
    resolver : zodResolver(addExpense),
  })

  function handleSubmit(values: z.infer<typeof addExpense>,) {
    console.log("save button press")

    if(expenseToEdit){
      dispatch(updateExpense({
        expenseId: expenseToEdit.expenseId,
        name: values.name,
        amount: values.amount,
        date: values.date,
        accountName: values.accountName,
        expenseSourceName: values.expenseSourceName,
      }))
    }else{
        dispatch(saveExpense(values));
    }
  }

  const removeExpense = () =>{
    if(expenseToEdit){
      dispatch(deleteExpense(expenseToEdit.expenseId))
    }
}
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-gray-900 text-white">
        <SheetHeader>
          <SheetTitle className="text-white">{expenseToEdit ? 'Edit Expense' : 'Add Expense'}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
                        <form id="expense-form" onSubmit={form.handleSubmit(handleSubmit)}>
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
                                      <SelectValue placeholder={expenseToEdit? expenseToEdit.accountName : "Account"} />
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
                                    name="expenseSourceName"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Expense Source</FormLabel>
                                        <Select onValueChange={field.onChange} >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder={expenseToEdit? expenseToEdit.expenseSourceName:"Expense Source"} />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                          {expenseSourceData && expenseSourceData.map((option,index) =>(
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

                        {/* Added conditional statement for delete to appear only on edit expense sheet */}

                         {expenseToEdit?<AlertDialog>
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
                              <AlertDialogAction onClick={removeExpense}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>:null}
                          <Button type='submit' className='mt-2'
                            form='expense-form'
                            >Submit</Button>
                            </SheetFooter>
                        </form>
                    </Form>
      </SheetContent>
    </Sheet>
  )
}
export default ExpenseSheet;