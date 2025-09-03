// src/app/(dashboard)/transfers/page.tsx
"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from '@/components/ui/use-toast'
import { 
  ArrowRightLeft, 
  Plus, 
  Loader2,
  ArrowRight
} from 'lucide-react'
import TransferSheet from './TransferSheet'
import NavBar from '@/components/NavBar'

import { 
  selectTransfers, 
  selectTransfersStatus,
  selectTransfersError,
  fetchTransfers 
} from '@/lib/features/transfer/transferSlice'
import { 
  fetchAccounts, 
  selectAccounts,
  selectAccountsStatus
} from '@/lib/features/account/accountSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { Transfer, FinanceAccount } from '@/lib/types'

export default function TransfersPage() {
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  // Redux selectors
  const transfers = useAppSelector(selectTransfers)
  const transfersStatus = useAppSelector(selectTransfersStatus)
  const transfersError = useAppSelector(selectTransfersError)
  
  const accounts = useAppSelector(selectAccounts)
  const accountsStatus = useAppSelector(selectAccountsStatus)

  // Local state
  const [isTransferSheetOpen, setIsTransferSheetOpen] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null)

  // Fetch data on component mount
  useEffect(() => {
    if (transfersStatus === 'idle') {
      dispatch(fetchTransfers())
    }
  }, [dispatch, transfersStatus])

  useEffect(() => {
    if (accountsStatus === 'idle') {
      dispatch(fetchAccounts())
    }
  }, [dispatch, accountsStatus])

  // Error handling
  useEffect(() => {
    if (transfersError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load transfers. Please try again.",
      })
    }
  }, [transfersError, toast])

  // Sheet handlers
  const openTransferSheet = (transfer: Transfer | null = null) => {
    setSelectedTransfer(transfer)
    setIsTransferSheetOpen(true)
  }

  const closeTransferSheet = () => {
    setIsTransferSheetOpen(false)
    setSelectedTransfer(null)
  }

  const isLoading = transfersStatus === 'loading' || accountsStatus === 'loading'

  if (isLoading && transfers.length === 0) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading transfers...</span>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Transfers</h1>
              <p className="text-gray-400">Move money between your accounts</p>
            </div>
            <Button onClick={() => openTransferSheet()} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Transfer
            </Button>
          </div>

          {/* Transfers List */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <ArrowRightLeft className="w-5 h-5 mr-2" />
                Recent Transfers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transfers.length === 0 ? (
                <div className="text-center py-12">
                  <ArrowRightLeft className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No transfers yet</h3>
                  <p className="text-gray-400 mb-6">Transfer money between your accounts to get started</p>
                  <Button onClick={() => openTransferSheet()} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Transfer
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {transfers.map((transfer) => (
                    <div 
                      key={transfer.transferId} 
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                      onClick={() => openTransferSheet(transfer)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <ArrowRight className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{transfer.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <span>{transfer.fromAccountName || 'Unknown Account'}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span>{transfer.toAccountName || 'Unknown Account'}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(transfer.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-400 text-lg">
                          ₹{transfer.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transfer Sheet */}
        <TransferSheet 
          accountData={accounts} 
          isOpen={isTransferSheetOpen} 
          onClose={closeTransferSheet} 
          transferToEdit={selectedTransfer} 
        />
      </div>
    </>
  )
}
