// src/app/(dashboard)/dashboard/page.tsx
"use client"
import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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
  ArrowDownRight
} from 'lucide-react'

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  
  const dashboardStats = useAppSelector(selectDashboardStats)
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Financial Dashboard</h1>
            <p className="text-gray-400">Overview of your financial status for {currentMonth}</p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Balance */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Balance
                </CardTitle>
                <DollarSign className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ₹{dashboardStats?.totalBalance?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Across {dashboardStats?.accountsCount || 0} accounts
                </p>
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
                  This month
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
                  This month
                </p>
              </CardContent>
            </Card>

            {/* Net Income */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Net Income
                </CardTitle>
                <Activity className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {netIncome >= 0 ? '+' : ''}₹{netIncome.toLocaleString()}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Income - Expenses
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Accounts and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Accounts Overview */}
            <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Accounts Overview</CardTitle>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Account
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accounts.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                      <p>No accounts found</p>
                      <Button size="sm" className="mt-4">Add your first account</Button>
                    </div>
                  ) : (
                    accounts.slice(0, 4).map((account) => (
                      <div key={account.accountId} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{account.name}</p>
                            <p className="text-sm text-gray-400">{account.accountType}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">₹{account.balance.toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Add Income
                </Button>
                <Button className="w-full justify-start bg-red-600 hover:bg-red-700">
                  <ArrowDownRight className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
                <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                  <Activity className="h-4 w-4 mr-2" />
                  Transfer Money
                </Button>
                <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Accounts
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <Button variant="outline" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              {dashboardStats?.recentTransactions?.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p>No recent transactions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboardStats?.recentTransactions?.slice(0, 5).map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-600' : 
                          transaction.type === 'expense' ? 'bg-red-600' : 'bg-blue-600'
                        }`}>
                          {transaction.type === 'income' ? 
                            <ArrowUpRight className="h-4 w-4 text-white" /> :
                            transaction.type === 'expense' ? 
                            <ArrowDownRight className="h-4 w-4 text-white" /> :
                            <Activity className="h-4 w-4 text-white" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-white">{transaction.name}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`font-bold ${
                        transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
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
