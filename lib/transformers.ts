// src/lib/transformers.ts
import { AccountType, TransactionSource } from '@/lib/types'

export const transformAccount = (account: any) => ({
  accountId: account.accountId,
  name: account.name,
  balance: account.balance, // Updated from startingBalance
  accountType: account.accountType, // Updated from type
  creditLimit: account.creditLimit || null,
  iconUrl: account.iconUrl || null,
  
  // Bank integration metadata
  bankName: account.bankName || null,
  bankAccountNumber: account.bankAccountNumber || null,
  routingNumber: account.routingNumber || null,
  
  // System fields
  userId: account.userId,
  createdAt: account.createdAt,
  updatedAt: account.updatedAt,
  
  // Backward compatibility (if needed)
  startingBalance: account.balance, // For legacy support
  type: mapAccountTypeToLegacy(account.accountType) // For legacy support
})

export const transformExpense = (expense: any) => ({
  expenseId: expense.expenseId,
  name: expense.name,
  amount: expense.amount,
  date: expense.date,
  accountId: expense.accountId,
  accountName: expense.account?.name || '',
  expenseSourceId: expense.expenseSourceId || null, // Can be null now
  expenseSourceName: expense.expenseSource?.name || null,
  expenseSourceBudget: expense.expenseSource?.budget || null,
  iconUrl: expense.iconUrl || null,
  
  // Enhanced tracking fields
  sourceType: expense.sourceType || TransactionSource.MANUAL,
  sourceId: expense.sourceId || null,
  
  // Splitwise integration
  splitwiseExpenseId: expense.splitwiseExpenseId || null,
  isSplitwiseLinked: expense.isSplitwiseLinked || false,
  
  // System fields
  userId: expense.userId,
  createdAt: expense.createdAt,
  updatedAt: expense.updatedAt
})

export const transformIncome = (income: any) => ({
  incomeId: income.incomeId,
  name: income.name,
  amount: income.amount,
  date: income.date,
  accountId: income.accountId,
  accountName: income.account?.name || '',
  incomeSourceId: income.incomeSourceId || null, // Can be null now
  incomeSourceName: income.incomeSource?.name || null,
  incomeSourceGoal: income.incomeSource?.goal || null,
  iconUrl: income.iconUrl || null,
  
  // Enhanced tracking fields
  sourceType: income.sourceType || TransactionSource.MANUAL,
  sourceId: income.sourceId || null,
  
  // System fields
  userId: income.userId,
  createdAt: income.createdAt,
  updatedAt: income.updatedAt
})

export const transformTransfer = (transfer: any) => ({
  transferId: transfer.transferId,
  name: transfer.name,
  amount: transfer.amount,
  date: transfer.date,
  fromAccountId: transfer.fromAccountId || null, // Can be null now
  fromAccountName: transfer.fromAccount?.name || null,
  toAccountId: transfer.toAccountId || null, // Can be null now  
  toAccountName: transfer.toAccount?.name || null,
  iconUrl: transfer.iconUrl || null,
  
  // Enhanced tracking fields
  sourceType: transfer.sourceType || TransactionSource.MANUAL,
  sourceId: transfer.sourceId || null,
  
  // System fields
  userId: transfer.userId,
  createdAt: transfer.createdAt,
  updatedAt: transfer.updatedAt
})

export const transformExpenseSource = (expenseSource: any) => ({
  expenseSourceId: expenseSource.expenseSourceId,
  name: expenseSource.name,
  budget: expenseSource.budget,
  
  // System fields
  userId: expenseSource.userId,
  createdAt: expenseSource.createdAt,
  updatedAt: expenseSource.updatedAt,
  
  // Additional computed fields (if relations are included)
  expensesCount: expenseSource._count?.expenses || 0,
  totalSpent: expenseSource.expenses?.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0,
  remainingBudget: expenseSource.budget - (expenseSource.expenses?.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0)
})

export const transformIncomeSource = (incomeSource: any) => ({
  incomeSourceId: incomeSource.incomeSourceId,
  name: incomeSource.name,
  goal: incomeSource.goal,
  
  // System fields
  userId: incomeSource.userId,
  createdAt: incomeSource.createdAt,
  updatedAt: incomeSource.updatedAt,
  
  // Additional computed fields (if relations are included)
  incomesCount: incomeSource._count?.incomes || 0,
  totalEarned: incomeSource.incomes?.reduce((sum: number, income: any) => sum + income.amount, 0) || 0,
  remainingToGoal: incomeSource.goal - (incomeSource.incomes?.reduce((sum: number, income: any) => sum + income.amount, 0) || 0)
})

// New transformer for Splitwise expenses
export const transformSplitwiseExpense = (expense: any) => ({
  id: expense.id,
  splitwiseId: expense.splitwiseId,
  description: expense.description,
  totalAmount: expense.totalAmount,
  userShare: expense.userShare,
  currency: expense.currency,
  date: expense.date,
  category: expense.category || null,
  
  // Splitwise metadata
  groupId: expense.groupId || null,
  groupName: expense.groupName || null,
  paidBy: expense.paidBy,
  participants: expense.participants || [],
  
  // Linking info
  linkedExpenseId: expense.linkedExpenseId || null,
  isLinked: expense.isLinked || false,
  
  // System fields
  userId: expense.userId,
  createdAt: expense.createdAt,
  updatedAt: expense.updatedAt
})

// New transformer for email transactions
export const transformEmailTransaction = (transaction: any) => ({
  id: transaction.id,
  subject: transaction.subject,
  content: transaction.content,
  parsedAmount: transaction.parsedAmount || null,
  parsedDate: transaction.parsedDate || null,
  parsedMerchant: transaction.parsedMerchant || null,
  parsedType: transaction.parsedType || null,
  
  // Email metadata
  emailId: transaction.emailId,
  fromAddress: transaction.fromAddress,
  receivedAt: transaction.receivedAt,
  
  // Processing info
  status: transaction.status,
  confidence: transaction.confidence || null,
  
  // Linking info
  linkedTransactionId: transaction.linkedTransactionId || null,
  accountId: transaction.accountId || null,
  accountName: transaction.account?.name || null,
  
  // System fields
  linkedEmailId: transaction.linkedEmailId,
  createdAt: transaction.createdAt,
  updatedAt: transaction.updatedAt
})

// New transformer for chat sessions
export const transformChatSession = (session: any) => ({
  id: session.id,
  title: session.title || 'Untitled Chat',
  userId: session.userId,
  messagesCount: session._count?.messages || 0,
  createdAt: session.createdAt,
  updatedAt: session.updatedAt,
  
  // Include messages if they're loaded
  messages: session.messages?.map(transformChatMessage) || []
})

// New transformer for chat messages  
export const transformChatMessage = (message: any) => ({
  id: message.id,
  content: message.content,
  role: message.role,
  sessionId: message.sessionId,
  createdAt: message.createdAt
})

// Utility function for backward compatibility
export const mapAccountTypeToLegacy = (accountType: AccountType): number => {
  switch (accountType) {
    case AccountType.CHECKING: return 1
    case AccountType.SAVINGS: return 2
    case AccountType.CREDIT_CARD: return 3
    case AccountType.LOAN: return 4
    case AccountType.INVESTMENT: return 5
    default: return 6 // CASH
  }
}

// Generic transaction transformer (for combined views)
export const transformTransaction = (transaction: any, type: 'income' | 'expense' | 'transfer') => {
  const baseData = {
    id: transaction[`${type}Id`],
    name: transaction.name,
    amount: transaction.amount,
    date: transaction.date,
    type,
    iconUrl: transaction.iconUrl || null,
    sourceType: transaction.sourceType || TransactionSource.MANUAL,
    sourceId: transaction.sourceId || null,
    userId: transaction.userId,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt
  }

  switch (type) {
    case 'income':
      return {
        ...baseData,
        accountId: transaction.accountId,
        accountName: transaction.account?.name || '',
        incomeSourceId: transaction.incomeSourceId || null,
        incomeSourceName: transaction.incomeSource?.name || null
      }
    case 'expense':
      return {
        ...baseData,
        accountId: transaction.accountId,
        accountName: transaction.account?.name || '',
        expenseSourceId: transaction.expenseSourceId || null,
        expenseSourceName: transaction.expenseSource?.name || null,
        splitwiseExpenseId: transaction.splitwiseExpenseId || null,
        isSplitwiseLinked: transaction.isSplitwiseLinked || false
      }
    case 'transfer':
      return {
        ...baseData,
        fromAccountId: transaction.fromAccountId || null,
        fromAccountName: transaction.fromAccount?.name || null,
        toAccountId: transaction.toAccountId || null,
        toAccountName: transaction.toAccount?.name || null
      }
  }
}

// Bulk transformer for dashboard/summary views
export const transformDashboardData = (data: any) => ({
  accounts: data.accounts?.map(transformAccount) || [],
  recentIncomes: data.recentIncomes?.map(transformIncome) || [],
  recentExpenses: data.recentExpenses?.map(transformExpense) || [],
  recentTransfers: data.recentTransfers?.map(transformTransfer) || [],
  stats: {
    totalIncome: data.stats?.totalIncome || 0,
    totalExpenses: data.stats?.totalExpenses || 0,
    totalBalance: data.stats?.totalBalance || 0,
    accountsCount: data.stats?.accountsCount || 0,
    monthlyIncome: data.stats?.monthlyIncome || 0,
    monthlyExpenses: data.stats?.monthlyExpenses || 0
  }
})
