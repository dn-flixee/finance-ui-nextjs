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
import AccountService from '@/components/AccountService'
import { deleteAccount, saveAccount, updateAccount } from '@/lib/features/account/accountSlice'
import { useAppDispatch } from '@/lib/hooks'

interface Account {
    accountId: number;
    name: string;
    startingBalance: number;
  }

export default function AccountSheet({ isOpen, onClose, accountToEdit }: { isOpen: boolean; onClose: () => void; accountToEdit: Account | null }) {

    const dispatch = useAppDispatch();

    useEffect(() => {
      if (accountToEdit) {
        form.setValue("name",accountToEdit.name)
        form.setValue("startingBalance",accountToEdit.startingBalance)
      } else {
        form.setValue("name","")
        form.setValue("startingBalance",0)
      }
    }, [accountToEdit])

    const addAccount = z.object({
      name: z.string().min(1).max(255),
      startingBalance: z.coerce.number().positive()
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
          startingBalance: values.startingBalance
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
          <SheetTitle className="text-white">{accountToEdit ? 'Edit Income Source' : 'Add Income Source'}</SheetTitle>
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
                              name="startingBalance" 
                              render={({field})=>{
                                return (<FormItem>
                                  <FormLabel>Starting Balance</FormLabel>
                                  <FormControl>
                                    <Input placeholder='balane' type='number' {...field}/>                   
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