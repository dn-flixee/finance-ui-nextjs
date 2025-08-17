

// Base User types
export interface User {
  id: string;
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Finance Account types
export interface FinanceAccount {
  accountId: string;
  name: string;
  startingBalance: number;
  type?: number;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Income Source types
export interface IncomeSource {
  incomeSourceId: string;
  name: string;
  goal: number;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Expense Source types
export interface ExpenseSource {
  expenseSourceId: string;
  name: string;
  budget: number;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Income types
export interface Income {
  incomeId: string;
  name: string;
  amount: number;
  date: Date;
  accountId: string;
  incomeSourceId: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Expense types
export interface Expense {
  expenseId: string;
  name: string;
  amount: number;
  date: Date;
  accountId: string;
  expenseSourceId: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Transfer types
export interface Transfer {
  transferId: string;
  name: string;
  amount: number;
  date: Date;
  fromAccountId: string;
  toAccountId: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Extended types with relations
export interface IncomeWithRelations extends Income {
  account: FinanceAccount;
  incomeSource: IncomeSource;
  user: User;
}

export interface ExpenseWithRelations extends Expense {
  account: FinanceAccount;
  expenseSource: ExpenseSource;
  user: User;
}

export interface TransferWithRelations extends Transfer {
  fromAccount: FinanceAccount;
  toAccount: FinanceAccount;
  user: User;
}

// Form types (for create/update operations)
export interface CreateIncomeSourceInput {
  name: string;
  goal: number;
}

export interface UpdateIncomeSourceInput {
  incomeSourceId: string;
  name?: string;
  goal?: number;
}

export interface CreateExpenseSourceInput {
  name: string;
  budget: number;
}

export interface UpdateExpenseSourceInput {
  expenseSourceId: string;
  name?: string;
  budget?: number;
}

export interface CreateFinanceAccountInput {
  name: string;
  startingBalance: number;
  type?: number;
}

export interface UpdateFinanceAccountInput {
  accountID: string;
  name?: string;
  startingBalance?: number;
  type?: number;
}

export interface CreateIncomeInput {
  name: string;
  amount: number;
  date: Date;
  accountId: string;
  incomeSourceId: string;
}

export interface UpdateIncomeInput {
  incomeId: string;
  name?: string;
  amount?: number;
  date?: Date;
  accountId?: string;
  incomeSourceId?: string;
}

export interface CreateExpenseInput {
  name: string;
  amount: number;
  date: Date;
  accountId: string;
  expenseSourceId: string;
}

export interface UpdateExpenseInput {
  expenseId: string;
  name?: string;
  amount?: number;
  date?: Date;
  accountId?: string;
  expenseSourceId?: string;
}

export interface CreateTransferInput {
  name: string;
  amount: number;
  date: Date;
  fromAccountId: string;
  toAccountId: string;
}

export interface UpdateTransferInput {
  transferId: string;
  name?: string;
  amount?: number;
  date?: Date;
  fromAccountId?: string;
  toAccountId?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Dashboard/Statistics types
export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  totalBalance: number;
  accountsCount: number;
  incomeSourcesCount: number;
  expenseSourcesCount: number;
}

export interface MonthlyStats {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}
