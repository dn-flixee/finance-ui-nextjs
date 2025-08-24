// src/lib/features/accounts/accountsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '@/lib/store'
import axios from 'axios'
import { toast } from '@/components/ui/use-toast'
import { FinanceAccount, CreateFinanceAccountInput, UpdateFinanceAccountInput } from '@/lib/types'

interface AccountsState {
  accounts: FinanceAccount[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: AccountsState = {
  accounts: [],
  status: 'idle',
  error: null,
}

const ACCOUNTS_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL + '/api/v1/accounts'

// Async thunks
export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async () => {
    const response = await axios.get(ACCOUNTS_API_BASE_URL)
    return response.data
  }
)

export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (account: CreateFinanceAccountInput) => {
    const response = await axios.post(ACCOUNTS_API_BASE_URL, account)
    return response.data
  }
)

export const updateAccount = createAsyncThunk(
  'accounts/updateAccount',
  async (account: UpdateFinanceAccountInput) => {
    const response = await axios.put(ACCOUNTS_API_BASE_URL, account)
    return response.data
  }
)

export const deleteAccount = createAsyncThunk(
  'accounts/deleteAccount',
  async (accountId: string) => {
    await axios.delete(`${ACCOUNTS_API_BASE_URL}?accountId=${accountId}`)
    return accountId
  }
)

// Slice
const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch accounts
      .addCase(fetchAccounts.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.accounts = action.payload.accounts || action.payload
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to fetch accounts'
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch accounts',
        })
      })
      
      // Create account
      .addCase(createAccount.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.accounts.unshift(action.payload)
        toast({
          description: 'Account created successfully!',
        })
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to create account'
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create account',
        })
      })
      
      // Update account
      .addCase(updateAccount.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.accounts.findIndex(account => account.accountId === action.payload.accountId)
        if (index !== -1) {
          state.accounts[index] = action.payload
        }
        toast({
          description: 'Account updated successfully!',
        })
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to update account'
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update account',
        })
      })
      
      // Delete account
      .addCase(deleteAccount.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.accounts = state.accounts.filter(account => account.accountId !== action.payload)
        toast({
          description: 'Account deleted successfully!',
        })
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to delete account'
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to delete account',
        })
      })
  },
})

// Actions
export const { clearError } = accountsSlice.actions

// Selectors
export const selectAccounts = (state: RootState) => state.accounts.accounts
export const selectAccountsStatus = (state: RootState) => state.accounts.status
export const selectAccountsError = (state: RootState) => state.accounts.error

export default accountsSlice.reducer
