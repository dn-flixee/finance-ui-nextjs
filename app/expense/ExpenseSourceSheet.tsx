"use client"
import React, { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { deleteExpenseSource, saveExpenseSource, updateExpenseSource } from '@/lib/features/expenseSource/expenseSourceSlice'
import { useAppDispatch } from '@/lib/hooks'

interface ExpenseSource {
    expenseSourceId: number;
    name: string;
    budget: number;
  }

interface ExpenseSourceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  expenseSourceToEdit: ExpenseSource | null;
}

function ExpenseSourceSheet({ isOpen, onClose, expenseSourceToEdit }: ExpenseSourceSheetProps) {

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (expenseSourceToEdit) {
        form.setValue("name", expenseSourceToEdit.name);
        form.setValue("budget", expenseSourceToEdit.budget);
    } else {
        form.setValue("name", "");
        form.setValue("budget", 0);
        
    }
  }, [expenseSourceToEdit])

  
  const addExpenseSource = z.object({
    name: z.string().min(1).max(255),
    budget: z.coerce.number().positive()
  })

  function handleSubmit(values: z.infer<typeof addExpenseSource>) {
      console.log("save button press")
      if(expenseSourceToEdit){
          dispatch(updateExpenseSource({
            expenseSourceId: expenseSourceToEdit.expenseSourceId,
            name: values.name,
            budget: values.budget
          }))
      }else{
          dispatch(saveExpenseSource(values))
      }
    
  }

  const form = useForm<z.infer<typeof addExpenseSource>>({
    resolver : zodResolver(addExpenseSource)
  })

  const removeExpenseSource = () =>{
    if(expenseSourceToEdit){
      dispatch(deleteExpenseSource(expenseSourceToEdit.expenseSourceId))
    }
}

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-gray-900 text-white">
        <SheetHeader>
          <SheetTitle className="text-white">{expenseSourceToEdit ? 'Edit Expense Source' : 'Add Expense Source'}</SheetTitle>
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
                              name="budget" 
                              render={({field})=>{
                                return (<FormItem>
                                  <FormLabel>Budget</FormLabel>
                                  <FormControl>
                                    <Input placeholder='budget' type='number' {...field}/>                   
                                  </FormControl>
                                  <FormMessage/>
                                </FormItem>);
                          }}/>

                    <SheetFooter>
                    <SheetClose asChild>
                        {expenseSourceToEdit?<AlertDialog>
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
                            <AlertDialogAction onClick={removeExpenseSource}>Continue</AlertDialogAction>
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
export default ExpenseSourceSheet;