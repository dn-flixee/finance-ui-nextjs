// src/app/(dashboard)/transfers/TransferSheet.tsx
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from '@/components/ui/use-toast'
import { useAppDispatch } from '@/lib/hooks'
import { createTransfer, updateTransfer, deleteTransfer } from '@/lib/features/transfer/transferSlice'
import { Transfer, FinanceAccount } from '@/lib/types'
import { 
  Trash2, 
  Loader2, 
  ArrowRightLeft, 
  AlertTriangle,
  ArrowRight,
  DollarSign 
} from 'lucide-react'

interface TransferSheetProps {
  accountData: FinanceAccount[]
  isOpen: boolean
  onClose: () => void
  transferToEdit?: Transfer | null
}

export default function TransferSheet({
  accountData,
  isOpen,
  onClose,
  transferToEdit
}: TransferSheetProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: '',
    fromAccountId: '',
    toAccountId: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Initialize form when opening sheet
  useEffect(() => {
    if (isOpen) {
      if (transferToEdit) {
        setFormData({
          name: transferToEdit.name,
          amount: transferToEdit.amount.toString(),
          date: new Date(transferToEdit.date).toISOString().split('T')[0],
          fromAccountId: transferToEdit.fromAccountId || '',
          toAccountId: transferToEdit.toAccountId || ''
        })
      } else {
        setFormData({
          name: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          fromAccountId: '',
          toAccountId: ''
        })
      }
    }
  }, [isOpen, transferToEdit])

  const fromAccount = accountData.find(acc => acc.accountId === formData.fromAccountId)
  const toAccount = accountData.find(acc => acc.accountId === formData.toAccountId)
  const transferAmount = parseFloat(formData.amount || '0')

  const canTransfer = fromAccount && transferAmount > 0 && fromAccount.balance >= transferAmount
  const insufficientFunds = fromAccount && transferAmount > 0 && fromAccount.balance < transferAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Transfer description is required",
      })
      return
    }

    if (!formData.fromAccountId) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a source account",
      })
      return
    }

    if (!formData.toAccountId) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a destination account",
      })
      return
    }

    if (formData.fromAccountId === formData.toAccountId) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Source and destination accounts must be different",
      })
      return
    }

    if (transferAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Transfer amount must be greater than 0",
      })
      return
    }

    if (insufficientFunds) {
      toast({
        variant: "destructive",
        title: "Insufficient Funds",
        description: "The source account doesn't have enough balance for this transfer",
      })
      return
    }

    setIsLoading(true)

    try {
      const transferData = {
        name: formData.name.trim(),
        amount: transferAmount,
        date: new Date(formData.date).toISOString(),
        fromAccountId: formData.fromAccountId,
        toAccountId: formData.toAccountId
      }

      if (transferToEdit) {
        await dispatch(updateTransfer({
          transferId: transferToEdit.transferId,
          ...transferData
        })).unwrap()
      } else {
        await dispatch(createTransfer(transferData)).unwrap()
      }

      onClose()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${transferToEdit ? 'update' : 'create'} transfer`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!transferToEdit) return

    const confirmMessage = `Are you sure you want to delete the transfer "${transferToEdit.name}"? This action cannot be undone.`
    
    if (!window.confirm(confirmMessage)) return

    setIsDeleting(true)
    try {
      await dispatch(deleteTransfer(transferToEdit.transferId)).unwrap()
      onClose()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete transfer",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const availableToAccounts = accountData.filter(acc => acc.accountId !== formData.fromAccountId)
  const availableFromAccounts = accountData.filter(acc => acc.accountId !== formData.toAccountId)

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-gray-900 border-gray-700 text-white overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center">
            <ArrowRightLeft className="w-5 h-5 mr-2" />
            {transferToEdit ? 'Edit Transfer' : 'New Transfer'}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {transferToEdit 
              ? 'Update your transfer details' 
              : 'Transfer money between your accounts'
            }
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white font-medium">
              Transfer Description
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Emergency fund transfer, Pay credit card"
              required
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white font-medium flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Amount (₹)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
              required
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-white font-medium">Transfer Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
              className="bg-gray-800 border-gray-600 text-white focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromAccount" className="text-white font-medium">
                From Account
              </Label>
              <Select
                value={formData.fromAccountId}
                onValueChange={(value) => setFormData({...formData, fromAccountId: value})}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select source account" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {availableFromAccounts.map((account) => (
                    <SelectItem key={account.accountId} value={account.accountId}>
                      <div className="flex justify-between items-center w-full">
                        <span>{account.name}</span>
                        <span className="text-sm text-gray-400 ml-2">
                          ₹{account.balance.toLocaleString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fromAccount && (
                <p className="text-xs text-gray-400">
                  Available balance: ₹{fromAccount.balance.toLocaleString()}
                </p>
              )}
            </div>

            {/* Transfer Arrow */}
            {formData.fromAccountId && formData.toAccountId && (
              <div className="flex justify-center py-2">
                <div className="bg-blue-600 rounded-full p-2">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="toAccount" className="text-white font-medium">
                To Account
              </Label>
              <Select
                value={formData.toAccountId}
                onValueChange={(value) => setFormData({...formData, toAccountId: value})}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select destination account" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {availableToAccounts.map((account) => (
                    <SelectItem key={account.accountId} value={account.accountId}>
                      <div className="flex justify-between items-center w-full">
                        <span>{account.name}</span>
                        <span className="text-sm text-gray-400 ml-2">
                          ₹{account.balance.toLocaleString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Insufficient Funds Warning */}
          {insufficientFunds && (
            <Alert className="bg-red-900/20 border-red-500">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                Insufficient funds. Available balance: ₹{fromAccount.balance.toLocaleString()}
              </AlertDescription>
            </Alert>
          )}

          {/* Transfer Preview */}
          {fromAccount && toAccount && transferAmount > 0 && canTransfer && (
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Transfer Preview</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">From:</span>
                  <span className="text-white">{fromAccount.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">To:</span>
                  <span className="text-white">{toAccount.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-blue-400 font-bold">₹{transferAmount.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">New balance ({fromAccount.name}):</span>
                    <span className="text-white">₹{(fromAccount.balance - transferAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">New balance ({toAccount.name}):</span>
                    <span className="text-white">₹{(toAccount.balance + transferAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            {transferToEdit && (
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
                Delete Transfer
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
              disabled={isLoading || isDeleting || insufficientFunds}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {transferToEdit ? 'Update Transfer' : 'Create Transfer'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
