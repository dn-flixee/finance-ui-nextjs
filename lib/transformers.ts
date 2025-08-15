export const transformAccount = (account: any) => ({
    accountId: account.accountId,
    name: account.name,
    startingBalance: account.startingBalance,
    type: account.type
  })
  
  export const transformExpense = (expense: any) => ({
    expenseId: expense.expenseId,
    name: expense.name,
    amount: expense.amount,
    date: expense.date,
    accountName: expense.account?.name || '',
    expenseSourceName: expense.expenseSource?.name || ''
  })
  
  export const transformIncome = (income: any) => ({
    incomeId: income.incomeId,
    name: income.name,
    amount: income.amount,
    date: income.date,
    accountName: income.account?.name || '',
    incomeSourceName: income.incomeSource?.name || ''
  })
  
  export const transformExpenseSource = (expenseSource: any) => ({
    expenseSourceId: expenseSource.expenseSourceId,
    name: expenseSource.name,
    budget: expenseSource.budget
  })
  
  export const transformIncomeSource = (incomeSource: any) => ({
    incomeSourceId: incomeSource.incomeSourceId,
    name: incomeSource.name,
    goal: incomeSource.goal
  })
  
  export const transformTransfer = (transfer: any) => ({
    transferId: transfer.transferId,
    name: transfer.name,
    amount: transfer.amount,
    date: transfer.date,
    fromAccount: transfer.fromAccountId,
    toAccount: transfer.toAccountId
  })