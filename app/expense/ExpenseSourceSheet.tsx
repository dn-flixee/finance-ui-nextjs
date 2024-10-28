"use client"
import React, { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import ExpenseSourceService from '@/components/ExpenseSourceService'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/components/ui/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

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
    
    if(expenseSourceToEdit){
        console.log("save button press")
        ExpenseSourceService.updateExpenseSource(expenseSourceToEdit.expenseSourceId,values).then(Response => {
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
        ExpenseSourceService.saveExpenseSource(values).then(Response => {
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

  const form = useForm<z.infer<typeof addExpenseSource>>({
    resolver : zodResolver(addExpenseSource)
  })

  const deleteExpenseSource = () =>{
    if(expenseSourceToEdit)
    ExpenseSourceService.deleteExpenseSource(expenseSourceToEdit.expenseSourceId)
    .then(Response => {
      console.log(Response)
      toast({
        description: "Expense Source has been deleted",
      })
    })
    .catch(error =>{
        if(error.response.data.message == "Database Error"){
            console.log(error)
            toast({
                variant: "destructive",
                duration:5000,
                title: "Uh oh! Something went wrong.",
                description: "Can't delete the expense source because there are expenses connected to expense source.",
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
                            <AlertDialogAction onClick={deleteExpenseSource}>Continue</AlertDialogAction>
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