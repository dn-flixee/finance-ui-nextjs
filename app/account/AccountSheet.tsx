'use client'
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast, useToast } from '@/components/ui/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { deleteAccount, saveAccount, updateAccount } from '@/lib/features/account/accountSlice'
import { useAppDispatch } from '@/lib/hooks'
import { FinanceAccount } from '@/lib/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'


export default function AccountSheet({ isOpen, onClose, accountToEdit }: { isOpen: boolean; onClose: () => void; accountToEdit: FinanceAccount | null }) {

    const dispatch = useAppDispatch();

    useEffect(() => {
      if (accountToEdit) {
        form.setValue("name",accountToEdit.name)
        form.setValue("startingBalance",accountToEdit.startingBalance)
        form.setValue("type",accountToEdit.type)
      } else {
        form.setValue("name","")
        form.resetField("startingBalance")
        form.resetField("type")

      }
    }, [accountToEdit])

    const addAccount = z.object({
      name: z.string().min(1).max(255),
      startingBalance: z.coerce.number().min(0),
      type: z.coerce.number().int().min(1).max(2),
    })

    const form = useForm<z.infer<typeof addAccount>>({
      resolver : zodResolver(addAccount)
    })
  
    const handleSubmit = (values: z.infer<typeof addAccount>) => {
      console.log("save button press")

      if(accountToEdit){
        dispatch(updateAccount({
          accountId: accountToEdit.accountId,
          name: values.name,
          startingBalance: values.startingBalance,
          type: values.type
        }))
        }else{
          dispatch(saveAccount(values))
    }
  }

    const removeAccount = () =>{
      if(accountToEdit)
        dispatch(deleteAccount(accountToEdit.accountId))
  }
  
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-gray-900 text-white">
        <SheetHeader>
          <SheetTitle className="text-white">{accountToEdit ? 'Edit Account' : 'Add Account'}</SheetTitle>
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
              name="type"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Account Type" >
                            {field.value==1?<span className="font-medium">Debit Account</span>:
                            field.value==2?<span className="font-medium">Credit Account</span>:
                            <span className="font-medium">Select Account Type</span>}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                            <SelectItem key={1} value="1">
                              <div className="flex flex-col">
                                <span className="font-medium">Debit Account</span>
                              </div>
                            </SelectItem>
                            <SelectItem key={2} value="2">
                              <div className="flex flex-col">
                                <span className="font-medium">Credit Account</span>
                              </div>
                            </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField 
                    control={form.control}  
                    name="startingBalance" 
                    render={({field})=>{
                      return (<FormItem>
                        <FormLabel>Balance / Limit</FormLabel>
                        <FormControl>
                          <Input placeholder='balance' type='number' {...field}/>                   
                        </FormControl>
                        <FormMessage/>
                      </FormItem>);
                }}/>

              <SheetFooter>
              <SheetClose asChild>
                  {accountToEdit?<AlertDialog>
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
                      <AlertDialogAction onClick={removeAccount}>Continue</AlertDialogAction>
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