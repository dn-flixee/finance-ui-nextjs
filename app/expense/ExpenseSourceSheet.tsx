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
import { useToast } from '@/components/ui/use-toast'
import { useAppDispatch } from '@/lib/hooks'
import { 
  createExpenseSource, 
  updateExpenseSource, 
  deleteExpenseSource 
} from '@/lib/features/expenseSource/expenseSourceSlice'
import { ExpenseSource } from '@/lib/types'
import { Trash2, Loader2, Target, DollarSign } from 'lucide-react'

interface ExpenseSourceSheetProps {
  isOpen: boolean
  onClose: () => void
  expenseSourceToEdit?: ExpenseSource | null
}

export default function ExpenseSourceSheet({
  isOpen,
  onClose,
  expenseSourceToEdit
}: ExpenseSourceSheetProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    budget: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Initialize form when opening sheet
  useEffect(() => {
    if (isOpen) {
      if (expenseSourceToEdit) {
        setFormData({
          name: expenseSourceToEdit.name,
          budget: expenseSourceToEdit.budget.toString()
        })
      } else {
        setFormData({
          name: '',
          budget: ''
        })
      }
    }
  }, [isOpen, expenseSourceToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Category name is required",
      })
      return
    }

    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Budget must be greater than 0",
      })
      return
    }

    setIsLoading(true)

    try {
      const sourceData = {
        name: formData.name.trim(),
        budget: parseFloat(formData.budget)
      }

      if (expenseSourceToEdit) {
        await dispatch(updateExpenseSource({
          expenseSourceId: expenseSourceToEdit.expenseSourceId,
          ...sourceData
        })).unwrap()
      } else {
        await dispatch(createExpenseSource(sourceData)).unwrap()
      }

      onClose()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${expenseSourceToEdit ? 'update' : 'create'} expense category`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!expenseSourceToEdit) return

    const confirmMessage = `Are you sure you want to delete "${expenseSourceToEdit.name}"? This action cannot be undone.`
    
    if (!window.confirm(confirmMessage)) return

    setIsDeleting(true)
    try {
      await dispatch(deleteExpenseSource(expenseSourceToEdit.expenseSourceId)).unwrap()
      onClose()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete expense category. It may have associated expenses.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-gray-900 border-gray-700 text-white">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            {expenseSourceToEdit ? 'Edit Expense Category' : 'Add New Category'}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {expenseSourceToEdit 
              ? 'Update your expense category details and budget' 
              : 'Create a new expense category with a monthly budget to track spending'
            }
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white font-medium">
              Category Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Groceries, Utilities, Entertainment"
              required
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500">
              Choose a descriptive name for your expense category
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget" className="text-white font-medium flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Monthly Budget (₹)
            </Label>
            <Input
              id="budget"
              type="number"
              step="0.01"
              min="0"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
              placeholder="0.00"
              required
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500">
              Set a monthly spending limit for this category to track your budget
            </p>
          </div>

          {/* Preview Section */}
          {formData.name && formData.budget && (
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Preview</h4>
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">{formData.name}</span>
                <span className="text-blue-400 font-bold">
                  ₹{parseFloat(formData.budget || '0').toLocaleString()} budget
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            {expenseSourceToEdit && (
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
                Delete Category
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
              {expenseSourceToEdit ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
