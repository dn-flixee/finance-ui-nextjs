// src/lib/features/incomeSources/incomeSourcesSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '@/lib/store'
import axios from 'axios'
import { toast } from '@/components/ui/use-toast'
import { IncomeSource, CreateIncomeSourceInput, UpdateIncomeSourceInput } from '@/lib/types'

interface IncomeSourcesState {
  incomeSources: IncomeSource[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: IncomeSourcesState = {
  incomeSources: [],
  status: 'idle',
  error: null,
}

const INCOME_SOURCES_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL + '/api/v1/incomeSource'

// Async thunks
export const fetchIncomeSources = createAsyncThunk(
  'incomeSources/fetchIncomeSources',
  async () => {
    const response = await axios.get(INCOME_SOURCES_API_BASE_URL)
    return response.data
  }
)

export const createIncomeSource = createAsyncThunk(
  'incomeSources/createIncomeSource',
  async (incomeSource: CreateIncomeSourceInput) => {
    const response = await axios.post(INCOME_SOURCES_API_BASE_URL, incomeSource)
    return response.data
  }
)

export const updateIncomeSource = createAsyncThunk(
  'incomeSources/updateIncomeSource',
  async (incomeSource: UpdateIncomeSourceInput) => {
    const response = await axios.put(INCOME_SOURCES_API_BASE_URL, incomeSource)
    return response.data
  }
)

export const deleteIncomeSource = createAsyncThunk(
  'incomeSources/deleteIncomeSource',
  async (incomeSourceId: string) => {
    await axios.delete(`${INCOME_SOURCES_API_BASE_URL}?incomeSourceId=${incomeSourceId}`)
    return incomeSourceId
  }
)

// Slice
const incomeSourcesSlice = createSlice({
  name: 'incomeSources',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncomeSources.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchIncomeSources.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.incomeSources = action.payload.incomeSources || action.payload
      })
      .addCase(fetchIncomeSources.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to fetch income sources'
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch income sources',
        })
      })
      
      .addCase(createIncomeSource.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(createIncomeSource.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.incomeSources.unshift(action.payload)
        toast({
          description: 'Income source created successfully!',
        })
      })
      .addCase(createIncomeSource.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to create income source'
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create income source',
        })
      })
      
      .addCase(updateIncomeSource.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.incomeSources.findIndex(source => source.incomeSourceId === action.payload.incomeSourceId)
        if (index !== -1) {
          state.incomeSources[index] = action.payload
        }
        toast({
          description: 'Income source updated successfully!',
        })
      })
      
      .addCase(deleteIncomeSource.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.incomeSources = state.incomeSources.filter(source => source.incomeSourceId !== action.payload)
        toast({
          description: 'Income source deleted successfully!',
        })
      })
  },
})

export const { clearError } = incomeSourcesSlice.actions

export const selectIncomeSources = (state: RootState) => state.incomeSources.incomeSources
export const selectIncomeSourcesStatus = (state: RootState) => state.incomeSources.status
export const selectIncomeSourcesError = (state: RootState) => state.incomeSources.error

export default incomeSourcesSlice.reducer
