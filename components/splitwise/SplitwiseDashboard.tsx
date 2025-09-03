// src/components/splitwise/SplitwiseDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { useSearchParams } from 'next/navigation'
import { 
  DollarSign, 
  Link as LinkIcon, 
  Users, 
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertCircle,
  ExternalLink,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { 
  fetchSplitwiseExpenses, 
  selectSplitwiseExpenses,
  selectSplitwiseStatus,
  selectSplitwiseError,
  selectSplitwiseConnection,
  syncSplitwiseExpenses,
  linkSplitwiseExpense,
  checkSplitwiseConnection
} from '@/lib/features/splitwise/splitwiseSlice'
import { fetchExpenses, selectExpenses } from '@/lib/features/expense/expenseSlice'

interface DashboardStats {
  totalSplitwise: number
  linkedExpenses: { linked: number; total: number }
  activeGroups: number
  syncProgress: number
}

export function SplitwiseDashboard() {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  // Redux selectors
  const splitwiseExpenses = useAppSelector(selectSplitwiseExpenses)
  const splitwiseStatus = useAppSelector(selectSplitwiseStatus)
  const splitwiseError = useAppSelector(selectSplitwiseError)
  const isConnected = useAppSelector(selectSplitwiseConnection)
  const financeExpenses = useAppSelector(selectExpenses)

  // Local state
  const [stats, setStats] = useState<DashboardStats>({
    totalSplitwise: 0,
    linkedExpenses: { linked: 0, total: 0 },
    activeGroups: 0,
    syncProgress: 33
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLinking, setIsLinking] = useState<string | null>(null)

  // Handle OAuth callback results
  useEffect(() => {
    const connected = searchParams?.get('connected')
    const error = searchParams?.get('error')

    if (connected === 'true') {
      toast({
        title: "Successfully Connected!",
        description: "Your Splitwise account has been connected successfully.",
        duration: 5000,
      })
      // Remove URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    if (error) {
      let errorMessage = 'Failed to connect to Splitwise'
      switch (error) {
        case 'authorization_denied':
          errorMessage = 'Authorization was denied. Please try again.'
          break
        case 'missing_code':
          errorMessage = 'Authorization code was missing.'
          break
        case 'token_exchange_failed':
          errorMessage = 'Failed to exchange authorization code for access token.'
          break
      }
      
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: errorMessage,
        duration: 5000,
      })
      // Remove URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [searchParams, toast])

  // Check connection and fetch data on mount
  useEffect(() => {
    dispatch(checkSplitwiseConnection())
  }, [dispatch])

  // Fetch expenses when connected
  useEffect(() => {
    if (isConnected) {
      if (splitwiseStatus === 'idle') {
        dispatch(fetchSplitwiseExpenses())
      }
      dispatch(fetchExpenses({ recent: true, limit: 5 }))
    }
  }, [dispatch, isConnected, splitwiseStatus])

  // Calculate stats when expenses change
  useEffect(() => {
    if (splitwiseExpenses.length > 0) {
      calculateStats()
    }
  }, [splitwiseExpenses])

  // Handle errors
  useEffect(() => {
    if (splitwiseError) {
      toast({
        variant: "destructive",
        title: "Splitwise Error",
        description: splitwiseError,
      })
    }
  }, [splitwiseError, toast])

  const calculateStats = () => {
    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()
    
    const monthlyExpenses = splitwiseExpenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear
    })

    const totalSplitwise = monthlyExpenses.reduce((sum, expense) => sum + expense.userShare, 0)
    const linkedCount = splitwiseExpenses.filter(expense => expense.isLinked).length
    const uniqueGroups = new Set(splitwiseExpenses.map(expense => expense.groupName).filter(Boolean)).size
    
    setStats({
      totalSplitwise,
      linkedExpenses: { linked: linkedCount, total: splitwiseExpenses.length },
      activeGroups: uniqueGroups,
      syncProgress: splitwiseExpenses.length > 0 ? Math.round((linkedCount / splitwiseExpenses.length) * 100) : 33
    })
  }

  const handleSync = async () => {
    setIsLoading(true)
    try {
      await dispatch(syncSplitwiseExpenses()).unwrap()
      toast({
        title: "Success",
        description: "Splitwise expenses synced successfully!",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: error.message || "Failed to sync Splitwise expenses",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLinkExpense = async (splitwiseExpense: any, financeExpenseId?: string) => {
    setIsLinking(splitwiseExpense.id)
    try {
      await dispatch(linkSplitwiseExpense({
        splitwiseId: splitwiseExpense.splitwiseId,
        expenseId: financeExpenseId
      })).unwrap()
      
      toast({
        title: "Success",
        description: "Expense linked successfully!",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Link Failed",
        description: error.message || "Failed to link expense",
      })
    } finally {
      setIsLinking(null)
    }
  }

    const handleConnect = () => {
      const clientId = process.env.NEXT_PUBLIC_SPLITWISE_CLIENT_ID
      const redirectUri = `${window.location.origin}/api/v1/splitwise/callback`
      const state = Math.random().toString(36).substring(7)

      const authUrl = `https://secure.splitwise.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`

      // Clear any existing OAuth state
      localStorage.removeItem('splitwise_oauth_state')
      localStorage.setItem('splitwise_oauth_state', state)

      // Use location.assign for a clean redirect
      window.location.assign(authUrl)
      }

  // Loading state
  if (splitwiseStatus === 'loading' && splitwiseExpenses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
          <span className="text-white">Loading Splitwise data...</span>
        </div>
      </div>
    )
  }

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <Card className="max-w-md mx-auto bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-white text-xl">Connect to Splitwise</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-6">
              Connect your Splitwise account to sync and manage your shared expenses seamlessly.
            </p>
            <Button 
              onClick={handleConnect}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Connect Splitwise Account
            </Button>
            <p className="text-xs text-gray-500 mt-4">
              Your data is secure and we only read your expense information.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-green-600 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <DollarSign className="mr-2 w-6 h-6" />
                Splitwise Integration
              </h1>
              <p className="text-green-100 mt-1">Sync and manage your shared expenses</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-700 text-green-100 hover:bg-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
              <Button 
                onClick={handleSync} 
                disabled={isLoading}
                className="bg-green-700 hover:bg-green-800 text-white border-0"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Sync Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Splitwise */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Splitwise</p>
                  <p className="text-3xl font-bold text-white">
                    ₹{stats.totalSplitwise.toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-xs">Your share this month</p>
                </div>
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* Linked Expenses */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Linked Expenses</p>
                  <p className="text-3xl font-bold text-white">
                    {stats.linkedExpenses.linked}/{stats.linkedExpenses.total}
                  </p>
                  <p className="text-gray-500 text-xs">Successfully linked</p>
                </div>
                <LinkIcon className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* Active Groups */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Active Groups</p>
                  <p className="text-3xl font-bold text-white">{stats.activeGroups}</p>
                  <p className="text-gray-500 text-xs">Splitwise groups</p>
                </div>
                <Users className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* Sync Progress */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-full">
                  <p className="text-gray-400 text-sm font-medium">Sync Progress</p>
                  <p className="text-3xl font-bold text-white">{stats.syncProgress}%</p>
                  <div className="mt-3 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${stats.syncProgress}%` }}
                    />
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Splitwise Expenses */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <div>
                  <CardTitle className="text-white text-lg">Splitwise Expenses</CardTitle>
                  <p className="text-gray-400 text-sm">Recent expenses from your Splitwise account</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {splitwiseExpenses.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400 mb-2">No Splitwise expenses found</p>
                  <p className="text-gray-500 text-sm">
                    Sync your account to see your shared expenses
                  </p>
                  <Button 
                    onClick={handleSync}
                    className="mt-4 bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Sync Expenses
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {splitwiseExpenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="bg-gray-750 border border-gray-600 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-white font-medium text-base">{expense.description}</h3>
                          <p className="text-gray-400 text-sm">{expense.groupName || 'Personal'}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(expense.date).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-2 mt-3">
                            <Badge variant="outline" className="text-xs border-blue-500 text-blue-400 bg-blue-500/10">
                              {expense.category || 'General'}
                            </Badge>
                            <Badge 
                              variant={expense.isLinked ? "default" : "destructive"} 
                              className="text-xs"
                            >
                              {expense.isLinked ? "Linked" : "Unlinked"}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1 mt-2 text-xs text-gray-400">
                            <Users className="w-3 h-3" />
                            <span>
                              {expense.participants && Array.isArray(expense.participants) 
                                ? expense.participants.map(p => p.first_name).join(', ') 
                                : 'No participants'
                              }
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-white font-bold text-lg">
                            ₹{expense.userShare.toLocaleString()}
                          </p>
                          <p className="text-gray-400 text-xs">
                            of ₹{expense.totalAmount.toLocaleString()}
                          </p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="mt-3 border-gray-600 text-gray-300 hover:bg-gray-700"
                            onClick={() => handleLinkExpense(expense)}
                            disabled={isLinking === expense.id}
                          >
                            {isLinking === expense.id ? (
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            ) : (
                              <LinkIcon className="w-3 h-3 mr-1" />
                            )}
                            {expense.isLinked ? "View" : "Link"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Finance App Expenses */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg">Finance App Expenses</CardTitle>
                  <p className="text-gray-400 text-sm">Your existing expenses that can be linked</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {financeExpenses.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400 mb-2">No recent expenses</p>
                  <p className="text-gray-500 text-sm">
                    Add some expenses to your finance app to see them here
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {financeExpenses.slice(0, 5).map((expense) => (
                    <div key={expense.expenseId} className="bg-gray-750 border border-gray-600 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-white font-medium text-base">{expense.name}</h3>
                          <p className="text-gray-400 text-sm">
                            {expense.expenseSourceName || 'No category'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold text-lg">
                            ₹{expense.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SplitwiseDashboard
