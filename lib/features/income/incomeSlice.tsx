// src/lib/features/incomes/incomesSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '@/lib/store'
import axios from 'axios'
import { toast } from '@/components/ui/use-toast'
import { Income, CreateIncomeInput, UpdateIncomeInput } from '@/lib/types'

interface IncomesState {
  incomes: Income[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: IncomesState = {
  incomes: [],
  status: 'idle',
  error: null,
}

const INCOME_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL + '/api/v1/income'

// Async thunks
export const fetchIncomes = createAsyncThunk(
  'incomes/fetchIncomes',
  async (params?: { page?: number; limit?: number; recent?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.recent) searchParams.set('recent', 'true')

    const url = `${INCOME_API_BASE_URL}${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    const response = await axios.get(url)
    return response.data
  }
)

export const createIncome = createAsyncThunk(
  'incomes/createIncome',
  async (income: CreateIncomeInput) => {
    const response = await axios.post(INCOME_API_BASE_URL, income)
    return response.data
  }
)

export const updateIncome = createAsyncThunk(
  'incomes/updateIncome',
  async (income: UpdateIncomeInput) => {
    const response = await axios.put(INCOME_API_BASE_URL, income)
    return response.data
  }
)

export const deleteIncome = createAsyncThunk(
  'incomes/deleteIncome',
  async (incomeId: string) => {
    await axios.delete(`${INCOME_API_BASE_URL}?incomeId=${incomeId}`)
    return incomeId
  }
)

// Slice
const incomesSlice = createSlice({
  name: 'incomes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch incomes
      .addCase(fetchIncomes.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchIncomes.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.incomes = action.payload.incomes || action.payload
      })
      .addCase(fetchIncomes.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to fetch incomes'
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch incomes',
        })
      })
      
      // Create income
      .addCase(createIncome.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(createIncome.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.incomes.unshift(action.payload)
        toast({
          description: 'Income created successfully!',
        })
      })
      .addCase(createIncome.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to create income'
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create income',
        })
      })
      
      // Update income
      .addCase(updateIncome.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(updateIncome.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.incomes.findIndex(income => income.incomeId === action.payload.incomeId)
        if (index !== -1) {
          state.incomes[index] = action.payload
        }
        toast({
          description: 'Income updated successfully!',
        })
      })
      .addCase(updateIncome.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to update income'
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update income',
        })
      })
      
      // Delete income
      .addCase(deleteIncome.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(deleteIncome.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.incomes = state.incomes.filter(income => income.incomeId !== action.payload)
        toast({
          description: 'Income deleted successfully!',
        })
      })
      .addCase(deleteIncome.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to delete income'
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to delete income',
        })
      })
  },
})

// Actions
export const { clearError } = incomesSlice.actions

// Selectors
export const selectIncomes = (state: RootState) => state.incomes.incomes
export const selectIncomesStatus = (state: RootState) => state.incomes.status
export const selectIncomesError = (state: RootState) => state.incomes.error

export default incomesSlice.reducer
