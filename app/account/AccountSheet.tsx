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

interface Account {
    accountId: number;
    name: string;
    balance: number;
  }

export default function AccountSheet({ isOpen, onClose, accountToEdit }: { isOpen: boolean; onClose: () => void; accountToEdit: Account | null }) {
    const [name, setName] = useState(accountToEdit ? accountToEdit.name : '')
    const [balance, setBalance] = useState(accountToEdit ? accountToEdit.balance : '')
  
    useEffect(() => {
      if (accountToEdit) {
        setName(accountToEdit.name)
        setBalance(accountToEdit.balance)
      } else {
        setName('')
        setBalance('')
      }
    }, [accountToEdit])

    const addAccount = z.object({
      name: z.string().min(1).max(255),
      balance: z.coerce.number().positive()
    })

    const form = useForm<z.infer<typeof addAccount>>({
      resolver : zodResolver(addAccount)
    })
  
    const handleSubmit = (values: z.infer<typeof addAccount>) => {
      if(accountToEdit){
        console.log("save button press")
        AccountService.updateAccount(accountToEdit.accountId,values).then(Response => {
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
        AccountService.saveAccount(values).then(Response => {
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

    const deleteAccount = () =>{
      if(accountToEdit)
      AccountService.deleteAccount(accountToEdit.accountId)
      .then(Response => {
        console.log(Response)
        toast({
          description: "Account has been deleted",
        })
      })
      .catch(error =>{
          if(error.response.data.message == "Database Error"){
              console.log(error)
              toast({
                  variant: "destructive",
                  duration:5000,
                  title: "Uh oh! Something went wrong.",
                  description: "Can't delete the account because there are other items connected to this account.",
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
                              name="balance" 
                              render={({field})=>{
                                return (<FormItem>
                                  <FormLabel>Balance</FormLabel>
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
                            <AlertDialogAction onClick={deleteAccount}>Continue</AlertDialogAction>
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