"use client"
import React,{useState,useEffect} from 'react'
import ExpenseService from '../../components/ExpenseService';
import Image from 'next/image';
import { Progress } from "@/components/ui/progress"
import { number, z } from 'zod';
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { toast, useToast } from '@/components/ui/use-toast';
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
import { Button } from "@/components/ui/button"
import ExpenseSourceService from '@/components/ExpenseSourceService';
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

interface ExpenseSourceCardProps {
  id: number;
  name: string;
  budget: number;
}

const ExpenseSourceCard : React.FC<ExpenseSourceCardProps> = ({id,name,budget})  => {

  const [expenseTotal, setExpenseTotal] = useState<number>();

  useEffect(() => {
    ExpenseService.fetchExpenseTotalById(id)
    .then((Response) => {
      console.log(Response.data)
      if(Response.data)
      setExpenseTotal(Response.data)
    }).catch(error => {
      console.log(error)
    })
  }, [])

  const { toast } = useToast()

  const updateExpenseSource = z.object({
    name: z.string().min(1).max(255),
    goal: z.coerce.number().positive()
  })

  

  const handleSubmit = (values: z.infer<typeof updateExpenseSource>) => {
    
    console.log("save button press")
    ExpenseSourceService.updateExpenseSource(id,values).then(Response => {
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
  }

  const deleteExpenseSource = () =>{
    ExpenseSourceService.deleteExpenseSource(id)
    .then(Response => {
      console.log(Response)
      toast({
        description: "Expense Source has been deleted",
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

  const form = useForm<z.infer<typeof updateExpenseSource>>({
    resolver : zodResolver(updateExpenseSource),
    defaultValues: {
        name: name,
        goal: 0,
    }
  })

  return (
    <>
    <Sheet>
                <SheetTrigger asChild>

                <div className="flex flex-col w-64 bg-primary text-white rounded-md">
                  <div className="flex flex-row m-2">
                    <div className='justify-start '>
                      <Image src="/expense_icon.png" width={25} height={25} alt='icon'/>  
                    </div>
                    <div className='ml-2'>{name}</div>
                  </div>

                  <div className='m-1 ml-2'><p>₹{expenseTotal} / ₹{budget}</p></div>
                  
                  <div className=" flex flex-nowrap items-center m-1">
                  <Progress value={(expenseTotal/budget*100).toFixed(2)}/>
                  {((expenseTotal/budget*100).toFixed(2) > 100)? 'Done': (expenseTotal/budget*100).toFixed(2)  + '%'}

                  </div>
              </div>

                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Update Expense</SheetTitle>
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
                        <AlertDialog>
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
                        </AlertDialog>

                        </SheetClose>
                    
                            <Button type='submit' className='mt-2'>Submit</Button>
                          </SheetFooter>
                          </form>
                      </Form>
                    
                </SheetContent>
                
              </Sheet>
    
        </>
  )
}

export default ExpenseSourceCard