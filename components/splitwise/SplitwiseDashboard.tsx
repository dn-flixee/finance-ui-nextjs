// src/components/splitwise/SplitwiseDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
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
  Unlink,
  Zap,
  ArrowRight
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

interface FriendBalance {
  friendId: string
  name: string
  email?: string
  netBalance: number
  currency: string
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
    syncProgress: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isAutoReconciling, setIsAutoReconciling] = useState(false)
  const [isLinking, setIsLinking] = useState<string | null>(null)
  const [friendBalances, setFriendBalances] = useState<FriendBalance[]>([])
  const [totalIOUsOwedToUser, setTotalIOUsOwedToUser] = useState(0)

  // Fetch balances
  const fetchBalances = async () => {
    try {
      const res = await axios.get('/api/v1/splitwise/balances')
      if (res.data) {
        setFriendBalances(res.data.friends || [])
        setTotalIOUsOwedToUser(res.data.totalIOUsOwedToUser || 0)
      }
    } catch (err) {
      console.warn('Could not load Splitwise balances:', err)
    }
  }

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
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    if (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Failed to connect to Splitwise. Please try again.",
        duration: 5000,
      })
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
      dispatch(fetchSplitwiseExpenses())
      dispatch(fetchExpenses({ recent: true, limit: 20 }))
      fetchBalances()
    }
  }, [dispatch, isConnected])

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
      syncProgress: splitwiseExpenses.length > 0 ? Math.round((linkedCount / splitwiseExpenses.length) * 100) : 0
    })
  }

  const handleSync = async () => {
    setIsLoading(true)
    try {
      const res: any = await dispatch(syncSplitwiseExpenses()).unwrap()
      await fetchBalances()
      dispatch(fetchExpenses({ recent: true, limit: 20 }))
      toast({
        title: "Sync Successful",
        description: res?.autoReconciled > 0 
          ? `Synced Splitwise and automatically reconciled ${res.autoReconciled} transactions!` 
          : "Splitwise expenses and balances synced successfully!",
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

  const handleAutoReconcile = async () => {
    setIsAutoReconciling(true)
    try {
      const res = await axios.post('/api/v1/reconciliation/auto')
      toast({
        title: "Auto-Reconciliation Complete",
        description: res.data.message || `Reconciled ${res.data.reconciledCount} transactions!`
      })
      dispatch(fetchSplitwiseExpenses())
      dispatch(fetchExpenses({ recent: true, limit: 20 }))
      fetchBalances()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Auto-Reconcile Failed",
        description: error.response?.data?.error || error.message
      })
    } finally {
      setIsAutoReconciling(false)
    }
  }

  const handleReconcile = async (splitwiseId: string, expenseId: string) => {
    setIsLinking(splitwiseId)
    try {
      await axios.post('/api/v1/reconciliation/reconcile', {
        splitwiseId,
        expenseId
      })
      toast({
        title: "Reconciliation Successful",
        description: "Bank transaction split into user share + pending friend IOUs!",
      })
      dispatch(fetchSplitwiseExpenses())
      dispatch(fetchExpenses({ recent: true, limit: 20 }))
      fetchBalances()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Reconciliation Failed",
        description: error.response?.data?.error || error.message || "Failed to link",
      })
    } finally {
      setIsLinking(null)
    }
  }

  const handleUnreconcile = async (expenseId: string) => {
    setIsLinking(expenseId)
    try {
      await axios.post('/api/v1/reconciliation/unreconcile', { expenseId })
      toast({
        title: "Unlinked",
        description: "Reconciliation reversed. Expense restored to full amount.",
      })
      dispatch(fetchSplitwiseExpenses())
      dispatch(fetchExpenses({ recent: true, limit: 20 }))
      fetchBalances()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Unlink Failed",
        description: error.response?.data?.error || error.message,
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
    localStorage.removeItem('splitwise_oauth_state')
    localStorage.setItem('splitwise_oauth_state', state)
    window.location.assign(authUrl)
  }

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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-white text-xl">Connect to Splitwise</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-6">
              Connect your Splitwise account to automatically reconcile shared bills and track friend IOUs.
            </p>
            <Button 
              onClick={handleConnect}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Connect Splitwise Account
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <DollarSign className="mr-2 w-8 h-8 text-green-400" />
            Splitwise & Reconciliation Hub
          </h1>
          <p className="text-gray-400 mt-1">Reconcile bank debits with Splitwise shared expenses</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={handleAutoReconcile}
            disabled={isAutoReconciling}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Zap className={`w-4 h-4 mr-2 ${isAutoReconciling ? 'animate-spin' : ''}`} />
            Auto-Reconcile Matches
          </Button>
          <Button 
            onClick={handleSync} 
            disabled={isLoading}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Splitwise
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Pending IOUs (Owed to You)</p>
                <p className="text-3xl font-bold text-green-400">
                  ₹{totalIOUsOwedToUser.toLocaleString()}
                </p>
                <p className="text-gray-500 text-xs mt-1">Across all friends</p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Reconciled Expenses</p>
                <p className="text-3xl font-bold text-white">
                  {stats.linkedExpenses.linked}/{stats.linkedExpenses.total}
                </p>
                <p className="text-gray-500 text-xs mt-1">Matched with bank feeds</p>
              </div>
              <LinkIcon className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Your Monthly Share</p>
                <p className="text-3xl font-bold text-white">
                  ₹{stats.totalSplitwise.toLocaleString()}
                </p>
                <p className="text-gray-500 text-xs mt-1">Actual budget impact</p>
              </div>
              <TrendingUp className="w-8 h-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-full">
                <p className="text-gray-400 text-sm font-medium">Reconciliation Progress</p>
                <p className="text-3xl font-bold text-white">{stats.syncProgress}%</p>
                <div className="mt-3 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${stats.syncProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Friends Who Owe Money */}
      {friendBalances.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              Friends Balances (Splitwise Ledger)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {friendBalances.map(f => (
                <div key={f.friendId} className="p-3 bg-gray-750 border border-gray-700 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-white">{f.name}</p>
                    <p className="text-xs text-gray-500">{f.email || 'Splitwise Friend'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${f.netBalance > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {f.netBalance > 0 ? `+₹${f.netBalance.toLocaleString()}` : `-₹${Math.abs(f.netBalance).toLocaleString()}`}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      {f.netBalance > 0 ? 'Owes you' : 'You owe'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two Column Grid: Splitwise Expenses vs Finance App Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Splitwise Expenses */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                S
              </div>
              <div>
                <CardTitle className="text-white text-base">Splitwise Expenses</CardTitle>
                <p className="text-gray-400 text-xs">Shared expenses imported from Splitwise</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {splitwiseExpenses.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <p>No Splitwise expenses found. Sync your account.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {splitwiseExpenses.map((expense) => {
                  // Find candidate matching finance expense
                  const matchingFinance = financeExpenses.find(fe => 
                    !fe.isSplitwiseLinked && Math.abs(fe.amount - expense.totalAmount) < 2
                  )

                  return (
                    <div key={expense.id} className="bg-gray-750 border border-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-medium text-sm">{expense.description}</h3>
                            <Badge 
                              variant={expense.isLinked ? "default" : "outline"} 
                              className={`text-[10px] ${expense.isLinked ? 'bg-green-600 text-white' : 'border-gray-500 text-gray-400'}`}
                            >
                              {expense.isLinked ? "Reconciled" : "Unlinked"}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-xs mt-1">
                            {new Date(expense.date).toLocaleDateString()} • {expense.category || 'General'}
                          </p>
                          <p className="text-xs text-gray-300 mt-1">
                            Paid by: <span className="font-semibold text-white">{expense.paidBy}</span> • Your Share: <span className="text-green-400 font-semibold">₹{expense.userShare}</span>
                          </p>
                        </div>
                        <div className="text-right ml-3">
                          <p className="text-white font-bold text-base">
                            ₹{expense.totalAmount.toLocaleString()}
                          </p>
                          {expense.isLinked ? (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="mt-2 h-7 text-xs text-red-400 hover:text-red-300 hover:bg-gray-700"
                              onClick={() => handleUnreconcile(expense.linkedExpenseId!)}
                              disabled={isLinking === expense.linkedExpenseId}
                            >
                              <Unlink className="w-3 h-3 mr-1" />
                              Unlink
                            </Button>
                          ) : matchingFinance ? (
                            <Button 
                              size="sm" 
                              className="mt-2 h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                              onClick={() => handleReconcile(expense.splitwiseId, matchingFinance.expenseId)}
                              disabled={isLinking === expense.splitwiseId}
                            >
                              <LinkIcon className="w-3 h-3 mr-1" />
                              Match with &quot;{matchingFinance.name}&quot;
                            </Button>
                          ) : (
                            <span className="text-[10px] text-gray-500 block mt-2">No bank match</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Finance App Expenses */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                ₹
              </div>
              <div>
                <CardTitle className="text-white text-base">Bank Expenses</CardTitle>
                <p className="text-gray-400 text-xs">Bank debits from accounts and statement imports</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {financeExpenses.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <p>No bank expenses recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {financeExpenses.map((expense) => {
                  const matchingSw = splitwiseExpenses.find(se => 
                    !se.isLinked && Math.abs(se.totalAmount - expense.amount) < 2
                  )

                  return (
                    <div key={expense.expenseId} className="bg-gray-750 border border-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-medium text-sm">{expense.name}</h3>
                            {expense.isReconciled ? (
                              <Badge className="bg-blue-600/30 text-blue-300 border border-blue-500 text-[10px]">
                                Reconciled
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] border-gray-600 text-gray-400">
                                Unreconciled
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs mt-1">
                            {new Date(expense.date).toLocaleDateString()} • {expense.accountName || 'Account'}
                          </p>
                          {expense.isReconciled ? (
                            <p className="text-xs text-blue-300 mt-1">
                              Budget Impact: <span className="font-semibold text-white">₹{expense.userShare ?? 0}</span> • Friend IOU: <span className="font-semibold text-green-400">+₹{expense.iouAmount ?? 0}</span>
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400 mt-1">
                              Full amount hits budget: ₹{expense.amount}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-3">
                          <p className="text-white font-bold text-base">
                            ₹{expense.amount.toLocaleString()}
                          </p>
                          {expense.isReconciled ? (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="mt-2 h-7 text-xs text-red-400 hover:text-red-300 hover:bg-gray-700"
                              onClick={() => handleUnreconcile(expense.expenseId)}
                              disabled={isLinking === expense.expenseId}
                            >
                              <Unlink className="w-3 h-3 mr-1" />
                              Unlink
                            </Button>
                          ) : matchingSw ? (
                            <Button 
                              size="sm" 
                              className="mt-2 h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                              onClick={() => handleReconcile(matchingSw.splitwiseId, expense.expenseId)}
                              disabled={isLinking === matchingSw.splitwiseId}
                            >
                              <LinkIcon className="w-3 h-3 mr-1" />
                              Reconcile with &quot;{matchingSw.description}&quot;
                            </Button>
                          ) : (
                            <span className="text-[10px] text-gray-500 block mt-2">No Splitwise match</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SplitwiseDashboard
