// src/lib/features/splitwise/splitwiseSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '@/lib/store'
import axios from 'axios'
import { toast } from '@/components/ui/use-toast'
import { SplitwiseExpense } from '@/lib/types'

// Enhanced interface for splitwise participant
export interface SplitwiseParticipant {
  user_id: string
  first_name: string
  last_name?: string
  email?: string
  paid_share: string
  owed_share: string
  net_balance: string
}

// Enhanced interface for splitwise expense with all fields
export interface SplitwiseExpenseData extends SplitwiseExpense {
  participants: SplitwiseParticipant[]
}

interface SplitwiseState {
  expenses: SplitwiseExpenseData[]
  isConnected: boolean
  connectionStatus: 'idle' | 'checking' | 'connected' | 'disconnected' | 'error'
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  syncStatus: 'idle' | 'syncing' | 'completed' | 'failed'
  lastSyncTime: string | null
}

const initialState: SplitwiseState = {
  expenses: [],
  isConnected: false,
  connectionStatus: 'idle',
  status: 'idle',
  error: null,
  syncStatus: 'idle',
  lastSyncTime: null,
}

const SPLITWISE_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL + '/api/v1/splitwise'

// Async thunks for Splitwise operations
export const checkSplitwiseConnection = createAsyncThunk(
  'splitwise/checkConnection',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${SPLITWISE_API_BASE_URL}/connection`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to check connection')
    }
  }
)

export const connectToSpiltwise = createAsyncThunk(
  'splitwise/connect',
  async (authCode: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${SPLITWISE_API_BASE_URL}/connect`, {
        code: authCode
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to connect to Splitwise')
    }
  }
)

export const fetchSplitwiseExpenses = createAsyncThunk(
  'splitwise/fetchExpenses',
  async (params?: { limit?: number; offset?: number }, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams()
      if (params?.limit) searchParams.set('limit', params.limit.toString())
      if (params?.offset) searchParams.set('offset', params.offset.toString())
      
      const url = `${SPLITWISE_API_BASE_URL}/expenses${searchParams.toString() ? '?' + searchParams.toString() : ''}`
      const response = await axios.get(url)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch Splitwise expenses')
    }
  }
)

export const syncSplitwiseExpenses = createAsyncThunk(
  'splitwise/sync',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${SPLITWISE_API_BASE_URL}/sync`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to sync expenses')
    }
  }
)

export const linkSplitwiseExpense = createAsyncThunk(
  'splitwise/linkExpense',
  async (
    { splitwiseId, expenseId }: { splitwiseId: string; expenseId?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${SPLITWISE_API_BASE_URL}/link`, {
        splitwiseId,
        expenseId
      })
      return { splitwiseId, expenseId, ...response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to link expense')
    }
  }
)

export const unlinkSplitwiseExpense = createAsyncThunk(
  'splitwise/unlinkExpense',
  async (splitwiseId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${SPLITWISE_API_BASE_URL}/unlink`, {
        splitwiseId
      })
      return { splitwiseId, ...response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to unlink expense')
    }
  }
)

export const createSplitwiseExpense = createAsyncThunk(
  'splitwise/createExpense',
  async (expenseData: {
    cost: number
    description: string
    currency_code?: string
    group_id?: string
    users: Array<{
      user_id: string
      paid_share?: string
      owed_share?: string
    }>
  }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${SPLITWISE_API_BASE_URL}/create`, expenseData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create Splitwise expense')
    }
  }
)

export const deleteSplitwiseExpense = createAsyncThunk(
  'splitwise/deleteExpense',
  async (expenseId: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${SPLITWISE_API_BASE_URL}/expenses/${expenseId}`)
      return expenseId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete Splitwise expense')
    }
  }
)

export const fetchSplitwiseGroups = createAsyncThunk(
  'splitwise/fetchGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${SPLITWISE_API_BASE_URL}/groups`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch Splitwise groups')
    }
  }
)

export const fetchSplitwiseFriends = createAsyncThunk(
  'splitwise/fetchFriends',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${SPLITWISE_API_BASE_URL}/friends`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch Splitwise friends')
    }
  }
)

// Slice definition
const splitwiseSlice = createSlice({
  name: 'splitwise',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetSyncStatus: (state) => {
      state.syncStatus = 'idle'
    },
    disconnectSplitwise: (state) => {
      state.isConnected = false
      state.connectionStatus = 'disconnected'
      state.expenses = []
      state.error = null
    },
    updateExpenseLocally: (state, action) => {
      const { expenseId, updates } = action.payload
      const expense = state.expenses.find(exp => exp.id === expenseId)
      if (expense) {
        Object.assign(expense, updates)
      }
    }
  },
  extraReducers: (builder) => {
    // Check connection
    builder
      .addCase(checkSplitwiseConnection.pending, (state) => {
        state.connectionStatus = 'checking'
      })
      .addCase(checkSplitwiseConnection.fulfilled, (state, action) => {
        state.connectionStatus = 'connected'
        state.isConnected = action.payload.isConnected || false
        state.error = null
      })
      .addCase(checkSplitwiseConnection.rejected, (state, action) => {
        state.connectionStatus = 'error'
        state.isConnected = false
        state.error = action.payload as string
      })

    // Connect to Splitwise
    builder
      .addCase(connectToSpiltwise.pending, (state) => {
        state.connectionStatus = 'checking'
      })
      .addCase(connectToSpiltwise.fulfilled, (state, action) => {
        state.connectionStatus = 'connected'
        state.isConnected = true
        state.error = null
        toast({
          title: "Connected!",
          description: "Successfully connected to Splitwise",
        })
      })
      .addCase(connectToSpiltwise.rejected, (state, action) => {
        state.connectionStatus = 'error'
        state.isConnected = false
        state.error = action.payload as string
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: action.payload as string,
        })
      })

    // Fetch expenses
    builder
      .addCase(fetchSplitwiseExpenses.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchSplitwiseExpenses.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.expenses = action.payload.splitwiseExpenses || action.payload.expenses || []
        state.error = null
      })
      .addCase(fetchSplitwiseExpenses.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
        toast({
          variant: "destructive",
          title: "Fetch Failed",
          description: "Failed to fetch Splitwise expenses",
        })
      })

    // Sync expenses
    builder
      .addCase(syncSplitwiseExpenses.pending, (state) => {
        state.syncStatus = 'syncing'
      })
      .addCase(syncSplitwiseExpenses.fulfilled, (state, action) => {
        state.syncStatus = 'completed'
        state.expenses = action.payload.expenses || state.expenses
        state.lastSyncTime = new Date().toISOString()
        state.error = null
      })
      .addCase(syncSplitwiseExpenses.rejected, (state, action) => {
        state.syncStatus = 'failed'
        state.error = action.payload as string
      })

    // Link expense
    builder
      .addCase(linkSplitwiseExpense.pending, (state) => {
        // Optionally add loading state for specific expense
      })
      .addCase(linkSplitwiseExpense.fulfilled, (state, action) => {
        const { splitwiseId } = action.payload
        const expense = state.expenses.find(exp => exp.splitwiseId === splitwiseId)
        if (expense) {
          expense.isLinked = true
          expense.linkedExpenseId = action.payload.expenseId || null
        }
      })
      .addCase(linkSplitwiseExpense.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Unlink expense
    builder
      .addCase(unlinkSplitwiseExpense.fulfilled, (state, action) => {
        const { splitwiseId } = action.payload
        const expense = state.expenses.find(exp => exp.splitwiseId === splitwiseId)
        if (expense) {
          expense.isLinked = false
          expense.linkedExpenseId = null
        }
        toast({
          title: "Unlinked",
          description: "Expense unlinked successfully",
        })
      })
      .addCase(unlinkSplitwiseExpense.rejected, (state, action) => {
        state.error = action.payload as string
        toast({
          variant: "destructive",
          title: "Unlink Failed",
          description: action.payload as string,
        })
      })

    // Create expense
    builder
      .addCase(createSplitwiseExpense.fulfilled, (state, action) => {
        state.expenses.unshift(action.payload)
        toast({
          title: "Created!",
          description: "Splitwise expense created successfully",
        })
      })
      .addCase(createSplitwiseExpense.rejected, (state, action) => {
        state.error = action.payload as string
        toast({
          variant: "destructive",
          title: "Creation Failed",
          description: action.payload as string,
        })
      })

    // Delete expense
    builder
      .addCase(deleteSplitwiseExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(exp => exp.id !== action.payload)
        toast({
          title: "Deleted",
          description: "Splitwise expense deleted successfully",
        })
      })
      .addCase(deleteSplitwiseExpense.rejected, (state, action) => {
        state.error = action.payload as string
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: action.payload as string,
        })
      })
  },
})

// Actions
export const { 
  clearError, 
  resetSyncStatus, 
  disconnectSplitwise, 
  updateExpenseLocally 
} = splitwiseSlice.actions

// Selectors
export const selectSplitwiseExpenses = (state: RootState) => state.splitwise.expenses
export const selectSplitwiseConnection = (state: RootState) => state.splitwise.isConnected
export const selectSplitwiseStatus = (state: RootState) => state.splitwise.status
export const selectSplitwiseError = (state: RootState) => state.splitwise.error
export const selectSplitwiseConnectionStatus = (state: RootState) => state.splitwise.connectionStatus
export const selectSplitwiseSyncStatus = (state: RootState) => state.splitwise.syncStatus
export const selectLastSyncTime = (state: RootState) => state.splitwise.lastSyncTime

// Computed selectors
export const selectLinkedExpenses = (state: RootState) => 
  state.splitwise.expenses.filter(expense => expense.isLinked)

export const selectUnlinkedExpenses = (state: RootState) => 
  state.splitwise.expenses.filter(expense => !expense.isLinked)

export const selectExpensesByGroup = (state: RootState, groupId?: string) => 
  groupId 
    ? state.splitwise.expenses.filter(expense => expense.groupId === groupId)
    : state.splitwise.expenses.filter(expense => !expense.groupId)

export const selectMonthlySplitwiseTotal = (state: RootState) => {
  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  
  return state.splitwise.expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear
    })
    .reduce((total, expense) => total + expense.userShare, 0)
}

export const selectSplitwiseStats = (state: RootState) => {
  const expenses = state.splitwise.expenses
  const linkedCount = expenses.filter(exp => exp.isLinked).length
  const totalCount = expenses.length
  const uniqueGroups = new Set(expenses.map(exp => exp.groupName).filter(Boolean)).size
  
  return {
    totalExpenses: totalCount,
    linkedExpenses: linkedCount,
    unlinkedExpenses: totalCount - linkedCount,
    activeGroups: uniqueGroups,
    linkagePercentage: totalCount > 0 ? Math.round((linkedCount / totalCount) * 100) : 0
  }
}

// Legacy selector for backward compatibility (if needed)
export const selectSplitwises = (state: RootState) => ({
  splitwiseExpenses: state.splitwise.expenses,
  status: state.splitwise.status,
  isConnected: state.splitwise.isConnected
})

export default splitwiseSlice.reducer
