// src/lib/features/expenseSources/expenseSourcesSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '@/lib/store'
import axios from 'axios'
import { toast } from '@/components/ui/use-toast'
import { ExpenseSource, CreateExpenseSourceInput, UpdateExpenseSourceInput } from '@/lib/types'

interface ExpenseSourcesState {
  expenseSources: ExpenseSource[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: ExpenseSourcesState = {
  expenseSources: [],
  status: 'idle',
  error: null,
}

const EXPENSE_SOURCES_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL + '/api/v1/expense-sources'

// Async thunks
export const fetchExpenseSources = createAsyncThunk(
  'expenseSources/fetchExpenseSources',
  async () => {
    const response = await axios.get(EXPENSE_SOURCES_API_BASE_URL)
    return response.data
  }
)

export const createExpenseSource = createAsyncThunk(
  'expenseSources/createExpenseSource',
  async (expenseSource: CreateExpenseSourceInput) => {
    const response = await axios.post(EXPENSE_SOURCES_API_BASE_URL, expenseSource)
    return response.data
  }
)

export const updateExpenseSource = createAsyncThunk(
  'expenseSources/updateExpenseSource',
  async (expenseSource: UpdateExpenseSourceInput) => {
    const response = await axios.put(EXPENSE_SOURCES_API_BASE_URL, expenseSource)
    return response.data
  }
)

export const deleteExpenseSource = createAsyncThunk(
  'expenseSources/deleteExpenseSource',
  async (expenseSourceId: string) => {
    await axios.delete(`${EXPENSE_SOURCES_API_BASE_URL}?expenseSourceId=${expenseSourceId}`)
    return expenseSourceId
  }
)

// Slice
const expenseSourcesSlice = createSlice({
  name: 'expenseSources',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenseSources.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchExpenseSources.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.expenseSources = action.payload.expenseSources || action.payload
      })
      .addCase(fetchExpenseSources.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to fetch expense sources'
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch expense sources',
        })
      })
      
      .addCase(createExpenseSource.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.expenseSources.unshift(action.payload)
        toast({
          description: 'Expense source created successfully!',
        })
      })
      
      .addCase(updateExpenseSource.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.expenseSources.findIndex(source => source.expenseSourceId === action.payload.expenseSourceId)
        if (index !== -1) {
          state.expenseSources[index] = action.payload
        }
        toast({
          description: 'Expense source updated successfully!',
        })
      })
      
      .addCase(deleteExpenseSource.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.expenseSources = state.expenseSources.filter(source => source.expenseSourceId !== action.payload)
        toast({
          description: 'Expense source deleted successfully!',
        })
      })
  },
})

export const { clearError } = expenseSourcesSlice.actions

export const selectExpenseSources = (state: RootState) => state.expenseSources.expenseSources
export const selectExpenseSourcesStatus = (state: RootState) => state.expenseSources.status
export const selectExpenseSourcesError = (state: RootState) => state.expenseSources.error

export default expenseSourcesSlice.reducer
