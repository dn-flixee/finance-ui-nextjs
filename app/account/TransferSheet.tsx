'use client'
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Transfer {
    id: number;
    type: string;
    from: string;
    to: string;
    amount: number;
    date: string;
  }

export default function TransferSheet({ isOpen, onClose, transferToEdit = null }: { isOpen: boolean; onClose: () => void; transferToEdit: Transfer | null }) {
    const [type, setType] = useState(transferToEdit ? transferToEdit.type : '')
    const [from, setFrom] = useState(transferToEdit ? transferToEdit.from : '')
    const [to, setTo] = useState(transferToEdit ? transferToEdit.to : '')
    const [amount, setAmount] = useState(transferToEdit ? transferToEdit.amount.toString() : '')
    const [date, setDate] = useState(transferToEdit ? transferToEdit.date : '')
  
    useEffect(() => {
      if (transferToEdit) {
        setType(transferToEdit.type)
        setFrom(transferToEdit.from)
        setTo(transferToEdit.to)
        setAmount(transferToEdit.amount.toString())
        setDate(transferToEdit.date)
      } else {
        setType('')
        setFrom('')
        setTo('')
        setAmount('')
        setDate('')
      }
    }, [transferToEdit])
  
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
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Input id="type" value={type} onChange={(e) => setType(e.target.value)} className="bg-gray-800 text-white" />
            </div>
            <div>
              <Label htmlFor="from">From</Label>
              <Input id="from" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-gray-800 text-white" />
            </div>
            <div>
              <Label htmlFor="to">To</Label>
              <Input id="to" value={to} onChange={(e) => setTo(e.target.value)} className="bg-gray-800 text-white" />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-gray-800 text-white" />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-gray-800 text-white" />
            </div>
            <Button type="submit" className="w-full">Submit</Button>
          </form>
        </SheetContent>
      </Sheet>
    )
  }