// src/app/(dashboard)/dashboard/page.tsx
"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { 
  fetchDashboardStats, 
  selectDashboardStats, 
  selectDashboardStatus 
} from '@/lib/features/dashboard/dashboardSlice'
import { fetchAccounts, selectAccounts } from '@/lib/features/account/accountSlice'
import { fetchIncomes } from '@/lib/features/income/incomeSlice'
import { fetchExpenses } from '@/lib/features/expense/expenseSlice'
import NavBar from '@/components/NavBar'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Activity, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  FileText, 
  Info,
  CheckCircle2,
  Clock
} from 'lucide-react'

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const [showTrueBalance, setShowTrueBalance] = useState<boolean>(true)
  
  const dashboardStats = useAppSelector(selectDashboardStats) as any
  const dashboardStatus = useAppSelector(selectDashboardStatus)
  const accounts = useAppSelector(selectAccounts)

  useEffect(() => {
    dispatch(fetchDashboardStats())
    dispatch(fetchAccounts())
    dispatch(fetchIncomes({ recent: true, limit: 5 }))
    dispatch(fetchExpenses({ recent: true, limit: 5 }))
  }, [dispatch])

  const currentMonth = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })

  const netIncome = (dashboardStats?.monthlyIncome || 0) - (dashboardStats?.monthlyExpenses || 0)

  // Calculations for True Balance
  const bankBalance = dashboardStats?.totalBalance || 0
  const pendingIOUs = dashboardStats?.pendingIOUsTotal || 0
  const debtsOwed = dashboardStats?.debtsOwedTotal || 0
  const trueBalance = dashboardStats?.trueBalance ?? (bankBalance + pendingIOUs - debtsOwed)

  if (dashboardStatus === 'loading' && !dashboardStats) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Financial Dashboard</h1>
              <p className="text-gray-400">Overview of your financial status for {currentMonth}</p>
            </div>
            <div className="flex items-center gap-3 bg-gray-800 p-2 px-4 rounded-xl border border-gray-700">
              <span className="text-xs text-gray-300 font-medium">
                {showTrueBalance ? '✨ True Balance Mode' : '🏦 Bank Balance Only'}
              </span>
              <Switch 
                checked={showTrueBalance} 
                onCheckedChange={setShowTrueBalance} 
              />
            </div>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total / True Balance Card */}
            <Card className="bg-gray-800 border-gray-700 relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 ${showTrueBalance ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gray-600'}`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  {showTrueBalance ? 'True Net Balance' : 'Total Bank Balance'}
                  <Badge variant="outline" className={`text-xs ${showTrueBalance ? 'border-blue-500 text-blue-400' : 'border-gray-500 text-gray-400'}`}>
                    {showTrueBalance ? 'Reconciled' : 'Raw Bank'}
                  </Badge>
                </CardTitle>
                <DollarSign className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ₹{(showTrueBalance ? trueBalance : bankBalance).toLocaleString()}
                </div>
                {showTrueBalance ? (
                  <div className="text-xs text-gray-400 mt-2 space-y-1">
                    <p className="flex justify-between">
                      <span>Bank:</span>
                      <span className="text-white">₹{bankBalance.toLocaleString()}</span>
                    </p>
                    <p className="flex justify-between text-green-400">
                      <span>+ IOUs Owed to You:</span>
                      <span>+₹{pendingIOUs.toLocaleString()}</span>
                    </p>
                    <p className="flex justify-between text-red-400">
                      <span>- Debts You Owe:</span>
                      <span>-₹{debtsOwed.toLocaleString()}</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">
                    Across {dashboardStats?.accountsCount || 0} accounts
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Monthly Income */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Monthly Income
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  +₹{dashboardStats?.monthlyIncome?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Excludes IOU settlements
                </p>
              </CardContent>
            </Card>

            {/* Monthly Expenses */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Monthly Expenses
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                  -₹{dashboardStats?.monthlyExpenses?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Reconciled (user share only)
                </p>
              </CardContent>
            </Card>

            {/* Net Income */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Net Cash Flow
                </CardTitle>
                <Activity className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {netIncome >= 0 ? '+' : ''}₹{netIncome.toLocaleString()}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Income - Actual Expenses
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pending IOUs & Accounts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Pending IOUs (Receivables) Widget */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-indigo-400" />
                    <CardTitle className="text-white text-base">Pending IOUs (Receivables)</CardTitle>
                  </div>
                  <Badge variant="outline" className="border-indigo-500 text-indigo-400">
                    ₹{pendingIOUs.toLocaleString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {!dashboardStats?.pendingIOUsList || dashboardStats.pendingIOUsList.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm">All settled up!</p>
                    <p className="text-xs text-gray-500">No pending IOUs owed to you.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dashboardStats.pendingIOUsList.map((iou: any) => (
                      <div key={iou.id} className="p-3 bg-gray-750 border border-gray-700 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">{iou.friendName}</p>
                          <p className="text-xs text-gray-400">{iou.notes || iou.expense?.name || 'Shared Expense'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-400">
                            +₹{(iou.amount - iou.settledAmount).toLocaleString()}
                          </p>
                          <span className="text-[10px] text-gray-500">Owed</span>
                        </div>
                      </div>
                    ))}
                    <Link href="/splitwise" className="block pt-2">
                      <Button variant="ghost" size="sm" className="w-full text-indigo-400 hover:text-indigo-300 hover:bg-gray-700">
                        View All in Splitwise Manager &rarr;
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Accounts Overview */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-base">Bank Accounts</CardTitle>
                  <Link href="/account">
                    <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                      Manage
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {accounts.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                      <p className="text-sm">No accounts found</p>
                    </div>
                  ) : (
                    accounts.slice(0, 3).map((account) => (
                      <div key={account.accountId} className="flex items-center justify-between p-3 bg-gray-750 border border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center font-bold text-xs">
                            {account.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{account.name}</p>
                            <p className="text-xs text-gray-400">{account.accountType}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">₹{account.balance.toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions & Reconcile Shortcuts */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/splitwise" className="block">
                  <Button className="w-full justify-start bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Users className="h-4 w-4 mr-2" />
                    Splitwise & Reconciliation
                  </Button>
                </Link>
                <Link href="/income" className="block">
                  <Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-white">
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Add Income / Settlement
                  </Button>
                </Link>
                <Link href="/expense" className="block">
                  <Button className="w-full justify-start bg-red-600 hover:bg-red-700 text-white">
                    <ArrowDownRight className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </Link>
                <Link href="/transfers" className="block">
                  <Button className="w-full justify-start bg-gray-700 hover:bg-gray-600 text-white">
                    <Activity className="h-4 w-4 mr-2" />
                    Internal Transfer (Ignored)
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base">Recent Activity</CardTitle>
                <Badge variant="outline" className="border-gray-600 text-gray-400">Latest 5</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {!dashboardStats?.recentTransactions || dashboardStats.recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p>No recent transactions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboardStats.recentTransactions.slice(0, 5).map((transaction: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-750 border border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-600/20 text-green-400' : 
                          transaction.type === 'expense' ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400'
                        }`}>
                          {transaction.type === 'income' ? 
                            <ArrowUpRight className="h-4 w-4" /> :
                            transaction.type === 'expense' ? 
                            <ArrowDownRight className="h-4 w-4" /> :
                            <Activity className="h-4 w-4" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{transaction.name}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.createdAt || transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-sm ${
                          transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                        </div>
                        {transaction.isReconciled && (
                          <span className="text-[10px] text-blue-400">Splitwise Reconciled</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
