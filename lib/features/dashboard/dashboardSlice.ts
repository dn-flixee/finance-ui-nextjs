// src/lib/features/dashboard/dashboardSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '@/lib/store'
import axios from 'axios'
import { toast } from '@/components/ui/use-toast'
import { DashboardStats } from '@/lib/types'

interface DashboardState {
  stats: DashboardStats | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: DashboardState = {
  stats: null,
  status: 'idle',
  error: null,
}

const DASHBOARD_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL + '/api/v1/dashboard'

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async () => {
    const response = await axios.get(`${DASHBOARD_API_BASE_URL}/stats`)
    return response.data
  }
)

// Slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.stats = action.payload.stats
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to fetch dashboard stats'
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load dashboard data',
        })
      })
  },
})

export const { clearError } = dashboardSlice.actions

export const selectDashboardStats = (state: RootState) => state.dashboard.stats
export const selectDashboardStatus = (state: RootState) => state.dashboard.status
export const selectDashboardError = (state: RootState) => state.dashboard.error

export default dashboardSlice.reducer
