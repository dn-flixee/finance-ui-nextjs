// src/hooks/use-splitwise.ts
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SplitwiseExpense } from '@/types'
import { createExpenseFromSplitwise } from '@/utils/splitwise-helpers'


export function useSplitwiseSync() {
  const { data: session, status } = useSession()
  const [expenses, setExpenses] = useState<SplitwiseExpense[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (status === 'loading') return

    if (session?.user) {
      checkConnection()
    } else {
      setLoading(false)
      setIsConnected(false)
    }
  }, [session, status])

  useEffect(() => {
    if (isConnected) {
      fetchExpenses()
    }
  }, [isConnected])

  // Handle callback success/error messages
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'connected') {
      console.log('Splitwise connected successfully')
      // Refresh connection status
      checkConnection()
      // Clean URL
      router.replace('/splitwise', { scroll: false })
    }

    if (error) {
      console.error('Splitwise connection error:', error)
      // You can show a toast or error message here
    }
  }, [searchParams, router])

  const checkConnection = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/splitwise/connection')
      if (response.ok) {
        const data = await response.json()
        setIsConnected(data.isConnected)
        console.log('Splitwise connection status:', data.isConnected)
      } else {
        console.error('Failed to check connection:', response.status)
        setIsConnected(false)
      }
    } catch (error) {
      console.error('Error checking Splitwise connection:', error)
      setIsConnected(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchExpenses = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/splitwise/expenses')
      if (response.ok) {
        const data = await response.json()
        setExpenses(data.expenses || [])
      } else {
        console.error('Failed to fetch Splitwise expenses')
        setExpenses([])
      }
    } catch (error) {
      console.error('Error fetching Splitwise expenses:', error)
      setExpenses([])
    }
  }

  const connect = () => {
    if (!session?.user) {
      console.error('User not authenticated')
      return
    }

    const clientId = process.env.NEXT_PUBLIC_SPLITWISE_CLIENT_ID
    const redirectUri = `${window.location.origin}/api/splitwise/callback`
    
    console.log('Connecting to Splitwise with:', { clientId, redirectUri })
    
    const authUrl = `https://secure.splitwise.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`
    
    // Store current page for potential return
    sessionStorage.setItem('splitwise_return_url', window.location.pathname)
    
    window.location.href = authUrl
  }

  // Rest of your methods remain the same...
  const sync = async () => {
    if (!session?.user) {
      console.error('User not authenticated')
      return
    }

    try {
      const response = await fetch('/api/splitwise/sync', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        await fetchExpenses()
      } else {
        console.error('Failed to sync Splitwise expenses')
      }
    } catch (error) {
      console.error('Error syncing Splitwise expenses:', error)
    }
  }

  const linkExpense = async (splitwiseId: string, expenseId?: string) => {
    if (!session?.user) {
      console.error('User not authenticated')
      return
    }

    try {
      const response = await fetch('/api/splitwise/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ splitwiseId, expenseId })
      })
      
      if (response.ok) {
        await fetchExpenses()
      } else {
        console.error('Failed to link expense')
      }
    } catch (error) {
      console.error('Error linking expense:', error)
    }
  }

  return {
    expenses,
    isConnected,
    loading: loading || status === 'loading',
    connect,
    sync,
    linkExpense,
    isAuthenticated: !!session?.user,
    user: session?.user,
    checkConnection // ✅ Export for manual refresh
  }
}
