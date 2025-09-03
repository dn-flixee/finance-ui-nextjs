// src/app/(dashboard)/accounts/page.tsx
"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from '@/components/ui/use-toast'
import { 
  Plus, 
  CreditCard, 
  Wallet, 
  PiggyBank, 
  TrendingUp,
  Loader2,
  Edit,
  Trash2
} from 'lucide-react'
import AccountSheet from './AccountSheet'
import NavBar from '@/components/NavBar'

import { 
  selectAccounts, 
  selectAccountsStatus,
  selectAccountsError,
  fetchAccounts,
  deleteAccount
} from '@/lib/features/account/accountSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { FinanceAccount, AccountType } from '@/lib/types'

export default function AccountsPage() {
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  // Redux selectors
  const accounts = useAppSelector(selectAccounts)
  const accountsStatus = useAppSelector(selectAccountsStatus)
  const accountsError = useAppSelector(selectAccountsError)

  // Local state
  const [isAccountSheetOpen, setIsAccountSheetOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<FinanceAccount | null>(null)

  // Fetch accounts on component mount
  useEffect(() => {
    if (accountsStatus === 'idle') {
      dispatch(fetchAccounts())
    }
  }, [dispatch, accountsStatus])

  // Error handling
  useEffect(() => {
    if (accountsError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load accounts. Please try again.",
      })
    }
  }, [accountsError, toast])

  // Sheet handlers
  const openAccountSheet = (account: FinanceAccount | null = null) => {
    setSelectedAccount(account)
    setIsAccountSheetOpen(true)
  }

  const closeAccountSheet = () => {
    setIsAccountSheetOpen(false)
    setSelectedAccount(null)
  }

  // Delete account handler
  const handleDeleteAccount = async (accountId: string, accountName: string) => {
    if (window.confirm(`Are you sure you want to delete "${accountName}"? This action cannot be undone.`)) {
      try {
        await dispatch(deleteAccount(accountId)).unwrap()
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete account. It may have associated transactions.",
        })
      }
    }
  }

  // Get account icon based on type
  const getAccountIcon = (accountType: AccountType) => {
    switch (accountType) {
      case AccountType.CHECKING:
        return <CreditCard className="h-6 w-6" />
      case AccountType.SAVINGS:
        return <PiggyBank className="h-6 w-6" />
      case AccountType.CREDIT_CARD:
        return <CreditCard className="h-6 w-6" />
      case AccountType.INVESTMENT:
        return <TrendingUp className="h-6 w-6" />
      default:
        return <Wallet className="h-6 w-6" />
    }
  }

  // Get account type color
  const getAccountTypeColor = (accountType: AccountType) => {
    switch (accountType) {
      case AccountType.CHECKING:
        return 'bg-blue-600'
      case AccountType.SAVINGS:
        return 'bg-green-600'
      case AccountType.CREDIT_CARD:
        return 'bg-red-600'
      case AccountType.INVESTMENT:
        return 'bg-purple-600'
      case AccountType.LOAN:
        return 'bg-orange-600'
      default:
        return 'bg-gray-600'
    }
  }

  // Calculate totals
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
  const totalAssets = accounts
    .filter(acc => [AccountType.CHECKING, AccountType.SAVINGS, AccountType.INVESTMENT, AccountType.CASH].includes(acc.accountType))
    .reduce((sum, account) => sum + Math.max(account.balance, 0), 0)
  const totalLiabilities = accounts
    .filter(acc => [AccountType.CREDIT_CARD, AccountType.LOAN].includes(acc.accountType))
    .reduce((sum, account) => sum + Math.abs(Math.min(account.balance, 0)), 0)

  if (accountsStatus === 'loading' && accounts.length === 0) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading accounts...</span>
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
              <h1 className="text-3xl font-bold text-white mb-2">Accounts</h1>
              <p className="text-gray-400">Manage your financial accounts</p>
            </div>
            <Button onClick={() => openAccountSheet()} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Net Worth</CardTitle>
                <Wallet className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ₹{totalBalance.toLocaleString()}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Assets - Liabilities
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Assets</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  ₹{totalAssets.toLocaleString()}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Cash + Investments
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Liabilities</CardTitle>
                <CreditCard className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                  ₹{totalLiabilities.toLocaleString()}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Credit Cards + Loans
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Accounts List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Wallet className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No accounts yet</h3>
                <p className="text-gray-400 mb-6">Add your first account to start tracking your finances</p>
                <Button onClick={() => openAccountSheet()} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Account
                </Button>
              </div>
            ) : (
              accounts.map((account) => (
                <Card key={account.accountId} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 ${getAccountTypeColor(account.accountType)} rounded-full flex items-center justify-center text-white`}>
                          {getAccountIcon(account.accountType)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{account.name}</h3>
                          <Badge variant="outline" className="text-xs mt-1">
                            {account.accountType.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openAccountSheet(account)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAccount(account.accountId, account.name)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400">Current Balance</p>
                        <p className={`text-2xl font-bold ${
                          account.balance >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          ₹{account.balance.toLocaleString()}
                        </p>
                      </div>

                      {account.creditLimit && account.accountType === AccountType.CREDIT_CARD && (
                        <div>
                          <p className="text-sm text-gray-400">Credit Limit</p>
                          <p className="text-lg text-white">₹{account.creditLimit.toLocaleString()}</p>
                          <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                            <div
                              className="bg-red-500 h-2 rounded-full"
                              style={{
                                width: `${Math.min((Math.abs(account.balance) / account.creditLimit) * 100, 100)}%`
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {Math.round((Math.abs(account.balance) / account.creditLimit) * 100)}% utilized
                          </p>
                        </div>
                      )}

                      {account.bankName && (
                        <div>
                          <p className="text-sm text-gray-400">Bank</p>
                          <p className="text-sm text-white">{account.bankName}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Account Sheet */}
        <AccountSheet
          isOpen={isAccountSheetOpen}
          onClose={closeAccountSheet}
          accountToEdit={selectedAccount}
        />
      </div>
    </>
  )
}
