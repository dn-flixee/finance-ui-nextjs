"use client"
import React, { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import IncomeSourceService from '@/components/IncomeSourceService'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/components/ui/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

interface IncomeSource {
    incomeSourceId: number;
    name: string;
    goal: number;
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
    if(incomeSourceToEdit)
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
export default IncomeSourceSheet;