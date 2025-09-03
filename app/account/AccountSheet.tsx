// src/app/(dashboard)/accounts/AccountSheet.tsx
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
import { createAccount, updateAccount, deleteAccount } from '@/lib/features/account/accountSlice'
import { FinanceAccount, AccountType } from '@/lib/types'
import { Trash2, Loader2 } from 'lucide-react'

interface AccountSheetProps {
  isOpen: boolean
  onClose: () => void
  accountToEdit?: FinanceAccount | null
}

export default function AccountSheet({
  isOpen,
  onClose,
  accountToEdit
}: AccountSheetProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    accountType: AccountType.CHECKING,
    balance: '',
    creditLimit: '',
    bankName: '',
    bankAccountNumber: '',
    routingNumber: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (accountToEdit) {
        setFormData({
          name: accountToEdit.name,
          accountType: accountToEdit.accountType,
          balance: accountToEdit.balance.toString(),
          creditLimit: accountToEdit.creditLimit?.toString() || '',
          bankName: accountToEdit.bankName || '',
          bankAccountNumber: accountToEdit.bankAccountNumber || '',
          routingNumber: accountToEdit.routingNumber || ''
        })
      } else {
        setFormData({
          name: '',
          accountType: AccountType.CHECKING,
          balance: '0',
          creditLimit: '',
          bankName: '',
          bankAccountNumber: '',
          routingNumber: ''
        })
      }
    }
  }, [isOpen, accountToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const accountData = {
        name: formData.name,
        accountType: formData.accountType,
        balance: parseFloat(formData.balance),
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
        bankName: formData.bankName || undefined,
        bankAccountNumber: formData.bankAccountNumber || undefined,
        routingNumber: formData.routingNumber || undefined
      }

      if (accountToEdit) {
        await dispatch(updateAccount({
          accountId: accountToEdit.accountId,
          ...accountData
        })).unwrap()
      } else {
        await dispatch(createAccount(accountData)).unwrap()
      }

      onClose()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${accountToEdit ? 'update' : 'create'} account`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!accountToEdit) return

    setIsDeleting(true)
    try {
      await dispatch(deleteAccount(accountToEdit.accountId)).unwrap()
      onClose()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete account",
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
            {accountToEdit ? 'Edit Account' : 'Add New Account'}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {accountToEdit ? 'Update your account details' : 'Add a new financial account'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <Label htmlFor="name" className="text-white">Account Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Main Checking, Savings"
              required
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="accountType" className="text-white">Account Type</Label>
            <Select
              value={formData.accountType}
              onValueChange={(value: AccountType) => setFormData({...formData, accountType: value})}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value={AccountType.CHECKING}>Checking</SelectItem>
                <SelectItem value={AccountType.SAVINGS}>Savings</SelectItem>
                <SelectItem value={AccountType.CREDIT_CARD}>Credit Card</SelectItem>
                <SelectItem value={AccountType.LOAN}>Loan</SelectItem>
                <SelectItem value={AccountType.INVESTMENT}>Investment</SelectItem>
                <SelectItem value={AccountType.CASH}>Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="balance" className="text-white">Current Balance (₹)</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData({...formData, balance: e.target.value})}
              placeholder="0.00"
              required
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          {formData.accountType === AccountType.CREDIT_CARD && (
            <div>
              <Label htmlFor="creditLimit" className="text-white">Credit Limit (₹)</Label>
              <Input
                id="creditLimit"
                type="number"
                step="0.01"
                value={formData.creditLimit}
                onChange={(e) => setFormData({...formData, creditLimit: e.target.value})}
                placeholder="0.00"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          )}

          <div>
            <Label htmlFor="bankName" className="text-white">Bank Name (Optional)</Label>
            <Input
              id="bankName"
              value={formData.bankName}
              onChange={(e) => setFormData({...formData, bankName: e.target.value})}
              placeholder="e.g., State Bank of India"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div className="flex gap-2 pt-4">
            {accountToEdit && (
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
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {accountToEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
