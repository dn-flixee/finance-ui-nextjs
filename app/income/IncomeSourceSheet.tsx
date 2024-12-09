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
import { deleteIncomeSource, saveIncomeSource, updateIncomeSource } from '@/lib/features/incomeSource/incomeSourceSlice'
import { useAppDispatch } from '@/lib/hooks'

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

  const dispatch = useAppDispatch();
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
    console.log("save button press")
    if(incomeSourceToEdit){
        dispatch(updateIncomeSource({
          incomeSourceId: incomeSourceToEdit.incomeSourceId,
          name: values.name,
          goal: values.goal
        }))
        }else{
          dispatch(saveIncomeSource(values))
        }
    }

  const form = useForm<z.infer<typeof addIncomeSource>>({
    resolver : zodResolver(addIncomeSource)
  })

  const removeIncomeSource = () =>{
    if(incomeSourceToEdit)
      dispatch(deleteIncomeSource(incomeSourceToEdit.incomeSourceId))
}

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
                            <AlertDialogAction onClick={removeIncomeSource}>Continue</AlertDialogAction>
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