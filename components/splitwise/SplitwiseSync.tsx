'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSplitwiseSync } from '@/hooks/use-splitwise'

export function SplitwiseSync() {
  const { expenses, isConnected, connect, sync, linkExpense } = useSplitwiseSync()
  const [isLoading, setIsLoading] = useState(false)

  const handleSync = async () => {
    setIsLoading(true)
    try {
      await sync()
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Splitwise</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Connect your Splitwise account to sync your shared expenses.</p>
          <Button onClick={connect}>Connect Splitwise</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Splitwise Expenses</h2>
        <Button onClick={handleSync} disabled={isLoading}>
          {isLoading ? 'Syncing...' : 'Sync Now'}
        </Button>
      </div>
      
      <div className="grid gap-4">
        {expenses.map((expense) => (
          <Card key={expense.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{expense.description}</h3>
                  <p className="text-sm text-gray-600">
                    Your share: ${expense.userShare} of ${expense.totalAmount}
                  </p>
                  <p className="text-xs text-gray-500">
                    {expense.groupName} • {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-x-2">
                  {!expense.isLinked && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => linkExpense(expense.splitwiseId)}
                    >
                      Link to Expense
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => createExpenseFromSplitwise(expense)}
                  >
                    Add as Expense
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}