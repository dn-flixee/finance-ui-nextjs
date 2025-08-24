// src/utils/splitwise-helpers.ts
import { SplitwiseExpense } from '@/types'

interface CreateExpenseOptions {
  accountId?: string
  expenseSourceId?: string
  autoSelectAccount?: boolean
}

export async function createExpenseFromSplitwise(
  splitwiseExpense: SplitwiseExpense,
  options: CreateExpenseOptions = {}
) {
  try {
    const { accountId, expenseSourceId, autoSelectAccount = false } = options

    // If no account specified and auto-select is enabled, get default account
    let selectedAccountId = accountId
    if (!selectedAccountId && autoSelectAccount) {
      selectedAccountId = await getDefaultAccount()
    }

    if (!selectedAccountId) {
      throw new Error('Account ID is required to create expense')
    }

    const expenseData = {
      name: splitwiseExpense.description || 'Splitwise Expense',
      amount: splitwiseExpense.userShare,
      date: new Date(splitwiseExpense.date).toISOString(),
      accountId: selectedAccountId,
      expenseSourceId: expenseSourceId,
      sourceType: 'SPLITWISE',
      splitwiseExpenseId: splitwiseExpense.splitwiseId,
      isSplitwiseLinked: true,
      // Additional Splitwise metadata
      metadata: {
        totalAmount: splitwiseExpense.totalAmount,
        currency: splitwiseExpense.currency,
        category: splitwiseExpense.category,
        groupName: splitwiseExpense.groupName,
        paidBy: splitwiseExpense.paidBy
      }
    }

    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(`Failed to create expense: ${errorData.error || response.statusText}`)
    }

    const createdExpense = await response.json()
    
    // Update the Splitwise expense to mark it as linked
    await linkSplitwiseExpense(splitwiseExpense.splitwiseId, createdExpense.expenseId)

    return createdExpense

  } catch (error) {
    console.error('Error creating expense from Splitwise:', error)
    throw error
  }
}

// Helper function to get default account
async function getDefaultAccount(): Promise<string> {
  try {
    const response = await fetch('/api/accounts')
    if (!response.ok) throw new Error('Failed to fetch accounts')
    
    const { accounts } = await response.json()
    const defaultAccount = accounts.find((acc: any) => acc.accountType === 'CHECKING') || accounts[0]
    
    return defaultAccount?.accountId
  } catch (error) {
    console.error('Error getting default account:', error)
    throw new Error('Could not determine default account')
  }
}

// Helper function to link Splitwise expense
async function linkSplitwiseExpense(splitwiseId: string, expenseId: string) {
  try {
    const response = await fetch('/api/splitwise/link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ splitwiseId, expenseId })
    })

    if (!response.ok) {
      console.warn('Failed to link Splitwise expense, but expense was created')
    }
  } catch (error) {
    console.warn('Error linking Splitwise expense:', error)
  }
}
