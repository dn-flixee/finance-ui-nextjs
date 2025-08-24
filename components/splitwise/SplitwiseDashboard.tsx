// src/components/splitwise/SplitwiseDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSplitwiseSync } from '@/hooks/use-splitwise'
import { 
  DollarSign, 
  Link as LinkIcon, 
  Users, 
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { fetchSplitwiseExpenses, selectSplitwises } from '@/lib/features/splitwise/splitwiseSlice'

interface DashboardStats {
  totalSplitwise: number
  linkedExpenses: { linked: number; total: number }
  activeGroups: number
  syncProgress: number
}

interface FinanceAppExpense {
  id: string
  name: string
  amount: number
  category: string
}

export function SplitwiseDashboard() {

  const splitwiseExpenses = useAppSelector(selectSplitwises)
   const dispatch = useAppDispatch()
   
  const {  isConnected, sync, linkExpense, connect } = useSplitwiseSync()
  const [stats, setStats] = useState<DashboardStats>({
    totalSplitwise: 0,
    linkedExpenses: { linked: 0, total: 0 },
    activeGroups: 0,
    syncProgress: 0
  })
  const [financeExpenses, setFinanceExpenses] = useState<FinanceAppExpense[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isConnected) {
      calculateStats()
      loadSampleFinanceExpenses()
    }
  }, [isConnected])

    useEffect(() => {
      if(splitwiseExpenses.status === 'idle'){
        dispatch(fetchSplitwiseExpenses())
      }

    }, [dispatch,splitwiseExpenses.status]);


  const calculateStats = () => {
    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()
      console.log("splitwise",splitwiseExpenses.splitwiseExpenses)
    
    const monthlyExpenses = splitwiseExpenses.splitwiseExpenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear
    })

    const totalSplitwise = monthlyExpenses.reduce((sum, expense) => sum + expense.userShare, 0)
    const linkedCount = splitwiseExpenses.splitwiseExpenses.filter(expense => expense.isLinked).length
    console.log("linkedCount",totalSplitwise)
    const uniqueGroups = new Set(splitwiseExpenses.splitwiseExpenses.map(expense => expense.groupName)).size
    
    setStats({
      totalSplitwise,
      linkedExpenses: { linked: linkedCount, total: splitwiseExpenses.splitwiseExpenses.length },
      activeGroups: uniqueGroups,
      syncProgress: splitwiseExpenses.splitwiseExpenses.length > 0 ? Math.round((linkedCount / splitwiseExpenses.splitwiseExpenses.length) * 100) : 33
    })
  }

  const loadSampleFinanceExpenses = () => {
    // Sample data matching your image
    setFinanceExpenses([
      { id: '1', name: 'Restaurant Expense', amount: 800, category: 'Food & Drinks' },
      { id: '2', name: 'Transportation', amount: 600, category: 'Travel' },
      { id: '3', name: 'Entertainment', amount: 267, category: 'Entertainment' }
    ])
  }

  const handleSync = async () => {
    setIsLoading(true)
    try {
      await sync()
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <Card className="max-w-md mx-auto bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Connect Splitwise</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">Connect your Splitwise account to get started.</p>
            <Button onClick={connect}>Connect Splitwise</Button>
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <DollarSign className="mr-2 w-6 h-6" />
                Splitwise Integration
              </h1>
              <p className="text-green-100 mt-1">Sync and manage your shared expenses</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-700 text-green-100 hover:bg-green-700">
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
                  <p className="text-3xl font-bold text-white">₹{stats.totalSplitwise}</p>
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
            <CardContent className="space-y-4">
              {/* Sample Splitwise Expenses */}
              {splitwiseExpenses.splitwiseExpenses.map((expense) => (
                <div key={expense.id} className="bg-gray-750 border border-gray-600 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-base">{expense.description}</h3>
                      <p className="text-gray-400 text-sm">{expense.groupName}</p>
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
                          {expense.participants?.map(p => p.first_name).join(', ') || 'No participants'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-white font-bold text-lg">₹{expense.userShare}</p>
                      <p className="text-gray-400 text-xs">of ₹{expense.totalAmount}</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-3 border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => handleLinkExpense(expense)}
                      >
                        <LinkIcon className="w-3 h-3 mr-1" />
                        {expense.isLinked ? "View" : "Link"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}


              {/* <div className="bg-gray-750 border border-gray-600 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-base">Uber to Airport</h3>
                    <p className="text-gray-400 text-sm">Travel Buddies</p>
                    <p className="text-gray-500 text-xs mt-1">2024-01-14</p>
                    <div className="flex items-center space-x-2 mt-3">
                      <Badge variant="outline" className="text-xs border-purple-500 text-purple-400 bg-purple-500/10">
                        Travel
                      </Badge>
                      <Badge variant="default" className="text-xs bg-green-600">
                        Linked
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 mt-2 text-xs text-gray-400">
                      <Users className="w-3 h-3" />
                      <span>You, Charlie</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-white font-bold text-lg">₹600</p>
                    <p className="text-gray-400 text-xs">of ₹1200</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-3 border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <LinkIcon className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div> */}
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
            <CardContent className="space-y-4">
              {financeExpenses.map((expense) => (
                <div key={expense.id} className="bg-gray-750 border border-gray-600 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-medium text-base">{expense.name}</h3>
                      <p className="text-gray-400 text-sm">{expense.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">₹{expense.amount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SplitwiseDashboard
