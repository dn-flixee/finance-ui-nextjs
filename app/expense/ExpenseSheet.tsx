// src/app/(dashboard)/expenses/ExpenseSheet.tsx
"use client"
import React, { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/components/ui/use-toast'
import { useAppDispatch } from '@/lib/hooks'
import { createExpense, updateExpense, deleteExpense } from '@/lib/features/expense/expenseSlice'
import { Expense, ExpenseSource, FinanceAccount } from '@/lib/types'
import { Trash2, Loader2 } from 'lucide-react'

interface ExpenseSheetProps {
  expenseSourceData: ExpenseSource[]
  accountData: FinanceAccount[]
  isOpen: boolean
  onClose: () => void
  expenseToEdit?: Expense | null
}

export default function ExpenseSheet({
  expenseSourceData,
  accountData,
  isOpen,
  onClose,
  expenseToEdit
}: ExpenseSheetProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: '',
    accountId: '',
    expenseSourceId: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (expenseToEdit) {
        setFormData({
          name: expenseToEdit.name,
          amount: expenseToEdit.amount.toString(),
          date: new Date(expenseToEdit.date).toISOString().split('T')[0],
          accountId: expenseToEdit.accountId,
          expenseSourceId: expenseToEdit.expenseSourceId || ''
        })
      } else {
        setFormData({
          name: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          accountId: '',
          expenseSourceId: ''
        })
      }
    }
  }, [isOpen, expenseToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const expenseData = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString(),
      accountId: formData.accountId,
      expenseSourceId: formData.expenseSourceId === 'none' ? undefined : formData.expenseSourceId
    }
  

      if (expenseToEdit) {
        await dispatch(updateExpense({
          expenseId: expenseToEdit.expenseId,
          ...expenseData
        })).unwrap()
      } else {
        await dispatch(createExpense(expenseData)).unwrap()
      }

      onClose()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${expenseToEdit ? 'update' : 'create'} expense`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!expenseToEdit) return

    setIsDeleting(true)
    try {
      await dispatch(deleteExpense(expenseToEdit.expenseId)).unwrap()
      onClose()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete expense",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-gray-900 border-gray-700 text-white">
        <SheetHeader>
          <SheetTitle className="text-white">
            {expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {expenseToEdit ? 'Update your expense details' : 'Add a new expense entry'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <Label htmlFor="name" className="text-white">Expense Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Groceries, Gas"
              required
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="amount" className="text-white">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
              required
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="date" className="text-white">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="account" className="text-white">Account</Label>
            <Select
              value={formData.accountId}
              onValueChange={(value) => setFormData({...formData, accountId: value})}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {accountData.map((account) => (
                  <SelectItem key={account.accountId} value={account.accountId}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="source" className="text-white">Category (Optional)</Label>
            <Select
              value={formData.expenseSourceId}
              onValueChange={(value) => setFormData({...formData, expenseSourceId: value})}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="none">
                  <span className="text-gray-400 italic">No category</span>
                </SelectItem>
                {expenseSourceData.map((source) => (
                  <SelectItem key={source.expenseSourceId} value={source.expenseSourceId}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>

          <div className="flex gap-2 pt-4">
            {expenseToEdit && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting || isLoading}
                className="flex-1"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading || isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {expenseToEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
