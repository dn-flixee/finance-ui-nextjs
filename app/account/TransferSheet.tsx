'use client'
import React, { useEffect } from 'react'
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
import { deleteTransfer, saveTransfer, updateTransfer } from '@/lib/features/transfer/transferSlice'
import { useAppDispatch } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Transfer,FinanceAccount } from '@/lib/types'


  function TransferSheet({ isOpen, onClose, transferToEdit = null ,accountData}: { isOpen: boolean; onClose: () => void; transferToEdit: Transfer | null ; accountData : FinanceAccount[] | null}) {

    const dispatch = useAppDispatch()
  
    useEffect(() => {
      if (transferToEdit) {
        form.reset({
          name: transferToEdit.name,
          fromAccountId: transferToEdit.fromAccountId,
          toAccountId: transferToEdit.toAccountId,
          amount: transferToEdit.amount,
          date: new Date(transferToEdit.date) // Ensure it's a Date object
        });
        console.log(transferToEdit)
      } else {
        form.setValue("name","")
        form.setValue("fromAccountId","")
        form.setValue("toAccountId","")
        form.resetField("amount")
        form.setValue("date",new Date())
      }
    }, [transferToEdit]);

    const addTransfer = z.object({
      name: z.string().min(1).max(255),
      fromAccountId: z.string().min(1).max(255),
      toAccountId: z.string().min(1).max(255),
      amount: z.coerce.number().min(0),
      date: z.date({
          required_error: "Please select a date and time",
          invalid_type_error: "That's not a date!",
        })
    })
  
    const form = useForm<z.infer<typeof addTransfer>>({
      resolver : zodResolver(addTransfer),
    })
  
    function handleSubmit(values: z.infer<typeof addTransfer>,)  {
       console.log("save button press")
      
          if(transferToEdit){
            dispatch(updateTransfer({
              transferId: transferToEdit.transferId,
              name: values.name,
              amount: values.amount,
              fromAccountId: values.fromAccountId,
              toAccountId: values.toAccountId,
              date: values.date
            }))
          }else{
              dispatch(saveTransfer(values));
          }
    }

    const removeTranfer = () => {
      if(transferToEdit)
        dispatch(deleteTransfer(transferToEdit.transferId))
    }
  
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="bg-gray-900 text-white">
          <SheetHeader>
            <SheetTitle className="text-white">{transferToEdit ? 'Edit Transfer' : 'Add Transfer'}</SheetTitle>
          </SheetHeader>
          <Form {...form}>
                        <form id="transfer-form" onSubmit={form.handleSubmit(handleSubmit)}>
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
                            name="fromAccountId"
                            render={({ field }) => {
                              const selectedAccount = accountData?.find(account => account.accountId === field.value);
                              const displayValue = selectedAccount?.name || "";
                              console.log("dsa",field.value)
                              return(
                              <FormItem>
                                <FormLabel>Account From</FormLabel>
                                <Select onValueChange={field.onChange} 
                                value={field.value || ""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select Account">
                                        {displayValue && <span>{displayValue}</span>}
                                      </SelectValue>
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {accountData && accountData.map((option) => (
                                      <SelectItem key={option.accountId} value={option.accountId}>
                                        <div className="flex flex-col">
                                          <span className="font-medium">{option.name}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}}
                          />
                          <FormField
                            control={form.control}
                            name="toAccountId"
                            render={({ field }) => {
                              const selectedAccount = accountData?.find(account => account.accountId === field.value);
                              const displayValue = selectedAccount?.name || "";
                              console.log("dsa",field.value)
                              return(
                              <FormItem>
                                <FormLabel>Account To</FormLabel>
                                <Select onValueChange={field.onChange} 
                                value={field.value || ""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select Account">
                                        {displayValue && <span>{displayValue}</span>}
                                      </SelectValue>
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {accountData && accountData.map((option) => (
                                      <SelectItem key={option.accountId} value={option.accountId}>
                                        <div className="flex flex-col">
                                          <span className="font-medium">{option.name}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}}
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
                              <AlertDialogAction onClick={removeTranfer}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>:null}
                          <Button type='submit' className='mt-2'
                            form='transfer-form'
                            >Submit</Button>
                            </SheetFooter>
                        </form>
                    </Form>
        </SheetContent>
      </Sheet>
    )
  }

  export default TransferSheet;