// src/lib/features/transfers/transfersSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '@/lib/store'
import axios from 'axios'
import { toast } from '@/components/ui/use-toast'
import { Transfer, CreateTransferInput, UpdateTransferInput } from '@/lib/types'

interface TransfersState {
  transfers: Transfer[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: TransfersState = {
  transfers: [],
  status: 'idle',
  error: null,
}

const TRANSFERS_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL + '/api/v1/transfers'

// Async thunks
export const fetchTransfers = createAsyncThunk(
  'transfers/fetchTransfers',
  async (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())

    const url = `${TRANSFERS_API_BASE_URL}${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    const response = await axios.get(url)
    return response.data
  }
)

export const createTransfer = createAsyncThunk(
  'transfers/createTransfer',
  async (transfer: CreateTransferInput) => {
    const response = await axios.post(TRANSFERS_API_BASE_URL, transfer)
    return response.data
  }
)

export const updateTransfer = createAsyncThunk(
  'transfers/updateTransfer',
  async (transfer: UpdateTransferInput) => {
    const response = await axios.put(TRANSFERS_API_BASE_URL, transfer)
    return response.data
  }
)

export const deleteTransfer = createAsyncThunk(
  'transfers/deleteTransfer',
  async (transferId: string) => {
    await axios.delete(`${TRANSFERS_API_BASE_URL}?transferId=${transferId}`)
    return transferId
  }
)

// Slice
const transfersSlice = createSlice({
  name: 'transfers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransfers.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchTransfers.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.transfers = action.payload.transfers || action.payload
      })
      .addCase(fetchTransfers.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to fetch transfers'
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch transfers',
        })
      })
      
      .addCase(createTransfer.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.transfers.unshift(action.payload)
        toast({
          description: 'Transfer created successfully!',
        })
      })
      
      .addCase(updateTransfer.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.transfers.findIndex(transfer => transfer.transferId === action.payload.transferId)
        if (index !== -1) {
          state.transfers[index] = action.payload
        }
        toast({
          description: 'Transfer updated successfully!',
        })
      })
      
      .addCase(deleteTransfer.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.transfers = state.transfers.filter(transfer => transfer.transferId !== action.payload)
        toast({
          description: 'Transfer deleted successfully!',
        })
      })
  },
})

export const { clearError } = transfersSlice.actions

export const selectTransfers = (state: RootState) => state.transfers.transfers
export const selectTransfersStatus = (state: RootState) => state.transfers.status
export const selectTransfersError = (state: RootState) => state.transfers.error

export default transfersSlice.reducer
