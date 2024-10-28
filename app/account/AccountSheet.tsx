'use client'
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Account {
    id: number;
    name: string;
    balance: number;
    icon: string;
  }

export default function AccountSheet({ isOpen, onClose, accountToEdit }: { isOpen: boolean; onClose: () => void; accountToEdit: Account | null }) {
    const [name, setName] = useState(accountToEdit ? accountToEdit.name : '')
    const [balance, setBalance] = useState(accountToEdit ? accountToEdit.balance.toString() : '')
    const [icon, setIcon] = useState(accountToEdit ? accountToEdit.icon : '')
  
    useEffect(() => {
      if (accountToEdit) {
        setName(accountToEdit.name)
        setBalance(accountToEdit.balance.toString())
        setIcon(accountToEdit.icon)
      } else {
        setName('')
        setBalance('')
        setIcon('')
      }
    }, [accountToEdit])
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      // Handle form submission here
      console.log({ name, balance, icon })
      onClose()
    }
  
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="bg-gray-900 text-white">
          <SheetHeader>
            <SheetTitle className="text-white">{accountToEdit ? 'Edit Account' : 'Add Account'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">Account Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-gray-800 text-white" />
            </div>
            <div>
              <Label htmlFor="balance">Balance</Label>
              <Input id="balance" type="number" value={balance} onChange={(e) => setBalance(e.target.value)} className="bg-gray-800 text-white" />
            </div>
            <div>
              <Label htmlFor="icon">Icon</Label>
              <Input id="icon" value={icon} onChange={(e) => setIcon(e.target.value)} className="bg-gray-800 text-white" />
            </div>
            <Button type="submit" className="w-full">Submit</Button>
          </form>
        </SheetContent>
      </Sheet>
    )
  }