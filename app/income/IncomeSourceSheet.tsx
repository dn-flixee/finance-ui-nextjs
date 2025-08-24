// src/app/(dashboard)/incomes/IncomeSourceSheet.tsx
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
  createIncomeSource, 
  updateIncomeSource, 
  deleteIncomeSource 
} from '@/lib/features/incomeSource/incomeSourceSlice'
import { IncomeSource } from '@/lib/types'
import { Trash2, Loader2 } from 'lucide-react'

interface IncomeSourceSheetProps {
  isOpen: boolean
  onClose: () => void
  incomeSourceToEdit?: IncomeSource | null
}

export default function IncomeSourceSheet({
  isOpen,
  onClose,
  incomeSourceToEdit
}: IncomeSourceSheetProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    goal: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Initialize form when opening sheet
  useEffect(() => {
    if (isOpen) {
      if (incomeSourceToEdit) {
        setFormData({
          name: incomeSourceToEdit.name,
          goal: incomeSourceToEdit.goal.toString()
        })
      } else {
        setFormData({
          name: '',
          goal: ''
        })
      }
    }
  }, [isOpen, incomeSourceToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const sourceData = {
        name: formData.name,
        goal: parseFloat(formData.goal)
      }

      if (incomeSourceToEdit) {
        await dispatch(updateIncomeSource({
          incomeSourceId: incomeSourceToEdit.incomeSourceId,
          ...sourceData
        })).unwrap()
      } else {
        await dispatch(createIncomeSource(sourceData)).unwrap()
      }

      onClose()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${incomeSourceToEdit ? 'update' : 'create'} income source`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!incomeSourceToEdit) return

    setIsDeleting(true)
    try {
      await dispatch(deleteIncomeSource(incomeSourceToEdit.incomeSourceId)).unwrap()
      onClose()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete income source",
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
            {incomeSourceToEdit ? 'Edit Income Source' : 'Add New Income Source'}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {incomeSourceToEdit ? 'Update your income source details' : 'Create a new income source with a goal'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <Label htmlFor="name" className="text-white">Source Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Full-time Job, Side Business"
              required
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="goal" className="text-white">Monthly Goal (₹)</Label>
            <Input
              id="goal"
              type="number"
              step="0.01"
              value={formData.goal}
              onChange={(e) => setFormData({...formData, goal: e.target.value})}
              placeholder="0.00"
              required
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div className="flex gap-2 pt-4">
            {incomeSourceToEdit && (
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
              {incomeSourceToEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
