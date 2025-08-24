'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSplitwiseSync } from '@/hooks/use-splitwise'
import { createExpenseFromSplitwise } from '@/utils/splitwise-helpers'
import { toast } from '../ui/use-toast'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { selectAccounts, fetchAccounts } from '@/lib/features/account/accountSlice'

interface Account {
  accountId: string
  name: string
  accountType: string
  balance: number
}

interface SplitwiseExpense {
  id: string
  splitwiseId: string
  description: string
  userShare: number
  totalAmount: number
  date: string
  groupName: string
  isLinked: boolean
}

export function SplitwiseSync() {
  const { expenses, isConnected, connect, sync, linkExpense } = useSplitwiseSync()
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [accountsLoading, setAccountsLoading] = useState(true)
  const accounts = useAppSelector(selectAccounts)
  const dispatch = useAppDispatch()

  // Fetch accounts on component mount
  useEffect(() => {
      if(accounts.status === 'idle'){
        dispatch(fetchAccounts()).then(
          (Response)=>{
            console.log("fetchAccounts")
            console.log(Response.payload)
        })
      }
    }, [dispatch,accounts.status]);


  const handleCreateExpense = async (expense: SplitwiseExpense) => {
    if (!selectedAccount) {
      toast({
        title: "Account Required",
        description: "Please select an account first",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      await createExpenseFromSplitwise(expense, {
        accountId: selectedAccount,
        autoSelectAccount: false
      })
      
      toast({
        title: "Success",
        description: `Expense "${expense.description}" created successfully!`
      })
      
      // Refresh the expenses list
      await sync()
    } catch (error: any) {
      console.error('Error creating expense:', error)
      toast({
        title: "Error",
        description: `Failed to create expense: ${error.message}`,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    setIsLoading(true)
    try {
      await sync()
      toast({
        title: "Success",
        description: "Splitwise expenses synced successfully!"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync Splitwise expenses",
        variant: "destructive"
      })
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

      {/* Account Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select Account for New Expenses
            </label>
            <Select
              value={selectedAccount}
              onValueChange={setSelectedAccount}
              disabled={accountsLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue 
                  placeholder={accountsLoading ? "Loading accounts..." : "Select an account"} 
                />
              </SelectTrigger>
              <SelectContent>
                {accounts.accounts.map((account) => (
                  <SelectItem key={account.accountId} value={account.accountId}>
                    <div className="flex justify-between items-center w-full">
                      <span>{account.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAccount && (
              <p className="text-xs text-gray-500">
                New expenses will be added to: {accounts.accounts.find(a => a.accountId === selectedAccount)?.name}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4">
        {expenses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No Splitwise expenses found.</p>
              <Button onClick={handleSync} variant="outline" className="mt-4">
                Sync Expenses
              </Button>
            </CardContent>
          </Card>
        ) : (
          expenses.map((expense) => (
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
                  <div className="flex space-x-2">
                    {!expense.isLinked && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => linkExpense(expense.splitwiseId)}
                        disabled={isLoading}
                      >
                        Link to Expense
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleCreateExpense(expense)}
                      disabled={isLoading || !selectedAccount}
                    >
                      {isLoading ? 'Creating...' : 'Add as Expense'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
