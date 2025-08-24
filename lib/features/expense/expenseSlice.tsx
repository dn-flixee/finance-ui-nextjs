// src/lib/features/expenses/expensesSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '@/lib/store'
import axios from 'axios'
import { toast } from '@/components/ui/use-toast'
import { Expense, CreateExpenseInput, UpdateExpenseInput } from '@/lib/types'

interface ExpensesState {
  expenses: Expense[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: ExpensesState = {
  expenses: [],
  status: 'idle',
  error: null,
}

const EXPENSE_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL + '/api/v1/expenses'

// Async thunks
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (params?: { page?: number; limit?: number; recent?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.recent) searchParams.set('recent', 'true')

    const url = `${EXPENSE_API_BASE_URL}${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    const response = await axios.get(url)
    return response.data
  }
)

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (expense: CreateExpenseInput) => {
    const response = await axios.post(EXPENSE_API_BASE_URL, expense)
    return response.data
  }
)

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async (expense: UpdateExpenseInput) => {
    const response = await axios.put(EXPENSE_API_BASE_URL, expense)
    return response.data
  }
)

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (expenseId: string) => {
    await axios.delete(`${EXPENSE_API_BASE_URL}?expenseId=${expenseId}`)
    return expenseId
  }
)

// Slice
const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.expenses = action.payload.expenses || action.payload
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to fetch expenses'
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch expenses',
        })
      })
      
      // Create expense
      .addCase(createExpense.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.expenses.unshift(action.payload)
        toast({
          description: 'Expense created successfully!',
        })
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to create expense'
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create expense',
        })
      })
      
      // Update expense
      .addCase(updateExpense.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.expenses.findIndex(expense => expense.expenseId === action.payload.expenseId)
        if (index !== -1) {
          state.expenses[index] = action.payload
        }
        toast({
          description: 'Expense updated successfully!',
        })
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to update expense'
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update expense',
        })
      })
      
      // Delete expense
      .addCase(deleteExpense.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.expenses = state.expenses.filter(expense => expense.expenseId !== action.payload)
        toast({
          description: 'Expense deleted successfully!',
        })
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to delete expense'
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to delete expense',
        })
      })
  },
})

// Actions
export const { clearError } = expensesSlice.actions

// Selectors
export const selectExpenses = (state: RootState) => state.expenses.expenses
export const selectExpensesStatus = (state: RootState) => state.expenses.status
export const selectExpensesError = (state: RootState) => state.expenses.error

export default expensesSlice.reducer
