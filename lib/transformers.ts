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
    accountId: expense.account?.accountId || '',
    expenseSourceId: expense.expenseSource?.expenseSourceId || ''
  })
  
  export const transformIncome = (income: any) => ({
    incomeId: income.incomeId,
    name: income.name,
    amount: income.amount,
    date: income.date,
    accountId: income.account?.accountId || '',
    incomeSourceId: income.incomeSource?.incomeSourceId || ''
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
    fromAccountId: transfer.fromAccountId,
    toAccountId: transfer.toAccountId
  })