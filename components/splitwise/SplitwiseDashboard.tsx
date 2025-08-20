'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { useSplitwiseSync } from '@/hooks/use-splitwise' // Assuming this hook from previous implementations

interface SplitwiseExpense {
  id: string
  description: string
  userShare: number
  totalAmount: number
  currency: string
  date: string
  groupName: string
  isLinked: boolean
}

export default function SplitwiseDashboard() {
  const { expenses, linkExpense } = useSplitwiseSync() // Use hook to get expenses and link function
  const [totalOwed, setTotalOwed] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)

  useEffect(() => {
    if (expenses.length > 0) {
      const owed = expenses.reduce((sum, exp) => sum + exp.userShare, 0)
      setTotalOwed(owed)
      setTotalExpenses(expenses.length)
    }
  }, [expenses])

  const handleLink = async (expenseId: string) => {
    // Call link function from hook
    await linkExpense(expenseId)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Splitwise Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalExpenses}</p>
            <p className="text-sm text-gray-500">Synced expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Owed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">${totalOwed.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Your share across all expenses</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Splitwise Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="border-b py-4 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{expense.description}</h3>
                    <p className="text-sm text-gray-600">
                      Your share: ${expense.userShare.toFixed(2)} of ${expense.totalAmount.toFixed(2)} {expense.currency}
                    </p>
                    <p className="text-sm text-gray-500">
                      Group: {expense.groupName} • {format(new Date(expense.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={expense.isLinked ? 'default' : 'secondary'}>
                      {expense.isLinked ? 'Linked' : 'Not Linked'}
                    </Badge>
                    {!expense.isLinked && (
                      <Button size="sm" onClick={() => handleLink(expense.id)}>
                        Link to Expense
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <p className="text-center text-gray-500">No recent Splitwise expenses</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
