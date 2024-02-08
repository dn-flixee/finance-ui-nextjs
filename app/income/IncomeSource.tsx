"use client"
import React,{useState,useEffect} from 'react'
import Image from 'next/image'
import { zodResolver } from "@hookform/resolvers/zod"
import IncomeSourceCard from './IncomeSourceCard'
import IncomeSourceService from '@/components/IncomeSourceService';
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
import { useForm } from 'react-hook-form';
import IncomeService from '@/components/IncomeService';
import { toast, useToast } from '@/components/ui/use-toast';

function IncomeSource() {

  const { toast } = useToast()

  const [incomeSourceCard,setIncomeSourceCard] = useState([])

  const [incomeSource, setIncomeSource] = useState({
    name:"",
    goal:"",
  })

  useEffect(() => {
    IncomeSourceService.getIncomeSource()
    .then((Response) => {
      console.log(Response.data)
      setIncomeSourceCard(Response.data)
    }).catch(error => {
      console.log(error)
      toast({
        description: "Unable to fetch the Income Source Data",
      })
    })
  }, [])

  const addIncomeSource = z.object({
    name: z.string().min(1).max(255),
    goal: z.coerce.number().positive()
  })

  function onSubmit(values: z.infer<typeof addIncomeSource>) {
    
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

  const form = useForm<z.infer<typeof addIncomeSource>>({
    resolver : zodResolver(addIncomeSource),
    defaultValues: {
        name: "",
        goal: 0,
    }
  })
  
  return (
    <div className='flex-1 border rounded-2xl border-primary m-6'>

        <div className='flex m-4'>
        <Image className='m-2' alt="wallet icon" src="/wallet_icon.png" width={25} height={25} />
          <p className="text-bold m-2 text-2xl text-primary">I N C O M E </p>
          <p className="text-bold m-2 text-2xl text-primary">S O U R C E</p>
        </div>

      <div className="container p-4">
       <div className="flex flex-row">
        <div className="flex flex-grow">
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
          <div className='flex'>

          <Sheet>
                <SheetTrigger asChild><Button className="bg-blue-600">New</Button></SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Add Income</SheetTitle>
                    <SheetDescription>
                    </SheetDescription>
                  </SheetHeader>

                          <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)}>
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


                            <Button type='submit' className='mt-2'>submit</Button>
                          </form>
                      </Form>

                </SheetContent>
              </Sheet>

          </div>
        </div>
        <hr className='mt-2 mb-8'/>
          <div className="flex flex-wrap gap-3 ">
            {incomeSourceCard.map( incomeSource =>(
            <IncomeSourceCard id={incomeSource.incomeSourceId} name={incomeSource.name} goal={incomeSource.goal} />
            ))}
          </div>
      </div>
      </div>
  )
}

export default IncomeSource