// src/types/index.ts

// ================================
// ENUMS
// ================================

export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CREDIT_CARD = 'CREDIT_CARD',
  LOAN = 'LOAN',
  INVESTMENT = 'INVESTMENT',
  CASH = 'CASH'
}

export enum TransactionSource {
  MANUAL = 'MANUAL',
  EMAIL_PARSED = 'EMAIL_PARSED',
  SPLITWISE = 'SPLITWISE',
  BANK_SYNC = 'BANK_SYNC'
}

export enum EmailProvider {
  GMAIL = 'GMAIL',
  OUTLOOK = 'OUTLOOK',
  YAHOO = 'YAHOO'
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  LINKED = 'LINKED',
  IGNORED = 'IGNORED',
  ERROR = 'ERROR'
}

export enum MessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM'
}

// ================================
// BASE USER TYPES (Enhanced)
// ================================

export interface User {
  id: string
  name?: string
  email: string
  emailVerified?: Date
  image?: string
  password?: string
  createdAt: Date
  updatedAt: Date
  
  // Enhanced fields
  splitwiseUserId?: string
  splitwiseToken?: string
  splitwiseTokenExp?: Date
}

// ================================
// FINANCE ACCOUNT TYPES (Enhanced)
// ================================

export interface FinanceAccount {
  accountId: string
  name: string
  accountType: AccountType // Enhanced from your number type
  balance: number // Enhanced from startingBalance
  creditLimit?: number
  iconUrl?: string
  
  // Bank integration metadata
  bankName?: string
  bankAccountNumber?: string
  routingNumber?: string
  
  userId: string
  createdAt: Date
  updatedAt: Date
}

// Backward compatibility type
export interface LegacyFinanceAccount {
  accountId: string
  name: string
  startingBalance: number
  type: number
  userId?: string
  createdAt?: Date
  updatedAt?: Date
}

// ================================
// INCOME/EXPENSE SOURCE TYPES (Same as yours)
// ================================

export interface IncomeSource {
  incomeSourceId: string
  name: string
  goal: number
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface ExpenseSource {
  expenseSourceId: string
  name: string
  budget: number
  userId: string
  createdAt: Date
  updatedAt: Date
}

// ================================
// TRANSACTION TYPES (Enhanced)
// ================================

export interface Income {
  incomeId: string
  name: string
  amount: number
  date: Date
  accountId: string
  incomeSourceId?: string // Made optional to match schema
  userId: string
  iconUrl?: string
  
  // Enhanced fields
  sourceType: TransactionSource
  sourceId?: string
  
  createdAt: Date
  updatedAt: Date
}

export interface Expense {
  expenseId: string
  name: string
  amount: number
  date: Date
  accountId: string
  expenseSourceId?: string // Made optional to match schema
  userId: string
  iconUrl?: string
  
  // Enhanced fields
  sourceType: TransactionSource
  sourceId?: string
  splitwiseExpenseId?: string
  isSplitwiseLinked: boolean
  
  createdAt: Date
  updatedAt: Date
}

export interface Transfer {
  transferId: string
  name: string
  amount: number
  date: Date
  fromAccountId?: string
  toAccountId?: string
  userId: string
  iconUrl?: string
  
  // Enhanced fields
  sourceType: TransactionSource
  sourceId?: string
  
  createdAt: Date
  updatedAt: Date
}

// ================================
// RELATIONS TYPES (Using your pattern)
// ================================

export interface IncomeWithRelations extends Income {
  account: FinanceAccount
  incomeSource?: IncomeSource
  user: User
}

export interface ExpenseWithRelations extends Expense {
  account: FinanceAccount
  expenseSource?: ExpenseSource
  user: User
}

export interface TransferWithRelations extends Transfer {
  fromAccount?: FinanceAccount
  toAccount?: FinanceAccount
  user: User
}

// ================================
// SPLITWISE TYPES (New)
// ================================

export interface SplitwiseParticipant {
  user_id: string
  first_name: string
  last_name?: string
  email?: string
  paid_share: string
  owed_share: string
  net_balance: string
}

export interface SplitwiseExpense {
  id: string
  splitwiseId: string
  description: string
  totalAmount: number
  userShare: number
  currency: string
  date: Date
  category?: string
  
  // Splitwise metadata
  groupId?: string
  groupName?: string
  paidBy: string
  participants: SplitwiseParticipant[]
  
  // Linking
  linkedExpenseId?: string
  isLinked: boolean
  
  userId: string
  createdAt: Date
  updatedAt: Date
}

// ================================
// EMAIL INTEGRATION TYPES (New)
// ================================

export interface LinkedEmail {
  id: string
  email: string
  provider: EmailProvider
  accessToken?: string
  refreshToken?: string
  tokenExpiry?: Date
  enableParsing: boolean
  keywords: string[]
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface EmailTransaction {
  id: string
  subject: string
  content: string
  parsedAmount?: number
  parsedDate?: Date
  parsedMerchant?: string
  parsedType?: TransactionType
  emailId: string
  fromAddress: string
  receivedAt: Date
  status: ProcessingStatus
  confidence?: number
  linkedTransactionId?: string
  accountId?: string
  linkedEmailId: string
  createdAt: Date
  updatedAt: Date
}

// ================================
// AI CHAT TYPES (New)
// ================================

export interface ChatSession {
  id: string
  title?: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface ChatMessage {
  id: string
  content: string
  role: MessageRole
  sessionId: string
  createdAt: Date
}

// ================================
// FORM INPUT TYPES (Enhanced from yours)
// ================================

export interface CreateIncomeSourceInput {
  name: string
  goal: number
}

export interface UpdateIncomeSourceInput {
  incomeSourceId: string
  name?: string
  goal?: number
}

export interface CreateExpenseSourceInput {
  name: string
  budget: number
}

export interface UpdateExpenseSourceInput {
  expenseSourceId: string
  name?: string
  budget?: number
}

export interface CreateFinanceAccountInput {
  name: string
  balance: number // Updated from startingBalance
  accountType: AccountType // Updated from type
  creditLimit?: number
  iconUrl?: string
  bankName?: string
  bankAccountNumber?: string
  routingNumber?: string
}

export interface UpdateFinanceAccountInput {
  accountId: string
  name?: string
  balance?: number
  accountType?: AccountType
  creditLimit?: number
  iconUrl?: string
  bankName?: string
  bankAccountNumber?: string
  routingNumber?: string
}

export interface CreateIncomeInput {
  name: string
  amount: number
  date: Date
  accountId: string
  incomeSourceId?: string
  iconUrl?: string
  sourceType?: TransactionSource
}

export interface UpdateIncomeInput {
  incomeId: string
  name?: string
  amount?: number
  date?: Date
  accountId?: string
  incomeSourceId?: string
  iconUrl?: string
  sourceType?: TransactionSource
}

export interface CreateExpenseInput {
  name: string
  amount: number
  date: Date
  accountId: string
  expenseSourceId?: string
  iconUrl?: string
  sourceType?: TransactionSource
  splitwiseExpenseId?: string
}

export interface UpdateExpenseInput {
  expenseId: string
  name?: string
  amount?: number
  date?: Date
  accountId?: string
  expenseSourceId?: string
  iconUrl?: string
  sourceType?: TransactionSource
  splitwiseExpenseId?: string
  isSplitwiseLinked?: boolean
}

export interface CreateTransferInput {
  name: string
  amount: number
  date: Date
  fromAccountId: string
  toAccountId: string
  iconUrl?: string
  sourceType?: TransactionSource
}

export interface UpdateTransferInput {
  transferId: string
  name?: string
  amount?: number
  date?: Date
  fromAccountId?: string
  toAccountId?: string
  iconUrl?: string
  sourceType?: TransactionSource
}

export interface CreateSplitwiseExpense {
  splitwiseId: string
  description: string
  totalAmount: number
  userShare: number
  currency: string
  date: Date
  category?: string
  
  // Splitwise metadata
  groupId?: string
  groupName?: string
  paidBy: string
  participants: SplitwiseParticipant[]
  
  // Linking
  linkedExpenseId?: string
  isLinked: boolean
  
  userId: string
  createdAt: Date
  updatedAt: Date
}

// ================================
// API RESPONSE TYPES (Using your pattern)
// ================================

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  success?: boolean // Added for consistency
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ================================
// DASHBOARD TYPES (Enhanced from yours)
// ================================

export interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  totalBalance: number
  accountsCount: number
  incomeSourcesCount: number
  expenseSourcesCount: number
  
  // Enhanced stats
  monthlyIncome: number
  monthlyExpenses: number
  topExpenseCategories: Array<{
    category: string
    amount: number
    percentage: number
  }>
}

export interface MonthlyStats {
  month: string
  income: number
  expenses: number
  balance: number
}

export interface SplitwiseDashboardStats {
  totalSplitwise: number
  linkedExpenses: {
    linked: number
    total: number
  }
  activeGroups: number
  syncProgress: number
}

// ================================
// UTILITY/HELPER TYPES
// ================================

export type TransactionUnion = Income | Expense | Transfer

export interface TransactionSummary {
  id: string
  name: string
  amount: number
  date: Date
  type: 'income' | 'expense' | 'transfer'
  accountName: string
  category?: string
  iconUrl?: string
  sourceType: TransactionSource
}

// ================================
// FILTER TYPES
// ================================

export interface TransactionFilters {
  startDate?: Date
  endDate?: Date
  accountId?: string
  type?: TransactionType
  sourceType?: TransactionSource
  minAmount?: number
  maxAmount?: number
  search?: string
}

export interface SplitwiseFilters {
  groupId?: string
  isLinked?: boolean
  startDate?: Date
  endDate?: Date
  minAmount?: number
  maxAmount?: number
}

// ================================
// BACKWARD COMPATIBILITY HELPERS
// ================================

// Helper to convert between old and new account types
export const mapLegacyAccountType = (type: number): AccountType => {
  switch (type) {
    case 1: return AccountType.CHECKING
    case 2: return AccountType.SAVINGS
    case 3: return AccountType.CREDIT_CARD
    case 4: return AccountType.LOAN
    case 5: return AccountType.INVESTMENT
    default: return AccountType.CASH
  }
}

export const mapAccountTypeToLegacy = (accountType: AccountType): number => {
  switch (accountType) {
    case AccountType.CHECKING: return 1
    case AccountType.SAVINGS: return 2
    case AccountType.CREDIT_CARD: return 3
    case AccountType.LOAN: return 4
    case AccountType.INVESTMENT: return 5
    default: return 6
  }
}

// Helper to convert legacy account to new format
export const convertLegacyAccount = (legacy: LegacyFinanceAccount): FinanceAccount => ({
  accountId: legacy.accountId,
  name: legacy.name,
  balance: legacy.startingBalance,
  accountType: mapLegacyAccountType(legacy.type),
  userId: legacy.userId!,
  createdAt: legacy.createdAt!,
  updatedAt: legacy.updatedAt!
})
