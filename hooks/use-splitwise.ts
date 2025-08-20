
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { SplitwiseExpense } from '@/types'

export function useSplitwiseSync() {
  const [expenses, setExpenses] = useState<SplitwiseExpense[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkConnection()
    if (isConnected) {
      fetchExpenses()
    }
  }, [isConnected])

  const checkConnection = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('users')
      .select('splitwise_token, splitwise_token_exp')
      .eq('id', user.id)
      .single()

    setIsConnected(!!data?.splitwise_token && new Date() < new Date(data.splitwise_token_exp || 0))
    setLoading(false)
  }

  const fetchExpenses = async () => {
    const { data } = await supabase
      .from('splitwise_expenses')
      .select('*')
      .order('date', { ascending: false })

    setExpenses(data || [])
  }

  const connect = () => {
    const clientId = process.env.NEXT_PUBLIC_SPLITWISE_CLIENT_ID
    const redirectUri = `${window.location.origin}/api/auth/splitwise/callback`
    const authUrl = `https://secure.splitwise.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`
    
    window.location.href = authUrl
  }

  const sync = async () => {
    const response = await fetch('/api/splitwise/sync', { method: 'POST' })
    if (response.ok) {
      await fetchExpenses()
    }
  }

  const linkExpense = async (splitwiseId: string, expenseId?: string) => {
    const response = await fetch('/api/splitwise/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ splitwiseId, expenseId })
    })
    
    if (response.ok) {
      await fetchExpenses()
    }
  }

  return {
    expenses,
    isConnected,
    loading,
    connect,
    sync,
    linkExpense
  }
}