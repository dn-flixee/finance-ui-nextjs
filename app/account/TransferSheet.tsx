'use client'
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle,SheetFooter } from "@/components/ui/sheet"
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover'
import { CalendarIcon } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'



interface Transfer {
    id: number;
    type: string;
    from: string;
    to: string;
    amount: number;
    date: string;
  }

  interface Account {
    accountId: number;
    name: string;
    startingBalance: number;
    type: number;
  }

export default function TransferSheet({ isOpen, onClose, transferToEdit = null,accountData }: { isOpen: boolean; onClose: () => void; transferToEdit: Transfer | null }) {
    const [type, setType] = useState(transferToEdit ? transferToEdit.type : '')
    const [from, setFrom] = useState(transferToEdit ? transferToEdit.from : '')
    const [to, setTo] = useState(transferToEdit ? transferToEdit.to : '')
    const [amount, setAmount] = useState(transferToEdit ? transferToEdit.amount : '')
    const [date, setDate] = useState(transferToEdit ? transferToEdit.date : '')
  
    useEffect(() => {
      if (transferToEdit) {
        setType(transferToEdit.type)
        setFrom(transferToEdit.from)
        setTo(transferToEdit.to)
        setAmount(transferToEdit.amount)
        setDate(transferToEdit.date)
      } else {
        setType('')
        setFrom('')
        setTo('')
        setAmount('')
        setDate('')
      }
    }, [transferToEdit])

    const addTransfer = z.object({
      type: z.string().min(1).max(255),
      from: z.string().min(1).max(255),
      to: z.string().min(1).max(255),
      amount: z.coerce.number().positive(),
      date: z.date({
          required_error: "Please select a date and time",
          invalid_type_error: "That's not a date!",
        })
    })
  
    const form = useForm<z.infer<typeof addTransfer>>({
      resolver : zodResolver(addTransfer),
    })
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      // Handle form submission here
      console.log({ type, from, to, amount, date })
      onClose()
    }
  
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="bg-gray-900 text-white">
          <SheetHeader>
            <SheetTitle className="text-white">{transferToEdit ? 'Edit Transfer' : 'Add Transfer'}</SheetTitle>
          </SheetHeader>
          <Form {...form}>
                        <form id="income-form" onSubmit={form.handleSubmit(handleSubmit)}>
                          <FormField 
                              control={form.control}  
                              name="type" 
                              render={({field})=>{
                                return (<FormItem>
                                  <FormLabel>Type</FormLabel>
                                  <FormControl>
                                    <Input placeholder='type' type='text' {...field}/>                   
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
                            name="from"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account</FormLabel>
                                <Select onValueChange={field.onChange} >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={transferToEdit? transferToEdit.from : "Account"} />
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
                                              <SelectValue placeholder={transferToEdit? transferToEdit.incomeSourceName:"Income Source"} />
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

                         {transferToEdit?<AlertDialog>
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
                              <AlertDialogAction onClick={deleteTransfer}>Continue</AlertDialogAction>
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