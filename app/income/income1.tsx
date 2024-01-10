"use client" 
import React from 'react'
import { TypeOf, z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { add } from 'date-fns';

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

  const INCOME_SOURCE_API_BASE_URL = "http://localhost:8082/api/v1/incomeSource";
  async function getIncomeSource() {
    const res = await fetch(INCOME_SOURCE_API_BASE_URL, {
      cache: 'no-cache',
      next: {
        revalidate: 30
      }
    })
    return await res.json();
  }
  
  const addIncome = z.object({
    amount: z.number().positive(),
    name: z.string().min(1).max(255),
    account: z.number().nonnegative(),
    income_source: z.number().nonnegative()
  })
  const handleSubmit = () => {

  }

 async function income1() {

    const form = useForm<z.infer<typeof addIncome>>({
        resolver : zodResolver(addIncome),
        defaultValues: {
            amount: 0,
            name: "",
            account: 0,
            income_source: 0,
        }
    });
    const incomeSource = getIncomeSource()
  
  return (
    <div className='flex flex-auto'>

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
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a fruit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Income Source</SelectLabel>
                    {
                      incomeSource.map((option,index)=>(
                        <SelectItem value={option.name} key={index}>{option.name}</SelectItem>
                      ))
                    }
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button type='submit' >submit</Button>
            </form>
        </Form>
      
    </div>
  )
}
export default income1
