// src/app/(dashboard)/incomes/IncomeSheet.tsx
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
import { createIncome, updateIncome, deleteIncome } from '@/lib/features/income/incomeSlice'
import { Income, IncomeSource, FinanceAccount } from '@/lib/types'
import { Trash2, Loader2 } from 'lucide-react'

interface IncomeSheetProps {
  incomeSourceData: IncomeSource[]
  accountData: FinanceAccount[]
  isOpen: boolean
  onClose: () => void
  incomeToEdit?: Income | null
}

export default function IncomeSheet({
  incomeSourceData,
  accountData,
  isOpen,
  onClose,
  incomeToEdit
}: IncomeSheetProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: '',
    accountId: '',
    incomeSourceId: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Initialize form when opening sheet
  useEffect(() => {
    if (isOpen) {
      if (incomeToEdit) {
        setFormData({
          name: incomeToEdit.name,
          amount: incomeToEdit.amount.toString(),
          date: new Date(incomeToEdit.date).toISOString().split('T')[0],
          accountId: incomeToEdit.accountId,
          incomeSourceId: incomeToEdit.incomeSourceId || ''
        })
      } else {
        setFormData({
          name: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          accountId: '',
          incomeSourceId: ''
        })
      }
    }
  }, [isOpen, incomeToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const incomeData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date),
        accountId: formData.accountId,
        incomeSourceId: formData.incomeSourceId || undefined
      }

      if (incomeToEdit) {
        await dispatch(updateIncome({
          incomeId: incomeToEdit.incomeId,
          ...incomeData
        })).unwrap()
      } else {
        await dispatch(createIncome(incomeData)).unwrap()
      }

      onClose()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${incomeToEdit ? 'update' : 'create'} income`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!incomeToEdit) return

    setIsDeleting(true)
    try {
      await dispatch(deleteIncome(incomeToEdit.incomeId)).unwrap()
      onClose()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete income",
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
            {incomeToEdit ? 'Edit Income' : 'Add New Income'}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {incomeToEdit ? 'Update your income details' : 'Add a new income entry'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <Label htmlFor="name" className="text-white">Income Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Salary, Freelance"
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
            <Label htmlFor="source" className="text-white">Income Source (Optional)</Label>
            <Select
              value={formData.incomeSourceId}
              onValueChange={(value) => setFormData({...formData, incomeSourceId: value})}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select income source" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="">No source</SelectItem>
                {incomeSourceData.map((source) => (
                  <SelectItem key={source.incomeSourceId} value={source.incomeSourceId}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            {incomeToEdit && (
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
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {incomeToEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
